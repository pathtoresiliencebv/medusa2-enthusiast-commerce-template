"use client"

import { trackCommerce } from "@lib/analytics"
import { useEffect } from "react"

export default function ViewItemTracker({
  productId, variantId, title, value,
}: { productId: string; variantId?: string; title: string; value?: number }) {
  useEffect(() => {
    trackCommerce({
      event: "view_item",
      product_id: productId,
      variant_id: variantId,
      value,
      currency: "EUR",
      items: variantId ? [{ item_id: variantId, item_name: title, price: value, quantity: 1 }] : [],
    })
  }, [productId, title, value, variantId])
  return null
}
