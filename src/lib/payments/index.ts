import { PaymentStatus, Prisma, WalletTxnType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { addSwaps } from "@/lib/swaps";
import prisma from "@/lib/prisma";
import { assert } from "@/lib/validations";

import { buildPaymentUrls, normalizeProviderCode } from "./config";
import { createGenericHttpPaymentAdapter } from "./providers/generic-http";
import { stripePaymentAdapter } from "./providers/stripe";
import { paymentInclude, type PaymentRecord, type PaymentProviderAdapter } from "./types";

function getPaymentAdapter(providerCode: string): PaymentProviderAdapter {
  const normalized = normalizeProviderCode(providerCode);

  if (normalized === "stripe") {
    return stripePaymentAdapter;
  }

  return createGenericHttpPaymentAdapter(normalized);
}

async function getPaymentById(paymentId: string) {
  return prisma.paymentTransaction.findUnique({
    where: { id: paymentId },
    include: paymentInclude,
  });
}

async function getPaymentByProviderRef(providerRef: string) {
  return prisma.paymentTransaction.findFirst({
    where: { providerRef },
    include: paymentInclude,
  });
}

function buildTopupDescription(payment: PaymentRecord) {
  return `Recharge ${payment.provider.name}`;
}

function revalidatePaymentViews(paymentId: string) {
  revalidatePath("/profile/wallet");
  revalidatePath("/payments/return");
  revalidatePath(`/payments/return?paymentId=${paymentId}`);
}

export async function settlePaymentSuccess(
  paymentId: string,
  options?: {
    providerRef?: string | null;
  }
) {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.paymentTransaction.findUnique({
      where: { id: paymentId },
      include: paymentInclude,
    });
    assert(!!payment, "Transaction de paiement introuvable.");

    const existingWalletTxn = await tx.walletTransaction.findFirst({
      where: {
        referenceId: payment.id,
        type: WalletTxnType.TOPUP,
        wallet: {
          userId: payment.userId,
        },
      },
      select: { id: true },
    });

    if (!existingWalletTxn) {
      await addSwaps(
        payment.userId,
        payment.swapsAmount,
        WalletTxnType.TOPUP,
        buildTopupDescription(payment),
        false,
        tx,
        payment.id
      );
    }

    const updatedPayment = await tx.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCESS,
        ...(options?.providerRef ? { providerRef: options.providerRef } : {}),
      },
      include: paymentInclude,
    });

    return {
      payment: updatedPayment,
      credited: !existingWalletTxn,
    };
  });

  revalidatePaymentViews(paymentId);
  return result;
}

export async function markPaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  options?: {
    providerRef?: string | null;
  }
) {
  const payment = await prisma.paymentTransaction.update({
    where: { id: paymentId },
    data: {
      status,
      ...(options?.providerRef ? { providerRef: options.providerRef } : {}),
    },
    include: paymentInclude,
  });

  revalidatePaymentViews(paymentId);
  return payment;
}

export async function createTopupPayment(input: {
  userId: string;
  packageId: string;
  providerCode: string;
  phoneNumber?: string | null;
  origin?: string | null;
}) {
  const paymentPackage = await prisma.topupPackage.findFirst({
    where: {
      id: input.packageId,
      isActive: true,
      paymentProvider: {
        code: normalizeProviderCode(input.providerCode),
        isActive: true,
      },
    },
    include: {
      paymentProvider: true,
      country: true,
    },
  });

  assert(!!paymentPackage, "Package de recharge introuvable.");

  const payment = await prisma.paymentTransaction.create({
    data: {
      userId: input.userId,
      countryId: paymentPackage.countryId,
      providerId: paymentPackage.paymentProviderId,
      packageId: paymentPackage.id,
      localAmount: paymentPackage.localAmount,
      currencyCode: paymentPackage.currencyCode,
      swapsAmount: paymentPackage.swapsAmount,
      status: PaymentStatus.PENDING,
    },
    include: paymentInclude,
  });

  const adapter = getPaymentAdapter(payment.provider.code);
  const urls = buildPaymentUrls(payment.provider.code, payment.id, input.origin);

  try {
    const providerResult = await adapter.initiatePayment({
      payment,
      baseUrl: urls.baseUrl,
      webhookUrl: urls.webhookUrl,
      returnUrl: urls.returnUrl,
      cancelUrl: urls.cancelUrl,
      phoneNumber: input.phoneNumber ?? null,
    });

    await prisma.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        ...(providerResult.providerRef ? { providerRef: providerResult.providerRef } : {}),
        status: providerResult.status,
      },
    });

    if (providerResult.status === PaymentStatus.SUCCESS) {
      await settlePaymentSuccess(payment.id, {
        providerRef: providerResult.providerRef,
      });
    } else if (
      providerResult.status === PaymentStatus.FAILED ||
      providerResult.status === PaymentStatus.CANCELLED
    ) {
      await markPaymentStatus(payment.id, providerResult.status, {
        providerRef: providerResult.providerRef,
      });
    }

    return {
      success: true,
      paymentId: payment.id,
      status: providerResult.status,
      redirectUrl: providerResult.redirectUrl ?? null,
      message:
        providerResult.message ??
        (providerResult.status === PaymentStatus.PENDING
          ? "Paiement initié."
          : "Paiement confirmé."),
    };
  } catch (error) {
    await markPaymentStatus(payment.id, PaymentStatus.FAILED);
    throw error;
  }
}

