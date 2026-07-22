import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import CheckoutProgress from "@modules/checkout/components/checkout-progress"

export const metadata: Metadata = {
  title: "Veilig afrekenen",
  robots: { index: false, follow: false },
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <div className="content-container grid grid-cols-1 gap-6 py-6 small:grid-cols-[minmax(0,1fr)_400px] small:gap-x-10 small:py-10 medium:gap-x-16">
      <div className="min-w-0">
        <div className="mb-6 rounded-[18px] border border-[#dedbe9] bg-white p-5 small:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.12em] text-[#ff6b6b]">
                Snel en beveiligd afrekenen
              </p>
              <h1 className="font-display mt-2 text-4xl leading-none small:text-5xl">
                Bijna van jou.
              </h1>
            </div>
            <p className="text-xs leading-5 text-[#666276]">
              Geen account nodig · 30 dagen retour
            </p>
          </div>
          <CheckoutProgress cart={cart} />
        </div>
        <PaymentWrapper cart={cart}>
          <CheckoutForm cart={cart} customer={customer} />
        </PaymentWrapper>
      </div>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
