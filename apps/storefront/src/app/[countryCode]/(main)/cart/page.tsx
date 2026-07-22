import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"

export const metadata: Metadata = {
  title: "Winkelmand",
  description:
    "Bekijk je geselecteerde meubels en rond je bestelling veilig af.",
  robots: { index: false, follow: false },
}

export default async function Cart({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()
  const cartProductIds = new Set(
    cart?.items?.map((item) => item.product_id).filter(Boolean) as string[]
  )
  const cartProducts = cartProductIds.size
    ? await listProducts({
        countryCode,
        queryParams: { id: Array.from(cartProductIds), limit: 20 },
        cache: "no-store",
      }).then(({ response }) => response.products)
    : []
  const categoryIds = Array.from(
    new Set(
      cartProducts.flatMap(
        (product) => product.categories?.map((category) => category.id) || []
      )
    )
  )
  const addOns = await listProducts({
    countryCode,
    queryParams: {
      limit: 12,
      ...(categoryIds.length ? { category_id: categoryIds } : {}),
    },
    cache: "no-store",
  }).then(({ response }) =>
    response.products
      .filter((product) => !cartProductIds.has(product.id))
      .slice(0, 2)
  )

  return (
    <CartTemplate
      cart={cart}
      customer={customer}
      addOns={addOns}
      countryCode={countryCode}
    />
  )
}
