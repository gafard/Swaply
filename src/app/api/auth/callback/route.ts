import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { TERMS_VERSION } from "@/lib/legal";

function safePath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const locale = url.searchParams.get("locale") ?? "fr";
  const next = safePath(url.searchParams.get("next"));
  const acceptedTerms = url.searchParams.get("acceptedTerms") === "1";
  const acceptedAt = url.searchParams.get("termsAcceptedAt") ?? new Date().toISOString();
  const acceptedVersion = url.searchParams.get("termsVersion") ?? TERMS_VERSION;

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (acceptedTerms) {
    await supabase.auth.updateUser({
      data: {
        accepted_terms_at: acceptedAt,
        accepted_terms_version: acceptedVersion,
      },
    });
  }

  const redirectUrl = new URL("/api/auth/bootstrap", request.url);
  redirectUrl.searchParams.set("locale", locale);
  redirectUrl.searchParams.set("next", next);

  return NextResponse.redirect(redirectUrl);
}
