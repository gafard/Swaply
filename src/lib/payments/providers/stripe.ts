import { PaymentStatus } from "@prisma/client";
import Stripe from "stripe";

import { assert } from "@/lib/validations";

import type {
  PaymentInitContext,
  PaymentInitResult,
  PaymentProviderAdapter,
  PaymentReturnResult,
  PaymentWebhookResult,
} from "../types";
import { extractPaymentId, mapProviderStatus, toStripeAmount } from "../utils";

let cachedStripeClient: Stripe | null = null;

function getStripeClient() {
  if (cachedStripeClient) {
    return cachedStripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  assert(!!secretKey, "Provider Stripe non configuré.");
  cachedStripeClient = new Stripe(secretKey);

  return cachedStripeClient;
}

function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  assert(!!secret, "Webhook Stripe non configuré.");
  return secret;
}

async function buildCheckoutSession(context: PaymentInitContext): Promise<PaymentInitResult> {
  const stripe = getStripeClient();
  const currencyCode = context.payment.currencyCode.toLowerCase();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${context.returnUrl}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: context.cancelUrl,
    client_reference_id: context.payment.id,
    customer_email: context.payment.user.email ?? undefined,
    metadata: {
      paymentId: context.payment.id,
      userId: context.payment.userId,
      providerCode: context.payment.provider.code,
      packageId: context.payment.packageId ?? "",
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currencyCode,
          unit_amount: toStripeAmount(context.payment.localAmount, context.payment.currencyCode),
          product_data: {
            name: `${context.payment.swapsAmount} Swaps`,
            description: `Recharge Swaply via ${context.payment.provider.name}`,
          },
        },
      },
    ],
  });

  assert(!!session.url, "Stripe n'a pas retourné d'URL de paiement.");

  return {
    providerRef: session.id,
    status: PaymentStatus.PENDING,
    redirectUrl: session.url,
    message: "Redirection vers Stripe.",
    raw: session,
  };
}

async function parseStripeWebhook(request: Request): Promise<PaymentWebhookResult> {
  const stripe = getStripeClient();
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  assert(!!signature, "Signature Stripe manquante.");

  const event = stripe.webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    return {
      paymentId: session.metadata?.paymentId ?? session.client_reference_id ?? null,
      providerRef: session.id,
      status: session.payment_status === "paid" ? PaymentStatus.SUCCESS : PaymentStatus.PENDING,
      raw: event,
    };
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    return {
      paymentId: session.metadata?.paymentId ?? session.client_reference_id ?? null,
      providerRef: session.id,
      status: PaymentStatus.FAILED,
      raw: event,
    };
  }

  if (event.type === "checkout.session.async_payment_failed" || event.type === "payment_intent.payment_failed") {
    const object = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;
    const paymentId =
      "metadata" in object
        ? extractPaymentId(object.metadata as Record<string, any>)
        : null;

    return {
      paymentId,
      providerRef: object.id,
      status: PaymentStatus.FAILED,
      raw: event,
    };
  }

  return {
    status: PaymentStatus.PENDING,
    raw: event,
  };
}

async function resolveStripeReturn(params: {
  paymentId?: string | null;
  sessionId?: string | null;
  checkoutState?: string | null;
}): Promise<PaymentReturnResult> {
  if (params.checkoutState === "cancelled") {
    return {
      paymentId: params.paymentId ?? null,
      status: PaymentStatus.CANCELLED,
      message: "Paiement annulé.",
    };
  }

  if (!params.sessionId) {
    return {
      paymentId: params.paymentId ?? null,
      status: PaymentStatus.PENDING,
      message: "Paiement en attente de confirmation.",
    };
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(params.sessionId);

  return {
    paymentId: params.paymentId ?? session.metadata?.paymentId ?? session.client_reference_id ?? null,
    providerRef: session.id,
    status: mapProviderStatus(session.payment_status ?? session.status),
    message:
      session.payment_status === "paid"
        ? "Paiement confirmé."
        : "Paiement en attente de confirmation.",
  };
}

export const stripePaymentAdapter: PaymentProviderAdapter = {
  code: "stripe",
  initiatePayment: buildCheckoutSession,
  parseWebhook: parseStripeWebhook,
  resolveReturn: resolveStripeReturn,
};
