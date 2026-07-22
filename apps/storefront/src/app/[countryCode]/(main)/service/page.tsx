import { Metadata } from "next"
import Image from "next/image"
import { brand } from "@lib/brand"
import { absoluteUrl, localizedPageMetadata } from "@lib/seo"
import { BreadcrumbJsonLd } from "@lib/json-ld"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  return localizedPageMetadata({
    countryCode: (await params).countryCode,
    path: "/service",
    title: "Service, levering en interieuradvies",
    description:
      "Lees alles over levering, retour, garantie en gratis interieuradvies van lvro.nl.",
  })
}

const services = [
  {
    id: "levering",
    number: "01",
    title: "Levering tot in de kamer",
    body: "Voorraadartikelen arriveren doorgaans binnen 3-5 werkdagen. Voor grote meubels stemmen we het bezorgmoment waar mogelijk vooraf met je af.",
    href: "/levering",
  },
  {
    id: "retour",
    number: "02",
    title: "30 dagen rustig beslissen",
    body: "Een meubel moet in je huis kloppen. Meld je retour binnen 30 dagen aan; we leggen vooraf helder uit hoe ophalen en terugbetaling werken.",
    href: "/retourneren",
  },
  {
    id: "garantie",
    number: "03",
    title: "Garantie die duidelijk blijft",
    body: "Je hebt altijd recht op een deugdelijk product. Op geselecteerde meubels geldt daarnaast vijf jaar aanvullende garantie.",
    href: "/garantie",
  },
]

export default function ServicePage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  return <ServiceContent params={params} />
}

async function ServiceContent({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params

  return (
    <main>
      <BreadcrumbJsonLd
        items={[
          { position: 1, name: "Home", item: absoluteUrl(`/${countryCode}`) },
          {
            position: 2,
            name: "Service",
            item: absoluteUrl(`/${countryCode}/service`),
          },
        ]}
      />
      <section className="grid bg-[#15162a] text-white medium:grid-cols-2">
        <div className="flex min-h-[500px] items-end px-6 py-16 small:px-12 medium:px-16">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase text-[#ff6b6b]">
              Service zonder kleine lettertjes
            </p>
            <h1 className="font-display mt-4 text-5xl leading-[.95] small:text-7xl">
              Service die net zo sterk is als je interieur
            </h1>
          </div>
        </div>
        <div className="relative min-h-[420px] medium:min-h-[650px]">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=90"
            alt="Rustige woonkamer met zorgvuldig gekozen meubels"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="content-container py-20 small:py-28">
        <div className="grid gap-12 medium:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              id={service.id}
              className="border-t-4 border-[#15162a] pt-5"
            >
              <p className="text-xs font-black text-[#666666]">
                {service.number}
              </p>
              <h2 className="font-display mt-5 text-4xl leading-none">
                {service.title}
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#555555]">
                {service.body}
              </p>
              <LocalizedClientLink
                href={service.href}
                className="mt-6 inline-flex text-xs font-black uppercase underline decoration-[#ff6b6b] decoration-2 underline-offset-4"
              >
                Lees alle informatie
              </LocalizedClientLink>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#ff6b6b] py-16 small:py-20">
        <div className="content-container grid gap-10 medium:grid-cols-[1.2fr_.8fr] medium:items-end">
          <div>
            <p className="text-xs font-black uppercase text-[#15162a]">
              Gratis interieuradvies
            </p>
            <h2 className="font-display mt-4 max-w-3xl text-5xl leading-none small:text-7xl">
              Een selectie die past bij jouw ruimte en ritme.
            </h2>
          </div>
          <div>
            <p className="text-base leading-8 text-[#292929]">
              Stuur foto&apos;s, maten en je wensen. We reageren op werkdagen
              binnen 24 uur met een eerste richting.
            </p>
            <a
              href={`mailto:${brand.email}?subject=Interieuradvies`}
              className="brand-button mt-7"
            >
              Mail onze adviseur
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
