"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheTag } from "@lib/data/cookies"
import { revalidateTag } from "next/cache"

import type { ProductConversion } from "../../types/conversion"
import { getOrSetCart } from "./cart"

export async function getProductConversion(productId: string) {
  const headers = { ...(await getAuthHeaders()) }

  return sdk.client
    .fetch<ProductConversion>(`/store/conversion/products/${productId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then((conversion) => ({
      ...conversion,
      reviews: conversion.reviews.map((review) => ({
        id: review.id,
        author_name: review.author_name,
        title: review.title,
        body: review.body,
        rating: review.rating,
        verified_purchase: review.verified_purchase,
        helpful_count: review.helpful_count,
        media: review.media,
        created_at: review.created_at,
        source: review.source,
        source_created_at: review.source_created_at,
      })),
    }))
    .catch(() => null)
}

export async function addTieredToCart({
  productId,
  variantId,
  quantity,
  countryCode,
}: {
  productId: string
  variantId: string
  quantity: number
  countryCode: string
}) {
  const cart = await getOrSetCart(countryCode)
  if (!cart) throw new Error("Winkelmand kon niet worden aangemaakt.")

  const headers = { ...(await getAuthHeaders()) }
  const result = await sdk.client.fetch<{
    quantity: number
    discount_percentage: number
    unit_price: number
  }>("/store/conversion/line-items", {
    method: "POST",
    headers,
    body: {
      cart_id: cart.id,
      product_id: productId,
      variant_id: variantId,
      quantity,
    },
  })

  revalidateTag(await getCacheTag("carts"))
  revalidateTag(await getCacheTag("fulfillment"))
  return result
}

export async function addBundleToCart({
  handle,
  countryCode,
}: {
  handle: string
  countryCode: string
}) {
  const cart = await getOrSetCart(countryCode)
  if (!cart) throw new Error("Winkelmand kon niet worden aangemaakt.")

  const headers = { ...(await getAuthHeaders()) }
  const result = await sdk.client.fetch<{
    bundle_id: string
    items_added: number
  }>("/store/conversion/bundles", {
    method: "POST",
    headers,
    body: { cart_id: cart.id, handle },
  })

  revalidateTag(await getCacheTag("carts"))
  revalidateTag(await getCacheTag("fulfillment"))
  return result
}
