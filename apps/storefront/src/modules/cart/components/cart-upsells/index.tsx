"use client"

import { addToCart } from "@lib/data/cart"
import { trackCommerce } from "@lib/analytics"
import { getProductPrice } from "@lib/util/get-product-price"
import { Plus } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CartUpsells({
  products,
  countryCode,
}: {
  products: HttpTypes.StoreProduct[]
  countryCode: string
}) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const add = async (product: HttpTypes.StoreProduct) => {
    const variant = product.variants?.[0]
    if (!variant?.id) return
    setLoadingId(product.id)
    try {
      await addToCart({ variantId: variant.id, quantity: 1, countryCode })
      trackCommerce({
        event: "select_upsell",
        product_id: product.id,
        variant_id: variant.id,
        quantity: 1,
      })
      router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <section className="border-t border-[#dedbe9] pt-7">
      <p className="text-xs font-black uppercase text-[#666666]">
        Relevante aanvulling
      </p>
      <h2 className="mt-2 text-xl font-black uppercase">
        Maak je bestelling compleet
      </h2>
      <div className="mt-5 grid gap-3 xsmall:grid-cols-2">
        {products.map((product) => {
          const { cheapestPrice } = getProductPrice({ product })
          return (
            <article
              key={product.id}
              className="grid grid-cols-[84px_1fr] gap-3 border border-[#dedbe9] p-3"
            >
              <LocalizedClientLink href={`/products/${product.handle}`}>
                <Thumbnail
                  thumbnail={product.thumbnail}
                  images={product.images}
                  size="square"
                  className="rounded-none bg-[#efedf8] shadow-none"
                />
              </LocalizedClientLink>
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-bold">
                  {product.title}
                </h3>
                <p className="mt-1 text-sm font-black">
                  {cheapestPrice?.calculated_price}
                </p>
                <button
                  type="button"
                  onClick={() => add(product)}
                  disabled={loadingId === product.id}
                  className="mt-3 flex min-h-9 items-center gap-1 text-xs font-black uppercase hover:underline"
                >
                  <Plus />{" "}
                  {loadingId === product.id ? "Toevoegen..." : "Snel toevoegen"}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
