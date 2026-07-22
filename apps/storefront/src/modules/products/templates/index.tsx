import React, { Suspense } from "react"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { ArrowPath, ShieldCheck, TruckFast } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import WishlistButton from "@modules/wishlist/components/wishlist-button"
import { notFound } from "next/navigation"

import ProductActionsWrapper from "./product-actions-wrapper"
import type { ProductConversion } from "../../../types/conversion"
import ProductReviews from "@modules/products/components/product-reviews"
import BundleBuilder from "@modules/products/components/bundle-builder"
import ViewItemTracker from "@modules/analytics/components/view-item-tracker"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
  conversion: ProductConversion | null
}

const assurances = [
  {
    icon: TruckFast,
    title: "Levering tot in de kamer",
    body: "Voorraadartikelen binnen 3-5 werkdagen",
  },
  {
    icon: ArrowPath,
    title: "30 dagen retour",
    body: "Rustig thuis beslissen",
  },
  {
    icon: ShieldCheck,
    title: "Veilig betalen",
    body: "iDEAL, kaart en beveiligde checkout",
  },
]

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
  conversion,
}) => {
  if (!product || !product.id) return notFound()

  const { cheapestPrice } = getProductPrice({ product })
  const primaryCategory = product.categories?.[0]

  return (
    <>
      <main className="bg-white pb-28 lg:pb-0" data-testid="product-container">
        <ViewItemTracker
          productId={product.id}
          variantId={product.variants?.[0]?.id}
          title={product.title}
          value={cheapestPrice?.calculated_price ? Number(cheapestPrice.calculated_price) : undefined}
        />
        <div className="content-container py-5">
          <nav
            className="flex flex-wrap items-center gap-2 text-xs text-[#666666]"
            aria-label="Broodkruimel"
          >
            <LocalizedClientLink href="/">Home</LocalizedClientLink>
            <span aria-hidden="true">/</span>
            <LocalizedClientLink href="/store">Collectie</LocalizedClientLink>
            {primaryCategory?.handle && (
              <>
                <span aria-hidden="true">/</span>
                <LocalizedClientLink
                  href={`/categories/${primaryCategory.handle}`}
                >
                  {primaryCategory.name}
                </LocalizedClientLink>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span className="text-[#15162a]">{product.title}</span>
          </nav>
        </div>

        <div className="content-container grid gap-8 pb-14 medium:grid-cols-[minmax(0,1.55fr)_minmax(360px,.7fr)] medium:items-start medium:gap-12">
          <ImageGallery images={images} title={product.title} />

          <aside className="rounded-[18px] border border-[#dedbe9] bg-white p-5 shadow-[0_12px_40px_rgba(42,35,82,0.08)] medium:sticky medium:top-40 small:p-7">
            <ProductInfo product={product} rating={conversion?.rating} />
            <div className="mt-7 border-t border-[#dedbe9] pt-6">
              <Suspense
                fallback={
                  <ProductActions disabled product={product} region={region} />
                }
              >
                <ProductActionsWrapper
                  id={product.id}
                  region={region}
                  conversion={conversion}
                />
              </Suspense>
            </div>
            <WishlistButton
              item={{
                id: product.id,
                handle: product.handle || product.id,
                title: product.title,
                thumbnail: product.thumbnail,
                price: cheapestPrice?.calculated_price,
              }}
              className="mt-3 w-full gap-2"
            />

            <div className="mt-7 divide-y divide-[#dedbe9] border-y border-[#dedbe9]">
              {assurances.map((item) => {
                const Icon = item.icon

                return (
                  <div key={item.title} className="flex gap-4 py-4">
                    <Icon className="shrink-0 text-[#15162a]" />
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-[#666666]">{item.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {!!conversion?.bundles.length && (
              <BundleBuilder
                bundle={conversion.bundles[0]}
                countryCode={countryCode}
              />
            )}
          </aside>
        </div>

        <section className="border-y border-[#dedbe9] bg-[#f7f6fb]">
          <div className="content-container grid gap-10 py-14 medium:grid-cols-[.7fr_1.3fr] medium:py-20">
            <div>
              <p className="text-xs font-black uppercase text-[#666666]">
                Product details
              </p>
              <h2 className="font-display mt-3 text-4xl leading-none small:text-5xl">
                Alles wat je wilt weten
              </h2>
            </div>
            <ProductTabs product={product} />
          </div>
        </section>

        <ProductReviews
          reviews={conversion?.reviews || []}
          rating={
            conversion?.rating || {
              average: 0,
              count: 0,
              distribution: [5, 4, 3, 2, 1].map((score) => ({
                score,
                count: 0,
              })),
            }
          }
        />
      </main>

      <div
        className="content-container my-20 small:my-28"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
