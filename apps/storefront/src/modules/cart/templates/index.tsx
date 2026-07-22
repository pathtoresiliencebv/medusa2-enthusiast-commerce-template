import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import CartUpsells from "../components/cart-upsells"

const CartTemplate = ({
  cart,
  customer,
  addOns,
  countryCode,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  addOns: HttpTypes.StoreProduct[]
  countryCode: string
}) => {
  return (
    <div className="bg-[#f7f6fb] py-10 small:py-16">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 gap-12 small:grid-cols-[minmax(0,1fr)_380px] small:gap-16">
            <div className="flex flex-col gap-y-6 bg-white p-5 small:p-8">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate cart={cart} />
              {!!addOns.length && (
                <CartUpsells products={addOns} countryCode={countryCode} />
              )}
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-8 sticky top-12">
                {cart && cart.region && (
                  <>
                    <div className="bg-white">
                      <Summary cart={cart} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
