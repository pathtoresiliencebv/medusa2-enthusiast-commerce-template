import { Metadata } from "next"

import HyperHome from "@modules/home/components/hyper-home"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { absoluteUrl, localizedAlternates, siteSeo } from "@lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await params
  const alternates = localizedAlternates(countryCode)
  const canonical = alternates.canonical

  return {
    title: { absolute: siteSeo.title },
    description: siteSeo.description,
    alternates,
    openGraph: {
      title: siteSeo.title,
      description: siteSeo.description,
      url: canonical,
      siteName: siteSeo.name,
      type: "website",
      images: [
        {
          url: absoluteUrl("/brand/lvro-lockup-light.png"),
          width: 1448,
          height: 1086,
          alt: "lvro.nl — Living, redefined.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteSeo.title,
      description: siteSeo.description,
    },
  }
}

export const dynamic = "force-dynamic"

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 12,
      fields: "*variants.calculated_price,*images,*variants.options",
    },
  })

  return (
    <HyperHome products={products} region={region} countryCode={countryCode} />
  )
}
