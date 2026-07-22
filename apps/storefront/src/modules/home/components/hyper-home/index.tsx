import Image from "next/image"

import { absoluteUrl } from "@lib/seo"
import { getProductPrice } from "@lib/util/get-product-price"
import { BreadcrumbJsonLd } from "@lib/json-ld"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowPath, ShieldCheck, TruckFast } from "@medusajs/icons"
import { brand } from "@lib/brand"

const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=92",
    alt: "Moderne woonkamer met zachte bank",
  },
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=92",
    alt: "Eetkamer met houten tafel",
  },
  {
    src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=92",
    alt: "Groene bank in een modern interieur",
  },
]

const categories = [
  {
    title: "Woonkamer",
    href: "/categories/living-room-furniture",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=90",
  },
  {
    title: "Slaapkamer",
    href: "/categories/bedroom-furniture",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=90",
  },
  {
    title: "Werkruimte",
    href: "/categories/home-office-furniture",
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=90",
  },
  {
    title: "Eetkamer",
    href: "/categories/dining-room-furniture",
    image:
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=900&q=90",
  },
]

const assurances = [
  {
    title: "Heldere levering",
    body: "Kosten vooraf zichtbaar",
    icon: TruckFast,
  },
  { title: "30 dagen retour", body: "Rustig thuis kiezen", icon: ArrowPath },
  {
    title: "5 jaar garantie",
    body: "Op geselecteerde meubels",
    icon: ShieldCheck,
  },
]

