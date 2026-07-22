"use client"

import { Button, Heading } from "@modules/common/components/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import { LockClosedSolid, TruckFast } from "@medusajs/icons"
import { trackCommerce } from "@lib/analytics"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  return (
    <div className="flex flex-col gap-y-5 border-t-4 border-[#15162a] bg-white p-6">
      <Heading level="h2" className="font-display text-3xl leading-tight">
        Overzicht
      </Heading>
      <div className="border border-[#dedbe9] p-4">
        <p className="flex items-center gap-2 text-xs font-bold">
          <TruckFast /> Verzendopties en exacte kosten zie je vóór betaling
        </p>
        <LocalizedClientLink
          href="/verzending"
          className="mt-3 inline-flex text-xs font-black underline underline-offset-4"
        >
          Bekijk verzendinformatie
        </LocalizedClientLink>
      </div>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        onClick={() =>
          trackCommerce({
            event: "begin_checkout",
            cart_id: cart.id,
            value: cart.total || 0,
            currency: cart.currency_code.toUpperCase(),
            items: (cart.items || []).flatMap((item) =>
              item.variant_id
                ? [{ item_id: item.variant_id, item_name: item.product_title || item.title, price: item.unit_price, quantity: item.quantity }]
                : []
            ),
          })
        }
      >
        <Button className="brand-button h-14 w-full">Veilig afrekenen</Button>
      </LocalizedClientLink>
      <p className="flex items-center justify-center gap-2 text-center text-xs leading-5 text-ui-fg-subtle">
        <LockClosedSolid /> Beveiligde checkout; beschikbare methode wordt
        getoond
      </p>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dedbe9] bg-white p-3 small:hidden">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-bold">Totaal incl. btw</span>
          <strong>
            {convertToLocale({
              amount: cart.total || 0,
              currency_code: cart.currency_code,
            })}
          </strong>
        </div>
        <LocalizedClientLink
          href={"/checkout?step=" + step}
          className="brand-button w-full"
        >
          Veilig afrekenen
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Summary
