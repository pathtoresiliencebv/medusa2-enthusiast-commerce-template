import { Heading } from "@modules/common/components/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"
import PurchaseTracker from "@modules/analytics/components/purchase-tracker"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CheckCircleSolid, TruckFast } from "@medusajs/icons"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f4f4f4] py-10">
      <PurchaseTracker
        orderId={order.id}
        value={order.total || 0}
        currency={order.currency_code.toUpperCase()}
        items={(order.items || []).flatMap((item) =>
          item.variant_id
            ? [{ item_id: item.variant_id, item_name: item.product_title || item.title, price: item.unit_price, quantity: item.quantity }]
            : []
        )}
      />
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex h-full w-full max-w-4xl flex-col gap-4 border-t-4 border-[#15162a] bg-white p-6 small:p-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="font-display mb-4 flex flex-col gap-y-3 text-4xl text-ui-fg-base small:text-5xl"
          >
            <span className="flex items-center gap-3">
              <CheckCircleSolid /> Bedankt voor je bestelling
            </span>
          </Heading>
          <p className="flex items-center gap-2 bg-[#edfbc4] p-4 text-sm font-bold">
            <TruckFast /> We bevestigen de verwachte bezorgdag per e-mail.
          </p>
          <OrderDetails order={order} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            Overzicht
          </Heading>
          <Items order={order} />
          <CartTotals totals={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <div className="mt-4 bg-[#ff6b6b] p-6">
            <p className="text-xs font-black uppercase">
              Maak de ruimte compleet
            </p>
            <h2 className="font-display mt-2 text-3xl">
              Bekijk bijpassende accessoires
            </h2>
            <LocalizedClientLink href="/store" className="brand-button mt-5">
              Verder winkelen
            </LocalizedClientLink>
          </div>
          <Help />
        </div>
      </div>
    </div>
  )
}