export async function getPaymentStatusForUser(paymentId: string, userId: string) {
  const payment = await prisma.paymentTransaction.findFirst({
    where: {
      id: paymentId,
      userId,
    },
    include: paymentInclude,
  });

  assert(!!payment, "Transaction de paiement introuvable.");

  const credited = await prisma.walletTransaction.findFirst({
    where: {
      referenceId: payment.id,
      type: WalletTxnType.TOPUP,
      wallet: {
        userId,
      },
    },
    select: { id: true },
  });

  return {
    paymentId: payment.id,
    status: payment.status,
    credited: !!credited,
    providerCode: payment.provider.code,
    providerName: payment.provider.name,
    swapsAmount: payment.swapsAmount,
  };
}

export async function processPaymentWebhook(providerCode: string, request: Request) {
  const adapter = getPaymentAdapter(providerCode);
  assert(!!adapter.parseWebhook, `Webhook non supporté pour ${providerCode}.`);

  const webhookResult = await adapter.parseWebhook(request);
  const payment =
    (webhookResult.paymentId ? await getPaymentById(webhookResult.paymentId) : null) ||
    (webhookResult.providerRef ? await getPaymentByProviderRef(webhookResult.providerRef) : null);

  assert(!!payment, "Transaction de paiement introuvable.");

  if (webhookResult.status === PaymentStatus.SUCCESS) {
    await settlePaymentSuccess(payment.id, {
      providerRef: webhookResult.providerRef ?? payment.providerRef,
    });
  } else if (
    webhookResult.status === PaymentStatus.FAILED ||
    webhookResult.status === PaymentStatus.CANCELLED
  ) {
    await markPaymentStatus(payment.id, webhookResult.status, {
      providerRef: webhookResult.providerRef ?? payment.providerRef,
    });
  }

  return {
    ok: true,
    paymentId: payment.id,
    status: webhookResult.status,
  };
}

export async function resolvePaymentReturn(input: {
  providerCode: string;
  paymentId?: string | null;
  sessionId?: string | null;
  checkoutState?: string | null;
  searchParams: URLSearchParams;
}) {
  const adapter = getPaymentAdapter(input.providerCode);
  const fallbackPayment = input.paymentId ? await getPaymentById(input.paymentId) : null;

  if (!adapter.resolveReturn) {
    return {
      payment: fallbackPayment,
      status: fallbackPayment?.status ?? PaymentStatus.PENDING,
      message: "Retour provider reçu.",
    };
  }

  const returnResult = await adapter.resolveReturn(input);
  const payment =
    (returnResult.paymentId ? await getPaymentById(returnResult.paymentId) : null) ||
    (returnResult.providerRef ? await getPaymentByProviderRef(returnResult.providerRef) : null) ||
    fallbackPayment;

  assert(!!payment, "Transaction de paiement introuvable.");

  if (returnResult.status === PaymentStatus.SUCCESS) {
    await settlePaymentSuccess(payment.id, {
      providerRef: returnResult.providerRef ?? payment.providerRef,
    });
  } else if (
    returnResult.status === PaymentStatus.CANCELLED ||
    returnResult.status === PaymentStatus.FAILED
  ) {
    await markPaymentStatus(payment.id, returnResult.status, {
      providerRef: returnResult.providerRef ?? payment.providerRef,
    });
  }

  const freshPayment = await getPaymentById(payment.id);
  assert(!!freshPayment, "Transaction de paiement introuvable.");

  return {
    payment: freshPayment,
    status: freshPayment.status,
    message:
      returnResult.message ??
      (freshPayment.status === PaymentStatus.SUCCESS
        ? "Paiement confirmé."
        : freshPayment.status === PaymentStatus.CANCELLED
          ? "Paiement annulé."
          : freshPayment.status === PaymentStatus.FAILED
            ? "Paiement refusé."
            : "Paiement en attente de confirmation."),
  };
}
