"use client"

import { HttpTypes } from "@medusajs/types"
import { CheckCircleSolid } from "@medusajs/icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const steps = [
  { key: "address", label: "Gegevens" },
  { key: "delivery", label: "Levering" },
  { key: "payment", label: "Betaling" },
  { key: "review", label: "Controleren" },
] as const

export default function CheckoutProgress({
  cart,
}: {
  cart: HttpTypes.StoreCart
}) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const activeKey = searchParams.get("step") || "address"
  const activeIndex = Math.max(
    steps.findIndex((step) => step.key === activeKey),
    0
  )
  const completed = {
    address: Boolean(
      cart.shipping_address && cart.billing_address && cart.email
    ),
    delivery: Boolean(cart.shipping_methods?.length),
    payment: Boolean(cart.payment_collection?.payment_sessions?.length),
    review: false,
  }

  return (
    <nav aria-label="Voortgang afrekenen" className="mt-7">
      <ol className="grid grid-cols-4">
        {steps.map((step, index) => {
          const canOpen = index <= activeIndex || completed[step.key]
          const isActive = index === activeIndex
          const isComplete = completed[step.key] && index < activeIndex

          return (
            <li key={step.key} className="relative">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-4 h-0.5 w-full ${
                    index <= activeIndex ? "bg-[#15162a]" : "bg-[#dedbe9]"
                  }`}
                />
              )}
              <button
                type="button"
                disabled={!canOpen}
                onClick={() =>
                  router.push(`${pathname}?step=${step.key}`, { scroll: false })
                }
                aria-current={isActive ? "step" : undefined}
                className="relative z-10 flex w-full flex-col items-center gap-2 disabled:cursor-default"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black ${
                    isActive || isComplete
                      ? "border-[#15162a] bg-[#15162a] text-white"
                      : "border-[#c8c3dd] bg-white text-[#777287]"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircleSolid className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`text-[9px] font-black uppercase tracking-wide small:text-[11px] ${
                    isActive ? "text-[#15162a]" : "text-[#777287]"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
