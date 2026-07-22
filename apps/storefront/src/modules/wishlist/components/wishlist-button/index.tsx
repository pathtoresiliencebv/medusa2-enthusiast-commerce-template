"use client"

import { Heart } from "@medusajs/icons"
import { useEffect, useState } from "react"

export const WISHLIST_KEY = "lvro.nl-wishlist"

export type WishlistItem = {
  id: string
  handle: string
  title: string
  thumbnail?: string | null
  price?: string | null
}

function readWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return []

  try {
    return JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || "[]")
  } catch {
    return []
  }
}

export default function WishlistButton({
  item,
  className = "",
}: {
  item: WishlistItem
  className?: string
}) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(readWishlist().some((entry) => entry.id === item.id))
  }, [item.id])

  const toggle = () => {
    const current = readWishlist()
    const exists = current.some((entry) => entry.id === item.id)
    const next = exists
      ? current.filter((entry) => entry.id !== item.id)
      : [...current, item]

    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event("atelier-wishlist-change"))
    setSaved(!exists)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? "Verwijder uit favorieten" : "Bewaar als favoriet"}
      title={saved ? "Verwijder uit favorieten" : "Bewaar als favoriet"}
      className={`focus-brand flex h-11 w-11 items-center justify-center border border-[#dedbe9] bg-white text-[#15162a] transition-colors hover:bg-[#ff6b6b] ${className}`}
    >
      <Heart className={saved ? "fill-[#15162a] text-[#15162a]" : ""} />
    </button>
  )
}
