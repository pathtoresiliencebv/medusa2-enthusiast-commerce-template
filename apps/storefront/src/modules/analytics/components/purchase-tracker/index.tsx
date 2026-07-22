"use client"

import { trackCommerce } from "@lib/analytics"
import type { CommerceItem } from "@lib/analytics"
import { useEffect } from "react"

export default function PurchaseTracker({
  orderId,
  value,
  currency,
  items,
}: {
  orderId: string
  value: number
  currency: string
  items: CommerceItem[]
}) {
  useEffect(() => {
    const key = `lvro-purchase-${orderId}`
    if (window.localStorage.getItem(key)) return
    trackCommerce({ event: "purchase", transaction_id: orderId, cart_id: orderId, value, currency, items })
    window.localStorage.setItem(key, "1")
  }, [currency, items, orderId, value])
  return null
}
