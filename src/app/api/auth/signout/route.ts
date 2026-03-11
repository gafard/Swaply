import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ONBOARDING_COOKIE_NAME } from "@/lib/onboarding";
import { TERMS_COOKIE_NAME } from "@/lib/legal";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });

  response.cookies.delete(ONBOARDING_COOKIE_NAME);
  response.cookies.delete(TERMS_COOKIE_NAME);

  return response;
}
