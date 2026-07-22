import { Metadata } from "next"
import Image from "next/image"

import { brand } from "@lib/brand"
import { BreadcrumbJsonLd } from "@lib/json-ld"
import { absoluteUrl, localizedPageMetadata } from "@lib/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  return localizedPageMetadata({
    countryCode: (await params).countryCode,
    path: "/over-ons",
    title: "Over LVRO | Meubels met rust en karakter",
    description:
      "Maak kennis met LVRO: een online meubelwinkel met een scherpe selectie, heldere productinformatie en persoonlijke service.",
  })
}

const principles = [
  {
    title: "Selectie met richting",
    body: "Geen eindeloze rijen zonder samenhang. We brengen meubels bijeen die passen bij rustige, moderne interieurs met karakter.",
  },
  {
    title: "Helder voor je kiest",
    body: "Maten, prijs, levertijd en relevante productinformatie horen vóór de bestelling duidelijk te zijn.",
  },
  {
    title: "Service die bereikbaar blijft",
    body: `Heb je een vraag over een product, levering of retour? Je bereikt ons via ${brand.email} en op werkdagen telefonisch.`,
  },
] as const

export default async function AboutPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params

  return (
    <main className="overflow-hidden bg-white text-[#15162a]">
      <BreadcrumbJsonLd
        items={[
          { position: 1, name: "Home", item: absoluteUrl(`/${countryCode}`) },
          {
            position: 2,
            name: "Over ons",
            item: absoluteUrl(`/${countryCode}/over-ons`),
          },
        ]}
      />

      <section className="content-container grid min-h-[620px] gap-10 py-10 small:py-14 medium:grid-cols-[.88fr_1.12fr] medium:items-stretch">
        <div className="page-reveal flex max-w-2xl flex-col justify-center py-10 medium:py-16">
          <p className="text-xs font-black uppercase text-[#b93645]">
            Over LVRO
          </p>
          <h1 className="font-display mt-5 text-5xl leading-[.95] small:text-7xl">
            Een huis voelt beter als alles klopt.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#59586b] small:text-lg">
            LVRO helpt je meubels kiezen die rust brengen, goed passen en elke
            dag prettig blijven voelen.
          </p>
          <div className="mt-8">
            <LocalizedClientLink
              href="/store"
              className="focus-brand inline-flex min-h-12 items-center justify-center rounded-full bg-[#ff6b6b] px-7 text-xs font-black uppercase text-[#15162a] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Bekijk de collectie
            </LocalizedClientLink>
          </div>
        </div>

        <div className="page-reveal relative min-h-[390px] overflow-hidden rounded-[20px] medium:min-h-[570px]">
          <Image
            src="/editorial/lvro-about-interior.webp"
            alt="Modern woonkamerinterieur in de rustige LVRO-kleurwereld"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 56vw"
          />
        </div>
      </section>

      <section className="bg-[#f7f6fb] py-20 small:py-28">
        <div className="content-container grid gap-12 medium:grid-cols-[.75fr_1.25fr] medium:gap-24">
          <div>
            <h2 className="font-display text-4xl leading-none small:text-6xl">
              Minder zoeken. Beter kiezen.
            </h2>
          </div>
          <div className="max-w-2xl text-base leading-8 text-[#59586b]">
            <p>
              Een interieur ontstaat niet in één keer. Het groeit met meubels
              die qua vorm, schaal en gebruik bij jouw dagelijks leven passen.
              LVRO brengt die keuzes samen in een online collectie voor
              woonkamer, eetkamer, slaapkamer, werkruimte en meer.
            </p>
            <p className="mt-6">
              We willen dat je niet alleen ziet wat mooi is, maar ook begrijpt
              wat je bestelt. Daarom maken we praktische informatie zichtbaar en
              houden we service, retour en garantie makkelijk vindbaar.
            </p>
          </div>
        </div>
      </section>

      <section className="content-container py-20 small:py-28">
        <div className="grid gap-12 medium:grid-cols-[1.15fr_.85fr] medium:items-start medium:gap-20">
          <div className="relative min-h-[420px] overflow-hidden rounded-[20px] small:min-h-[560px]">
            <Image
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=88"
              alt="Lichte woonkamer met een rustige en uitgebalanceerde inrichting"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
          </div>

          <div className="grid gap-9 medium:pt-10">
            <h2 className="font-display text-4xl leading-none small:text-5xl">
              Waar we op letten
            </h2>
            {principles.map((principle, index) => (
              <article
                key={principle.title}
                className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-[#dedbe9] pt-6"
              >
                <p className="text-sm font-black text-[#b93645]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="text-lg font-black">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#59586b]">
                    {principle.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#efedf8] py-16 small:py-24">
        <div className="content-container grid gap-10 medium:grid-cols-[1.2fr_.8fr] medium:items-end">
          <div>
            <h2 className="font-display max-w-3xl text-5xl leading-none small:text-7xl">
              Jouw ruimte. Jouw ritme. Onze aandacht.
            </h2>
          </div>
          <div>
            <p className="max-w-md text-base leading-8 text-[#59586b]">
              Twijfel je over maat, materiaal of levering? We denken graag met
              je mee voordat je bestelt.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <LocalizedClientLink
                href="/service"
                className="focus-brand inline-flex min-h-12 items-center justify-center rounded-full bg-[#ff6b6b] px-7 text-xs font-black uppercase text-[#15162a] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Bekijk onze service
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/faq"
                className="focus-brand inline-flex min-h-12 items-center justify-center rounded-full border border-[#15162a] px-7 text-xs font-black uppercase text-[#15162a] transition-colors hover:bg-[#15162a] hover:text-white"
              >
                Lees de FAQ
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
