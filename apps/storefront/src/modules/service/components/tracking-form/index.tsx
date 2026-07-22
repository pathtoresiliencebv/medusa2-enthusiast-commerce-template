"use client"

import { FormEvent, useMemo, useState } from "react"

const trackingPattern = /^[A-Za-z0-9][A-Za-z0-9\s-]{4,48}[A-Za-z0-9]$/

export default function TrackingForm() {
  const [input, setInput] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [error, setError] = useState("")

  const trackingUrl = useMemo(() => {
    if (!trackingNumber) return ""
    return `https://t.17track.net/nl#nums=${encodeURIComponent(trackingNumber)}`
  }, [trackingNumber])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleaned = input.trim().replace(/\s+/g, "")

    if (!trackingPattern.test(cleaned)) {
      setError("Vul een geldig trackingnummer van 6 tot 50 tekens in.")
      return
    }

    setError("")
    setTrackingNumber(cleaned)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="tracking-number" className="text-sm font-black">
          Trackingnummer
        </label>
        <div className="mt-3 grid gap-3 small:grid-cols-[1fr_auto]">
          <input
            id="tracking-number"
            name="tracking-number"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Bijvoorbeeld 3SABCD1234567"
            autoComplete="off"
            inputMode="text"
            aria-describedby={error ? "tracking-error" : "tracking-help"}
            className="min-h-14 rounded-full border border-[#cac6d8] bg-white px-6 text-base outline-none transition focus:border-[#15162a] focus:ring-2 focus:ring-[#ff6b6b]"
          />
          <button type="submit" className="brand-button min-h-14 px-8">
            Volg pakket
          </button>
        </div>
        <p id="tracking-help" className="mt-3 text-xs leading-5 text-[#666276]">
          Je vindt dit nummer in de verzendbevestiging. Na verzenden kan de
          eerste scan enkele uren duren.
        </p>
        {error && (
          <p
            id="tracking-error"
            role="alert"
            className="mt-3 text-sm font-bold text-red-700"
          >
            {error}
          </p>
        )}
      </form>

      {trackingUrl && (
        <div className="mt-8 overflow-hidden rounded-[16px] border border-[#dedbe9] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dedbe9] bg-[#f4f2f9] px-5 py-4">
            <p className="text-sm font-black">Tracking voor {trackingNumber}</p>
            <a
              href={trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-black uppercase underline underline-offset-4"
            >
              Open apart venster
            </a>
          </div>
          <iframe
            title={`Pakketstatus voor ${trackingNumber}`}
            src={trackingUrl}
            className="h-[760px] w-full bg-white"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          />
        </div>
      )}
    </div>
  )
}
