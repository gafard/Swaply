import { PaymentStatus } from "@prisma/client";

import { assert } from "@/lib/validations";

import { getProviderEnv } from "../config";
import type {
  PaymentInitContext,
  PaymentInitResult,
  PaymentProviderAdapter,
  PaymentWebhookResult,
} from "../types";
import {
  extractPaymentId,
  extractProviderRef,
  extractStatus,
  parseJsonSafely,
} from "../utils";

function getGatewayConfig(providerCode: string) {
  const initUrl = getProviderEnv(providerCode, "INIT_URL");
  const apiKey = getProviderEnv(providerCode, "API_KEY");
  const authHeader = getProviderEnv(providerCode, "AUTH_HEADER") || "Authorization";
  const authScheme = getProviderEnv(providerCode, "AUTH_SCHEME") || "Bearer";
  const webhookSecret = getProviderEnv(providerCode, "WEBHOOK_SECRET") || null;

  assert(
    !!initUrl && !!apiKey,
    `Provider ${providerCode} non configuré. Variables ${providerCode.toUpperCase()} manquantes.`
  );

  return {
    initUrl,
    apiKey,
    authHeader,
    authScheme,
    webhookSecret,
  };
}

function buildAuthHeaderValue(authScheme: string, apiKey: string) {
  return authScheme.toLowerCase() === "none" ? apiKey : `${authScheme} ${apiKey}`;
}

function buildWebhookSecretHeader(request: Request) {
  return (
    request.headers.get("x-provider-webhook-secret") ||
    request.headers.get("x-payment-webhook-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    null
  );
}

async function initiateGenericGatewayPayment(
  providerCode: string,
  context: PaymentInitContext
): Promise<PaymentInitResult> {
  const config = getGatewayConfig(providerCode);

  const response = await fetch(config.initUrl!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [config.authHeader]: buildAuthHeaderValue(config.authScheme, config.apiKey!),
    },
    body: JSON.stringify({
      amount: context.payment.localAmount,
      currency: context.payment.currencyCode,
      swapsAmount: context.payment.swapsAmount,
      reference: context.payment.id,
      packageId: context.payment.packageId,
      providerCode,
      customer: {
        id: context.payment.user.id,
        email: context.payment.user.email,
        username: context.payment.user.username,
        phoneNumber: context.phoneNumber ?? null,
      },
      callbackUrl: context.webhookUrl,
      returnUrl: context.returnUrl,
      cancelUrl: context.cancelUrl,
      metadata: {
        paymentId: context.payment.id,
        userId: context.payment.user.id,
      },
    }),
  });

  const rawText = await response.text();
  const payload = parseJsonSafely(rawText) ?? { rawText };

  if (!response.ok) {
    throw new Error(
      typeof payload.message === "string"
        ? payload.message
        : `Provider ${providerCode} a refusé l'initiation du paiement.`
    );
  }

  return {
    providerRef: extractProviderRef(payload),
    status: extractStatus(payload),
    redirectUrl:
      (typeof payload.redirectUrl === "string" && payload.redirectUrl) ||
      (typeof payload.checkoutUrl === "string" && payload.checkoutUrl) ||
      (typeof payload.paymentUrl === "string" && payload.paymentUrl) ||
      null,
    message:
      (typeof payload.message === "string" && payload.message) ||
      `Paiement ${providerCode} initié.`,
    raw: payload,
  };
}

async function parseGenericGatewayWebhook(
  providerCode: string,
  request: Request
): Promise<PaymentWebhookResult> {
  const configuredSecret = getProviderEnv(providerCode, "WEBHOOK_SECRET") || null;
  const receivedSecret = buildWebhookSecretHeader(request);

  if (configuredSecret) {
    assert(receivedSecret === configuredSecret, "Webhook provider non autorisé.");
  }

  const rawText = await request.text();
  const payload = parseJsonSafely(rawText);
  assert(!!payload, "Payload webhook invalide.");

  return {
    paymentId: extractPaymentId(payload),
    providerRef: extractProviderRef(payload),
    status: extractStatus(payload),
    raw: payload,
  };
}

export function createGenericHttpPaymentAdapter(providerCode: string): PaymentProviderAdapter {
  return {
    code: providerCode,
    initiatePayment: (context) => initiateGenericGatewayPayment(providerCode, context),
    parseWebhook: (request) => parseGenericGatewayWebhook(providerCode, request),
    resolveReturn: async ({ paymentId, checkoutState, searchParams }) => ({
      paymentId: paymentId ?? searchParams.get("paymentId"),
      providerRef:
        searchParams.get("providerRef") ??
        searchParams.get("reference") ??
        searchParams.get("transactionId"),
      status:
        checkoutState === "cancelled"
          ? PaymentStatus.CANCELLED
          : extractStatus(Object.fromEntries(searchParams.entries())),
      message:
        checkoutState === "cancelled"
          ? "Paiement annulé."
          : "Retour provider reçu, confirmation en cours.",
    }),
  };
}
