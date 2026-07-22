import { Metadata } from "next"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"

type SearchPageProps = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = (await searchParams).q?.trim()

  return {
    title: query ? `Zoeken naar ${query}` : "Zoeken",
    description: query
      ? `Bekijk meubels voor ${query} bij lvro.nl.`
      : "Zoek in de meubelcollectie van lvro.nl.",
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { countryCode } = await params
  const query = (await searchParams).q?.trim() || ""
  const region = await getRegion(countryCode)

  if (!region) return null

  const {
    response: { products, count },
  } = query
    ? await listProducts({
        countryCode,
        queryParams: { q: query, limit: 48 },
      })
    : { response: { products: [], count: 0 } }

  return (
    <main className="content-container py-14 small:py-20">
      <p className="text-xs font-black uppercase text-[#666666]">
        Zoekresultaten
      </p>
      <h1 className="font-display mt-3 text-5xl leading-none small:text-7xl">
        {query ? `Zoeken naar "${query}"` : "Waar ben je naar op zoek?"}
      </h1>
      <p className="mt-5 text-sm text-[#555555]">
        {query
          ? `${count} resultaten gevonden`
          : "Gebruik de zoekbalk bovenaan de pagina."}
      </p>

      {products.length ? (
        <ul className="mt-12 grid grid-cols-2 gap-x-2 gap-y-10 small:grid-cols-3 medium:grid-cols-4 medium:gap-x-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>
      ) : query ? (
        <div className="mt-12 border-t border-[#dedbe9] py-12">
          <h2 className="font-display text-3xl">
            Geen passende meubels gevonden.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#555555]">
            Probeer een categorie, materiaal of kortere zoekterm zoals bank,
            eiken of stoel.
          </p>
        </div>
      ) : null}
    </main>
  )
}
