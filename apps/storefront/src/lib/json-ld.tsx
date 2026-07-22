import { absoluteUrl, siteSeo } from "@lib/seo"
import { brand as storeBrand } from "@lib/brand"
import {
  BreadcrumbJsonLd as NextBreadcrumbJsonLd,
  OrganizationJsonLd as NextOrganizationJsonLd,
  ProductJsonLd as NextProductJsonLd,
} from "next-seo"
import type { ReactElement } from "react"

type GeneratedJsonLd = ReactElement<{ data: unknown }>

function JsonLdScript({ data, id }: { data: unknown; id: string }) {
  const json = JSON.stringify(data)
    .replace(/<\/script>/gi, "\\u003C/script>")
    .replace(/<!--/g, "\\u003C!--")
    .replace(/-->/g, "--\\u003E")

  return (
    <script
      type="application/ld+json"
      id={id}
      data-testid={id}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}

function NextSeoJsonLdScript({
  element,
  id,
}: {
  element: GeneratedJsonLd
  id: string
}) {
  return <JsonLdScript data={element.props.data} id={id} />
}

export function OrganizationJsonLd() {
  const element = NextOrganizationJsonLd({
    type: "OnlineStore",
    name: siteSeo.name,
    description: siteSeo.description,
    url: absoluteUrl("/nl"),
    logo: {
      url: absoluteUrl("/brand/lvro-lockup-light.png"),
      width: 1448,
      height: 1086,
    },
    email: storeBrand.email,
    contactPoint: {
      contactType: "customer service",
      telephone: storeBrand.phone,
      email: storeBrand.email,
    },
    hasMerchantReturnPolicy: {
      applicableCountry: ["NL", "BE"],
      returnPolicyCategory:
        "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      refundType: "https://schema.org/FullRefund",
    },
  }) as GeneratedJsonLd

  return <NextSeoJsonLdScript element={element} id="organization-jsonld" />
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ position: number; name: string; item: string }>
}) {
  const element = NextBreadcrumbJsonLd({
    items: items.map(({ name, item }) => ({ name, item })),
  }) as GeneratedJsonLd

  return <NextSeoJsonLdScript element={element} id="breadcrumb-jsonld" />
}

export function ItemListJsonLd({
  name,
  items,
}: {
  name: string
  items: Array<{ position: number; name: string; url: string }>
}) {
  return (
    <JsonLdScript
      id="product-list-jsonld"
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        numberOfItems: items.length,
        itemListElement: items.map((item) => ({
          "@type": "ListItem",
          position: item.position,
          name: item.name,
          url: item.url,
        })),
      }}
    />
  )
}

export function ProductJsonLd({
  name,
  description,
  image,
  sku,
  brand,
  category,
  url,
  offers,
  aggregateRating,
}: {
  name: string
  description: string
  image: string[]
  sku: string
  brand?: string
  category: string
  url: string
  offers: {
    price: number
    priceCurrency: string
    availability: string
    itemCondition: string
    url: string
    seller: { name: string }
  }
  aggregateRating?: { ratingValue: number; reviewCount: number }
}) {
  const element = NextProductJsonLd({
    name,
    description,
    image,
    sku,
    brand: brand ? { name: brand } : undefined,
    category,
    url,
    aggregateRating: aggregateRating
      ? {
          ratingValue: aggregateRating.ratingValue,
          reviewCount: aggregateRating.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    offers: {
      price: offers.price,
      priceCurrency: offers.priceCurrency,
      availability: offers.availability as "https://schema.org/InStock",
      itemCondition: offers.itemCondition as "https://schema.org/NewCondition",
      url: offers.url,
      seller: {
        "@type": "Organization",
        name: offers.seller.name,
        url: absoluteUrl("/nl"),
      },
      shippingDetails: {
        shippingRate: {
          value: 10,
          currency: offers.priceCurrency,
        },
        shippingDestination: [
          { addressCountry: "NL" },
          { addressCountry: "BE" },
        ],
      },
    },
  }) as GeneratedJsonLd

  return <NextSeoJsonLdScript element={element} id="product-jsonld" />
}
