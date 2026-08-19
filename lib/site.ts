/**
 * Public identity of the site. The legal notice is required in Belgium (and the
 * EU generally) for any site that earns revenue, and Travelpayouts expects an
 * identifiable publisher before paying out — so these values must be real.
 */
export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://wandeal.com",
  name: "Wandeal",
  /** Legal publisher: full name or company name. Override with NEXT_PUBLIC_SITE_OWNER. */
  owner: process.env.NEXT_PUBLIC_SITE_OWNER || "Arsène Laurent",
  /** Contact address shown in the legal notice. Override with NEXT_PUBLIC_SITE_EMAIL. */
  email: process.env.NEXT_PUBLIC_SITE_EMAIL || "contact+wandeal@asidequest.com",
  /** Last substantive update of the legal notice. */
  legalUpdated: "2026-08-19",
} as const;

export const SUPPORTED_LOCALES = ["fr", "en", "it", "pt", "es", "hi", "de", "nl"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
