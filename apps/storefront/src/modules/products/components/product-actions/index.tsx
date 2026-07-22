"use client"

import { addTieredToCart } from "@lib/data/conversion"
import { useIntersection } from "@lib/hooks/use-in-view"
import { trackCommerce } from "@lib/analytics"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@modules/common/components/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import type {
  ProductConversion,
  QuantityTier,
} from "../../../../types/conversion"
import { CheckCircleSolid, TruckFast } from "@medusajs/icons"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  conversion?: ProductConversion | null
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
  conversion,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [addedMessage, setAddedMessage] = useState("")
  const countryCode = useParams().countryCode as string

  // Start with the linked variant or the first available configuration so ATC is immediately usable.
  useEffect(() => {
    if (!Object.keys(options).length && product.variants?.length) {
      const linkedVariant = product.variants.find(
        (variant) => variant.id === searchParams.get("v_id")
      )
      const availableVariant = product.variants.find(
        (variant) =>
          !variant.manage_inventory ||
          variant.allow_backorder ||
          (variant.inventory_quantity || 0) > 0
      )
      const variantOptions = optionsAsKeymap(
        (linkedVariant || availableVariant || product.variants[0]).options
      )
      setOptions(variantOptions ?? {})
    }
  }, [options, product.variants, searchParams])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
    trackCommerce({
      event: "select_variant",
      product_id: product.id,
      variant_id: selectedVariant?.id,
    })
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    try {
      const result = await addTieredToCart({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      })

      setAddedMessage(
        result.discount_percentage
          ? `${quantity} stuks toegevoegd met ${result.discount_percentage}% voordeel.`
          : "Toegevoegd aan je winkelmand."
      )
      trackCommerce({
        event: "add_to_cart",
        product_id: product.id,
        variant_id: selectedVariant.id,
        quantity,
        value: (selectedVariant.calculated_price?.calculated_amount || 0) * quantity,
        currency: "EUR",
        items: [{
          item_id: selectedVariant.id,
          item_name: product.title,
          price: selectedVariant.calculated_price?.calculated_amount ?? undefined,
          quantity,
        }],
      })
      router.push(`/${countryCode}/cart`)
    } finally {
      setIsAdding(false)
    }
  }

  const tiers: QuantityTier[] = conversion?.merchandising.quantity_tiers || [
    { quantity: 1, discount_percentage: 0, label: "1 stuk" },
  ]

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      swatches={conversion?.merchandising.swatches}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <div className="my-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase">Kies aantal</p>
            <p className="text-xs text-[#555555]">
              Voordeel wordt automatisch toegepast
            </p>
          </div>
          <div className="grid gap-2 xsmall:grid-cols-3">
            {tiers.map((tier) => (
              <button
                key={tier.quantity}
                type="button"
                onClick={() => {
                  setQuantity(tier.quantity)
                  trackCommerce({
                    event: "select_quantity_tier",
                    product_id: product.id,
                    quantity: tier.quantity,
                  })
                }}
                className={clx(
                  "relative min-h-[68px] border px-3 text-left text-xs transition-colors",
                  quantity === tier.quantity
                    ? "border-[#15162a] bg-[#15162a] text-white"
                    : "border-[#c8c3dd] bg-white hover:border-[#15162a]"
                )}
                aria-pressed={quantity === tier.quantity}
              >
                <span className="block font-black uppercase">
                  {tier.quantity}x
                </span>
                <span
                  className={
                    quantity === tier.quantity
                      ? "text-white/70"
                      : "text-[#666666]"
                  }
                >
                  {tier.discount_percentage
                    ? `${tier.discount_percentage}% voordeel`
                    : "Standaard prijs"}
                </span>
                {tier.discount_percentage > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff6b6b]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        <div className="my-3 grid gap-2 text-xs">
          <p className="flex items-center gap-2 font-bold">
            <TruckFast />{" "}
            {conversion?.merchandising.delivery_label ||
              "Levering binnen 3-5 werkdagen"}
          </p>
          <p className="text-[#666666]">
            {conversion?.merchandising.financing_label ||
              "Beschikbare betaalmethode zichtbaar bij afrekenen"}
          </p>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant
          }
          variant="primary"
          className="brand-button min-h-14 w-full"
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant
            ? "Kies een uitvoering"
            : !inStock || !isValidVariant
            ? "Niet op voorraad"
            : `In winkelmand - ${quantity}x`}
        </Button>
        {addedMessage && (
          <p
            className="flex items-center gap-2 bg-[#edfbc4] p-3 text-xs font-bold"
            role="status"
          >
            <CheckCircleSolid /> {addedMessage}
          </p>
        )}
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
          quantity={quantity}
          swatches={conversion?.merchandising.swatches}
        />
      </div>
    </>
  )
}
