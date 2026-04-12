import { NextResponse } from "next/server";

const SUPPORTED = ["fr", "en", "it", "pt", "es", "hi", "de", "nl"];

export async function POST(request: Request) {
  const { locale } = await request.json();

  if (!SUPPORTED.includes(locale)) {
    return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  }

  const response = NextResponse.json({ locale });
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}
