"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const CONSENT_KEY = "lvro.nl-analytics-consent"
const consentState = (granted: boolean) => ({
  analytics_storage: granted ? "granted" : "denied",
  ad_storage: granted ? "granted" : "denied",
  ad_user_data: granted ? "granted" : "denied",
  ad_personalization: granted ? "granted" : "denied",
})

export default function AnalyticsConsent() {
  const pathname = usePathname()
  const [consent, setConsent] = useState<"accepted" | "essential" | null>(null)
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const hasMobileBuyBar = pathname.includes("/products/")

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY)
    if (stored === "accepted" || stored === "essential") setConsent(stored)
    const reopen = () => setConsent(null)
    window.addEventListener("lvro:open-cookie-settings", reopen)
    return () => window.removeEventListener("lvro:open-cookie-settings", reopen)
  }, [])

  useEffect(() => {
    if (!consent) return
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(["consent", "update", consentState(consent === "accepted")])
  }, [consent])

  useEffect(() => {
    if (consent !== "accepted" || !posthogKey) return
    import("posthog-js").then(({ default: posthog }) => {
      posthog.init(posthogKey, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
        person_profiles: "identified_only", autocapture: false,
        capture_pageview: true, persistence: "localStorage+cookie",
      })
    })
  }, [consent, posthogKey])

  const choose = (value: "accepted" | "essential") => {
    window.localStorage.setItem(CONSENT_KEY, value)
    setConsent(value)
    if (value === "essential" && posthogKey) {
      import("posthog-js").then(({ default: posthog }) => {
        if (posthog.__loaded) { posthog.opt_out_capturing(); posthog.reset() }
      })
    }
  }

  return (
    <>
      <Script id="lvro-consent-default" strategy="beforeInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`}
      </Script>
      {consent === "accepted" && gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="lvro-google-tags" strategy="afterInteractive">
            {`gtag('js',new Date());gtag('consent','update',{analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});gtag('config','${gaId}',{anonymize_ip:true});${adsId ? `gtag('config','${adsId}');` : ""}`}
          </Script>
        </>
      )}
      {consent === "accepted" && gtmId && (
        <Script id="lvro-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
      {consent === null && (
        <div className={`fixed inset-x-3 z-[100] border border-[#15162a] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,.2)] small:bottom-3 small:left-auto small:max-w-[460px] ${hasMobileBuyBar ? "bottom-[calc(8.5rem+env(safe-area-inset-bottom))]" : "bottom-3"}`}>
          <p className="text-sm font-black uppercase">Jouw privacy</p>
          <p className="mt-2 text-xs leading-5 text-[#555555]">Met toestemming meten we aankopen en advertentieprestaties. Essentiële cookies zijn nodig voor winkelmand en checkout.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => choose("essential")} className="min-h-11 border border-[#15162a] px-3 text-xs font-black uppercase">Alleen essentieel</button>
            <button type="button" onClick={() => choose("accepted")} className="brand-button min-h-11 px-3">Accepteren</button>
          </div>
        </div>
      )}
    </>
  )
}