export default function HyperHome({
  products,
  countryCode,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  const featured = products.slice(0, 4)

  return (
    <main className="bg-white text-[#15162a]">
      <BreadcrumbJsonLd
        items={[
          { position: 1, name: "Home", item: absoluteUrl(`/${countryCode}`) },
          {
            position: 2,
            name: "Meubels",
            item: absoluteUrl(`/${countryCode}/store`),
          },
        ]}
      />

      <section className="relative min-h-[610px] overflow-hidden bg-[#15162a] text-white small:min-h-[720px]">
        <div className="absolute inset-0 grid grid-cols-1 medium:grid-cols-3">
          {heroImages.map((image, index) => (
            <div
              key={image.src}
              className={`${
                index > 0 ? "hidden medium:block" : "block"
              } relative`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 34vw"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/10" />
        <div className="content-container relative z-10 flex min-h-[610px] items-end pb-10 small:min-h-[720px] small:pb-14">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-black uppercase text-white/80">
              New season / living 2026
            </p>
            <h1 className="font-display text-[45px] leading-[.94] text-white small:text-[76px] medium:text-[84px]">
              Meubels voor modern wonen
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-white/90 small:text-lg">
              Sterke vormen. Zacht comfort. Ontworpen om iedere dag beter te
              wonen.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <LocalizedClientLink href="/store" className="brand-button-light">
                Shop nieuw
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/categories/sofas"
                className="focus-brand inline-flex min-h-12 items-center justify-center rounded-full border border-white px-7 text-xs font-black uppercase text-white transition-colors hover:bg-white hover:text-[#15162a]"
              >
                Shop banken
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dedbe9] bg-white">
        <div className="content-container grid grid-cols-1 divide-y divide-[#dedbe9] xsmall:grid-cols-3 xsmall:divide-x xsmall:divide-y-0">
          {assurances.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex items-center gap-3 px-2 py-5 xsmall:justify-center"
              >
                <Icon className="shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase">{item.title}</p>
                  <p className="mt-1 text-xs text-[#666666]">{item.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="content-container py-12 small:py-20">
        <SectionHeader
          title="Shop per categorie"
          href="/store"
          action="Bekijk alles"
        />
        <div className="grid grid-cols-2 gap-2 medium:grid-cols-4 medium:gap-4">
          {categories.map((category) => (
            <LocalizedClientLink
              key={category.title}
              href={category.href}
              className="group"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#f7f6fb]">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <h2 className="text-sm font-black uppercase small:text-base">
                  {category.title}
                </h2>
                <span aria-hidden="true">-&gt;</span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </section>

      <section className="grid bg-[#15162a] text-white medium:grid-cols-2">
        <div className="relative min-h-[500px] medium:min-h-[700px]">
          <Image
            src="https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1400&q=92"
            alt="Moderne woonkamer met karaktervolle meubels"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="flex items-center px-5 py-14 small:px-12 medium:px-16">
          <div className="max-w-xl">
            <p className="text-xs font-black uppercase text-[#ff6b6b]">
              The living edit
            </p>
            <h2 className="font-display mt-4 text-5xl leading-[.96] small:text-7xl">
              Maak ruimte voor beter
            </h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/72">
              Een scherpe selectie banken, fauteuils en tafels die direct rust
              en karakter aan je ruimte geeft.
            </p>
            <LocalizedClientLink
              href="/store"
              className="brand-button-light mt-8"
            >
              Bekijk de edit
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f6fb] py-12 small:py-20">
        <div className="content-container">
          <SectionHeader
            title="Nieuw binnen"
            href="/store"
            action="Shop de collectie"
          />
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 medium:grid-cols-4 medium:gap-x-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="content-container grid gap-4 py-12 small:py-20 medium:grid-cols-2">
        <CampaignTile
          title="Zacht wonen"
          body="Linnen, bouclé en diepe zitvormen voor lange avonden thuis."
          href="/categories/sofas"
          image="https://images.unsplash.com/photo-1550226891-ef816aed4a98?auto=format&fit=crop&w=1400&q=90"
        />
        <CampaignTile
          title="Sterk aan tafel"
          body="Massief hout en heldere lijnen voor iedere dag."
          href="/categories/tables"
          image="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=90"
        />
      </section>

      <section className="bg-[#ff6b6b] py-12 text-[#15162a] small:py-16">
        <div className="content-container flex flex-col justify-between gap-7 medium:flex-row medium:items-center">
          <div>
            <p className="text-xs font-black uppercase">
              Gratis interieuradvies
            </p>
            <h2 className="font-display mt-2 max-w-3xl text-4xl leading-none small:text-6xl">
              Twijfel over maat of materiaal?
            </h2>
          </div>
          <LocalizedClientLink
            href="/service"
            className="brand-button shrink-0"
          >
            Plan advies
          </LocalizedClientLink>
        </div>
      </section>
    </main>
  )
}

function ProductCard({ product }: { product: HttpTypes.StoreProduct }) {
  const { cheapestPrice } = getProductPrice({ product })
  const image = product.thumbnail || product.images?.[0]?.url
  const badge =
    typeof product.metadata?.badge === "string"
      ? product.metadata.badge
      : undefined

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] border border-[#dedbe9] bg-[#efedf8] shadow-[0_8px_30px_rgba(42,35,82,0.05)]">
        {image && (
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-[#ff6b6b] px-2.5 py-1 text-[10px] font-black uppercase text-[#15162a]">
            {badge}
          </span>
        )}
      </div>
      <div className="pt-3">
        <h3 className="text-sm font-bold leading-5">{product.title}</h3>
        <p className="mt-1 text-sm text-[#666666]">
          {product.subtitle || `${brand.name} collectie`}
        </p>
        <p className="mt-2 text-base font-black text-[#6554c0]">
          {cheapestPrice?.calculated_price || "Bekijk"}
        </p>
      </div>
    </LocalizedClientLink>
  )
}

function CampaignTile({
  title,
  body,
  href,
  image,
}: {
  title: string
  body: string
  href: string
  image: string
}) {
  return (
    <LocalizedClientLink
      href={href}
      className="group relative min-h-[520px] overflow-hidden rounded-[20px] bg-[#15162a] text-white"
    >
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 small:p-9">
        <h2 className="font-display text-4xl leading-none small:text-6xl">
          {title}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-white/82">{body}</p>
        <p className="mt-5 text-xs font-black uppercase">Shop nu -&gt;</p>
      </div>
    </LocalizedClientLink>
  )
}

function SectionHeader({
  title,
  action,
  href,
}: {
  title: string
  action: string
  href: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 small:mb-8">
      <h2 className="font-display text-3xl leading-none small:text-5xl">
        {title}
      </h2>
      <LocalizedClientLink
        href={href}
        className="text-xs font-black uppercase hover:underline"
      >
        {action} -&gt;
      </LocalizedClientLink>
    </div>
  )
}
