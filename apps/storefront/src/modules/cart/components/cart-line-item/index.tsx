"use client"

import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { Minus, Plus, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LineItemOptions from "@modules/common/components/line-item-options"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

export default function CartLineItem({
  item,
  currencyCode,
}: {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
}) {
  const [loading, setLoading] = useState(false)
  const metadata = (item.metadata || {}) as Record<string, unknown>
  const discount = Number(metadata.quantity_discount_percentage || 0)
  const baseUnitPrice = Number(metadata.base_unit_price || item.unit_price || 0)

  const updateQuantity = async (quantity: number) => {
    if (quantity < 1 || quantity > 10) return
    setLoading(true)
    await updateLineItem({
      lineId: item.id,
      productId: item.product_id!,
      variantId: item.variant_id!,
      quantity,
    }).finally(() => setLoading(false))
  }

  const remove = async () => {
    setLoading(true)
    await deleteLineItem(item.id).finally(() => setLoading(false))
  }

  return (
    <article
      className={`grid grid-cols-[96px_1fr] gap-4 py-6 small:grid-cols-[140px_1fr_auto] ${
        loading ? "opacity-60" : ""
      }`}
    >
      <LocalizedClientLink
        href={`/products/${item.product_handle}`}
        className="block"
      >
        <Thumbnail
          thumbnail={item.thumbnail}
          images={item.variant?.product?.images}
          size="square"
          className="rounded-none bg-[#efedf8] shadow-none"
        />
      </LocalizedClientLink>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <LocalizedClientLink
              href={`/products/${item.product_handle}`}
              className="font-black hover:underline"
            >
              {item.product_title}
            </LocalizedClientLink>
            <LineItemOptions
              variant={item.variant}
              data-testid="product-variant"
            />
          </div>
          <div className="text-right small:hidden">
            <p className="font-black">
              {convertToLocale({
                amount: item.total || 0,
                currency_code: currencyCode,
              })}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs font-bold text-[#28723f]">
          Levering binnen 3-5 werkdagen
        </p>
        {discount > 0 && (
          <p className="mt-2 inline-flex bg-[#ff6b6b] px-2 py-1 text-[10px] font-black uppercase">
            {discount}% hoeveelheidvoordeel toegepast
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div
            className="flex h-10 items-center border border-[#c8c3dd]"
            aria-label="Aantal"
          >
            <button
              type="button"
              onClick={() => updateQuantity(item.quantity - 1)}
              className="flex h-10 w-10 items-center justify-center"
              aria-label="Aantal verlagen"
            >
              <Minus />
            </button>
            <span className="min-w-8 text-center text-sm font-bold">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.quantity + 1)}
              className="flex h-10 w-10 items-center justify-center"
              aria-label="Aantal verhogen"
            >
              <Plus />
            </button>
          </div>
          <button
            type="button"
            onClick={remove}
            className="flex min-h-10 items-center gap-2 text-xs font-bold text-[#666666] hover:text-black"
          >
            <Trash /> Verwijderen
          </button>
        </div>
      </div>

      <div className="hidden min-w-[120px] text-right small:block">
        {discount > 0 && (
          <p className="text-xs text-[#777777] line-through">
            {convertToLocale({
              amount: baseUnitPrice * item.quantity,
              currency_code: currencyCode,
            })}
          </p>
        )}
        <p className="mt-1 text-lg font-black">
          {convertToLocale({
            amount: item.total || 0,
            currency_code: currencyCode,
          })}
        </p>
        <p className="mt-1 text-xs text-[#666666]">incl. btw</p>
      </div>
    </article>
  )
}
