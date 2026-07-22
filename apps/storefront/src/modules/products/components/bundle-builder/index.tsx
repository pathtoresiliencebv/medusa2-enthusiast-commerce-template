"use client"

import { addBundleToCart } from "@lib/data/conversion"
import { trackCommerce } from "@lib/analytics"
import { CheckCircleSolid, SquaresPlus } from "@medusajs/icons"
import { useRouter } from "next/navigation"
import { useState } from "react"

import type { ConversionBundle } from "../../../../types/conversion"

export default function BundleBuilder({
  bundle,
  countryCode,
}: {
  bundle: ConversionBundle
  countryCode: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const addBundle = async () => {
    setLoading(true)
    setAdded(false)
    try {
      await addBundleToCart({ handle: bundle.handle, countryCode })
      trackCommerce({ event: "add_bundle", bundle_id: bundle.id })
      setAdded(true)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="mt-7 border border-[#15162a] p-5"
      aria-labelledby="bundle-title"
    >
      <div className="flex items-start gap-3">
        <SquaresPlus className="mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] font-black uppercase text-[#666666]">
            Complete set
          </p>
          <h2 id="bundle-title" className="mt-1 text-lg font-black uppercase">
            {bundle.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#555555]">
            {bundle.description}
          </p>
          <p className="mt-3 inline-flex bg-[#ff6b6b] px-2 py-1 text-xs font-black uppercase">
            {bundle.discount_percentage}% bundelvoordeel
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={addBundle}
        disabled={loading}
        className="brand-button mt-5 w-full"
      >
        {loading ? "Bundel toevoegen..." : "Voeg complete set toe"}
      </button>
      {added && (
        <p
          className="mt-3 flex items-center gap-2 text-xs font-bold"
          role="status"
        >
          <CheckCircleSolid /> Bundel toegevoegd aan je winkelmand.
        </p>
      )}
    </section>
  )
}
