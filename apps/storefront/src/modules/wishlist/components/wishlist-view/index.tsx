"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WishlistButton, {
  WISHLIST_KEY,
  WishlistItem,
} from "@modules/wishlist/components/wishlist-button"

function getItems() {
  try {
    return JSON.parse(
      window.localStorage.getItem(WISHLIST_KEY) || "[]"
    ) as WishlistItem[]
  } catch {
    return []
  }
}

export default function WishlistView() {
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    const update = () => setItems(getItems())
    update()
    window.addEventListener("atelier-wishlist-change", update)
    return () => window.removeEventListener("atelier-wishlist-change", update)
  }, [])

  if (!items.length) {
    return (
      <div className="content-container py-24 small:py-32">
        <p className="text-xs font-black uppercase text-[#666666]">
          Jouw selectie
        </p>
        <h1 className="font-display mt-4 max-w-2xl text-5xl leading-none small:text-7xl">
          Nog geen favorieten.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[#555555]">
          Bewaar meubels met het hart-icoon en vergelijk ze hier op je gemak.
        </p>
        <LocalizedClientLink href="/store" className="brand-button mt-8">
          Ontdek de collectie
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <main className="content-container py-16 small:py-24">
      <div className="mb-10 flex flex-col justify-between gap-5 small:flex-row small:items-end">
        <div>
          <p className="text-xs font-black uppercase text-[#666666]">
            Persoonlijke selectie
          </p>
          <h1 className="font-display mt-3 text-5xl small:text-7xl">
            Favorieten
          </h1>
        </div>
        <p className="text-sm text-[#555555]">
          {items.length} bewaarde meubels
        </p>
      </div>
      <ul className="grid gap-6 xsmall:grid-cols-2 medium:grid-cols-4">
        {items.map((item) => (
          <li key={item.id} className="relative">
            <LocalizedClientLink
              href={`/products/${item.handle}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#efedf8]">
                {item.thumbnail && (
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
              </div>
              <div className="pt-3">
                <h2 className="font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm font-black text-[#15162a]">
                  {item.price || "Bekijk prijs"}
                </p>
              </div>
            </LocalizedClientLink>
            <WishlistButton item={item} className="absolute right-3 top-3" />
          </li>
        ))}
      </ul>
    </main>
  )
}
