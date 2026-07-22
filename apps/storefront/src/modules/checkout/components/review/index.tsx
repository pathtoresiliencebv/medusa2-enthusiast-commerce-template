"use client"

import { Heading, Text, clx } from "@modules/common/components/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart?.total === 0
  )

  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "font-display flex flex-row items-baseline gap-x-2 text-2xl",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Controle en bestellen
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="mb-6 grid gap-3 rounded-[12px] bg-[#f4f2f9] p-4 text-xs leading-5 text-[#555366] small:grid-cols-3">
            <p>
              <strong className="block text-[#15162a]">30 dagen retour</strong>
              Rustig thuis beoordelen.
            </p>
            <p>
              <strong className="block text-[#15162a]">Tracking</strong>Na
              verzending per e-mail.
            </p>
            <p>
              <strong className="block text-[#15162a]">Hulp nodig?</strong>
              service@lvro.nl
            </p>
          </div>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="text-xs leading-6 text-ui-fg-subtle mb-1">
                Door je bestelling te plaatsen ga je akkoord met onze{" "}
                <LocalizedClientLink
                  href="/algemene-voorwaarden"
                  className="underline"
                >
                  algemene voorwaarden
                </LocalizedClientLink>{" "}
                en ons{" "}
                <LocalizedClientLink href="/retourneren" className="underline">
                  retourbeleid
                </LocalizedClientLink>
                . Je bevestigt ook dat je het{" "}
                <LocalizedClientLink
                  href="/privacybeleid"
                  className="underline"
                >
                  privacybeleid
                </LocalizedClientLink>{" "}
                van lvro.nl hebt gelezen.
              </Text>
            </div>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review
