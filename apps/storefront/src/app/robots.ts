import { MetadataRoute } from "next"

import { absoluteUrl } from "@lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/*/checkout",
        "/*/account",
        "/*/cart",
        "/*/wishlist",
        "/*/search",
        "/*/order/",
        "/*/verify-account",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  }
}
