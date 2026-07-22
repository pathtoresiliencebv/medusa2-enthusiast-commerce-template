import { getBaseURL } from "@lib/util/env"
import { siteSeo, absoluteUrl } from "@lib/seo"
import { OrganizationJsonLd } from "@lib/json-ld"
import AnalyticsConsent from "@modules/analytics/components/analytics-consent"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: siteSeo.title,
    template: `%s | ${siteSeo.name}`,
  },
  description: siteSeo.description,
  applicationName: siteSeo.name,
  openGraph: {
    type: "website",
    locale: siteSeo.locale,
    url: absoluteUrl("/nl"),
    siteName: siteSeo.name,
    title: siteSeo.title,
    description: siteSeo.description,
    images: [
      {
        url: absoluteUrl("/brand/lvro-lockup-light.png"),
        width: 1448,
        height: 1086,
        alt: "lvro.nl — Living, redefined.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteSeo.title,
    description: siteSeo.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="nl" data-mode="light">
      <body className="bg-white text-[#15162a] antialiased">
        <OrganizationJsonLd />
        <main className="relative">{props.children}</main>
        <AnalyticsConsent />
      </body>
    </html>
  )
}
