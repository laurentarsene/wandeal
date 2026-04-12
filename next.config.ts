import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "source.unsplash.com" },
      { hostname: "images.unsplash.com" },
      { hostname: "upload.wikimedia.org" },
    ],
  },
};

export default withNextIntl(nextConfig);
