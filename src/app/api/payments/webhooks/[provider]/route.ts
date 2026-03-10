import { NextResponse } from "next/server";

import { processPaymentWebhook } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await context.params;
    const result = await processPaymentWebhook(provider, request);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook provider invalide.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
