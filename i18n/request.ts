import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

import { SUPPORTED_LOCALES } from "../lib/site";

const DEFAULT_LOCALE = "fr";

async function getLocale(): Promise<string> {
  // 1. Check cookie
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  if (cookieLocale && (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const headerStore = await headers();
  const acceptLang = headerStore.get("accept-language") || "";
  const preferred = acceptLang
    .split(",")
    .map((part) => part.split(";")[0].trim().split("-")[0])
    .find((lang) => (SUPPORTED_LOCALES as readonly string[]).includes(lang));

  return preferred || DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const locale = await getLocale();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
