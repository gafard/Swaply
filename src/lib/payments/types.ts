import { PaymentStatus, Prisma } from "@prisma/client";

export const paymentInclude = {
  provider: true,
  package: true,
  user: {
    select: {
      id: true,
      email: true,
      username: true,
    },
  },
} satisfies Prisma.PaymentTransactionInclude;

export type PaymentRecord = Prisma.PaymentTransactionGetPayload<{
  include: typeof paymentInclude;
}>;

export type PaymentInitContext = {
  payment: PaymentRecord;
  baseUrl: string;
  webhookUrl: string;
  returnUrl: string;
  cancelUrl: string;
  phoneNumber?: string | null;
};

export type PaymentInitResult = {
  providerRef?: string | null;
  status: PaymentStatus;
  redirectUrl?: string | null;
  message?: string;
  raw?: unknown;
};

export type PaymentWebhookResult = {
  paymentId?: string | null;
  providerRef?: string | null;
  status: PaymentStatus;
  raw?: unknown;
};

export type PaymentReturnResult = {
  paymentId?: string | null;
  providerRef?: string | null;
  status: PaymentStatus;
  message?: string;
};

export interface PaymentProviderAdapter {
  code: string;
  initiatePayment(context: PaymentInitContext): Promise<PaymentInitResult>;
  parseWebhook?(request: Request): Promise<PaymentWebhookResult>;
  resolveReturn?(params: {
    paymentId?: string | null;
    sessionId?: string | null;
    checkoutState?: string | null;
    searchParams: URLSearchParams;
  }): Promise<PaymentReturnResult>;
}
