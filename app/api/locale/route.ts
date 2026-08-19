import { NextResponse } from "next/server";
import { SUPPORTED_LOCALES } from "@/lib/site";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const locale = (body as { locale?: unknown } | null)?.locale;

  if (typeof locale !== "string" || !(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  }

  const response = NextResponse.json({ locale });
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false, // read by the server only; kept readable for debugging
  });

  return response;
}
