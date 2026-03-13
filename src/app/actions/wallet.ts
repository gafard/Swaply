"use server";

import { PaymentStatus } from "@prisma/client";

import { getCurrentUser } from "@/lib/auth";
import { actionFail, actionOk } from "@/lib/actions/result";
import { TopUpSchema } from "@/lib/validations";
import { createTopupPayment, getPaymentStatusForUser } from "@/lib/payments";
import { isPhoneBasedProvider, normalizeProviderCode } from "@/lib/payments/config";

export async function topUpSwaps(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return actionFail("auth_required");
  }

  const rawData = {
    packageId: formData.get("packageId")?.toString().trim() || "",
    providerCode: normalizeProviderCode(formData.get("providerCode")?.toString() || ""),
    phoneNumber: formData.get("phoneNumber")?.toString().trim() || "",
    origin: formData.get("origin")?.toString().trim() || "",
  };

  const validation = TopUpSchema.safeParse(rawData);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return actionFail(firstError.path[0] === "packageId" ? "package_required" : "provider_required");
  }

  const { packageId, providerCode, phoneNumber, origin } = validation.data;

  if (!user.countryId) {
    return actionFail("country_required");
  }

  if (!packageId) {
    return actionFail("package_required");
  }

  if (!providerCode) {
    return actionFail("provider_required");
  }

  if (isPhoneBasedProvider(providerCode)) {
    if (!phoneNumber || phoneNumber.length < 8) {
      return actionFail("phone_invalid");
    }
  }

  try {
    const result = await createTopupPayment({
      userId: user.id,
      packageId,
      providerCode,
      phoneNumber: phoneNumber || null,
      origin: origin || null,
    });

    return actionOk("payment_created", {
      paymentId: result.paymentId,
      status: result.status,
      redirectUrl: result.redirectUrl,
      providerMessageCode:
        result.status === PaymentStatus.SUCCESS ? "payment_confirmed" : "payment_pending",
    });
  } catch {
    return actionFail("payment_failed");
  }
}

export async function getTopupPaymentStatus(paymentId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return actionFail("auth_required");
  }

  if (!paymentId?.trim()) {
    return actionFail("payment_not_found");
  }

  try {
    const status = await getPaymentStatusForUser(paymentId.trim(), user.id);
    return actionOk("payment_status_loaded", status);
  } catch {
    return actionFail("payment_not_found");
  }
}
