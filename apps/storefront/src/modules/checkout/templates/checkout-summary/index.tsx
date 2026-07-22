import { Heading } from "@modules/common/components/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { LockClosedSolid, ShieldCheck, TruckFast } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  return (
    <div className="order-first small:order-last small:sticky small:top-6 small:self-start">
      <details
        open
        className="overflow-hidden rounded-[18px] border border-[#dedbe9] bg-white small:hidden"
      >
        <summary className="flex cursor-pointer items-center justify-between p-5 font-black uppercase">
          Besteloverzicht <span>{cart.items?.length || 0} items</span>
        </summary>
        <SummaryContent cart={cart} />
      </details>
      <div className="hidden overflow-hidden rounded-[18px] small:block">
        <SummaryContent cart={cart} />
      </div>
    </div>
  )
}

function SummaryContent({ cart }: { cart: HttpTypes.StoreCart }) {
  return (
    <div className="flex w-full flex-col border-t-4 border-[#15162a] bg-white p-5 small:p-6">
      <Heading
        level="h2"
        className="font-display flex flex-row items-baseline text-3xl"
      >
        Jouw bestelling
      </Heading>
      <Divider className="my-5" />
      <ItemsPreviewTemplate cart={cart} />
      <Divider className="my-5" />
      <CartTotals totals={cart} />
      <div className="mt-5">
        <DiscountCode cart={cart} />
      </div>
      <p className="mt-5 text-xs leading-5 text-[#666666]">
        Inclusief btw. Verzendkosten en levertijd worden bevestigd voor
        betaling.
      </p>
      <div className="mt-5 grid gap-3 border-t border-[#dedbe9] pt-5 text-xs text-[#555366]">
        <p className="flex items-center gap-2">
          <LockClosedSolid className="h-4 w-4 shrink-0" /> Beveiligde checkout
        </p>
        <p className="flex items-center gap-2">
          <TruckFast className="h-4 w-4 shrink-0" /> Tracking na verzending
        </p>
        <p className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" /> 30 dagen retour en
          wettelijke garantie
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#666276] underline underline-offset-4">
        <LocalizedClientLink href="/verzending">Verzending</LocalizedClientLink>
        <LocalizedClientLink href="/retourneren">
          Retourbeleid
        </LocalizedClientLink>
        <LocalizedClientLink href="/garantie">Garantie</LocalizedClientLink>
      </div>
    </div>
  )
}

export default CheckoutSummary
