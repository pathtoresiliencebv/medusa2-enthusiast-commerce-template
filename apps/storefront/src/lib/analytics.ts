"use client"

export type CommerceEventName =
  | "view_item" | "select_variant" | "add_to_cart" | "view_cart"
  | "begin_checkout" | "add_payment_info" | "purchase"
  | "select_quantity_tier" | "add_bundle" | "select_upsell"

export type CommerceItem = {
  item_id: string
  item_name?: string
  item_category?: string
  price?: number
  quantity?: number
}

export type CommerceEvent = {
  event: CommerceEventName
  product_id?: string
  variant_id?: string
  transaction_id?: string
  cart_id?: string
  bundle_id?: string
  quantity?: number
  value?: number
  currency?: string
  experiment?: string
  items?: CommerceItem[]
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    posthog?: { capture: (event: string, properties: Record<string, unknown>) => void }
  }
}

export function trackCommerce({ event, items, ...properties }: CommerceEvent) {
  if (typeof window === "undefined") return
  const normalizedItems = items || (properties.variant_id ? [{
    item_id: properties.variant_id,
    quantity: properties.quantity || 1,
  }] : undefined)
  const ecommerce = {
    ...(properties.transaction_id ? { transaction_id: properties.transaction_id } : {}),
    ...(properties.value !== undefined ? { value: properties.value } : {}),
    ...(properties.currency ? { currency: properties.currency } : {}),
    ...(normalizedItems ? { items: normalizedItems } : {}),
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ ecommerce: null })
  window.dataLayer.push({ event, ecommerce, ...properties })
  window.posthog?.capture(event, { ...properties, items: normalizedItems || [] })
}

export type SupportEventName =
  | "support_chat_opened"
  | "support_question_sent"
  | "support_answer_received"
  | "support_case_created"

export function trackSupport(event: SupportEventName, properties: { authenticated: boolean; category?: string }) {
  if (typeof window === "undefined") return
  // Deliberately no transcript, conversation/order identifiers or free text.
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...properties })
  window.posthog?.capture(event, properties)
}
