import type { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import { localizedAlternates, siteSeo } from "@lib/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await params
  return {
    title: `Meubelcollecties | ${siteSeo.name}`,
    description:
      "Bekijk alle LVRO-meubelcollecties per ruimte: woonkamer, eetkamer, slaapkamer, keuken, badkamer en meer.",
    alternates: localizedAlternates(countryCode, "/collecties"),
  }
}

export default async function CollectionsPage() {
  const { collections } = await listCollections({ fields: "*products" })
  const visibleCollections = collections.filter(
    (collection) =>
      collection.handle !== "wonen-accessoires" && collection.products?.length
  )

  return (
    <main className="bg-[#f7f6fb] py-12 text-[#15162a] small:py-20">
      <div className="content-container">
        <p className="text-xs font-black uppercase text-[#6554c0]">
          Shop per ruimte
        </p>
        <h1 className="font-display mt-3 max-w-4xl text-5xl leading-none small:text-7xl">
          Onze collecties
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#555555]">
          Vind sneller wat bij jouw interieur past. Iedere collectie brengt
          meubels en accessoires voor één ruimte overzichtelijk samen.
        </p>

        <div className="mt-10 grid gap-4 small:grid-cols-2 medium:grid-cols-3">
          {visibleCollections.map((collection, index) => (
            <LocalizedClientLink
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group min-h-52 rounded-[18px] border border-[#dedbe9] bg-white p-6 shadow-[0_8px_30px_rgba(42,35,82,0.05)] transition hover:-translate-y-1 hover:border-[#6554c0]"
            >
              <span className="text-xs font-black uppercase text-[#6554c0]">
                Collectie {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display mt-8 text-4xl leading-none">
                {collection.title}
              </h2>
              <p className="mt-4 text-sm text-[#666666]">
                {collection.products?.length || 0} producten
              </p>
              <p className="mt-6 text-xs font-black uppercase group-hover:underline">
                Bekijk collectie -&gt;
              </p>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </main>
  )
}
