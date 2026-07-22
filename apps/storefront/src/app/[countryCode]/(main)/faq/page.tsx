import { Metadata } from "next"
import Image from "next/image"

import { brand } from "@lib/brand"
import { BreadcrumbJsonLd } from "@lib/json-ld"
import { absoluteUrl, localizedPageMetadata } from "@lib/seo"
import { supportFaqGroups } from "@lib/support-knowledge"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  return localizedPageMetadata({
    countryCode: (await params).countryCode,
    path: "/faq",
    title: "Veelgestelde vragen over bestellen, levering en retour",
    description:
      "Vind duidelijke antwoorden over bestellen, betalen, levering, retour, garantie en contact met de klantenservice van LVRO.",
  })
}

const allFaqs = supportFaqGroups.flatMap((group) => group.items)

export default async function FaqPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return (
    <main className="overflow-hidden bg-white text-[#15162a]">
      <BreadcrumbJsonLd
        items={[
          { position: 1, name: "Home", item: absoluteUrl(`/${countryCode}`) },
          {
            position: 2,
            name: "Veelgestelde vragen",
            item: absoluteUrl(`/${countryCode}/faq`),
          },
        ]}
      />
      <script
        type="application/ld+json"
        id="faq-jsonld"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="content-container grid min-h-[560px] gap-10 py-10 small:py-14 medium:grid-cols-[.9fr_1.1fr] medium:items-stretch">
        <div className="page-reveal flex max-w-2xl flex-col justify-center py-10 medium:py-16">
          <p className="text-xs font-black uppercase text-[#b93645]">
            Snel het juiste antwoord
          </p>
          <h1 className="font-display mt-5 text-5xl leading-[.95] small:text-7xl">
            Vragen? Hier begint duidelijkheid.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#59586b] small:text-lg">
            Van levering en retour tot betaling en garantie. Hier vind je
            duidelijke antwoorden, zonder omwegen.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${brand.email}`}
              className="focus-brand inline-flex min-h-12 items-center justify-center rounded-full bg-[#ff6b6b] px-7 text-xs font-black uppercase text-[#15162a] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Stel je vraag
            </a>
            <LocalizedClientLink
              href="/track-en-trace"
              className="focus-brand inline-flex min-h-12 items-center justify-center rounded-full border border-[#15162a] px-7 text-xs font-black uppercase text-[#15162a] transition-colors hover:bg-[#15162a] hover:text-white"
            >
              Volg bestelling
            </LocalizedClientLink>
          </div>
        </div>

        <div className="page-reveal relative min-h-[360px] overflow-hidden rounded-[20px] medium:min-h-[520px]">
          <Image
            src="/editorial/lvro-about-interior.webp"
            alt="Modern interieur in rustige grijs- en koraaltinten"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        </div>
      </section>

      <section className="bg-[#f7f6fb] py-16 small:py-24">
        <div className="content-container grid gap-12 medium:grid-cols-[.55fr_1.45fr] medium:gap-20">
          <div className="medium:sticky medium:top-28 medium:self-start">
            <h2 className="font-display text-4xl leading-none small:text-5xl">
              Alles voor een zorgeloze bestelling
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#59586b]">
              Staat jouw vraag er niet tussen? Onze klantenservice is op
              werkdagen bereikbaar van 09:00 tot 17:30.
            </p>
            <p className="mt-5 text-sm font-black">{brand.phone}</p>
            <a
              href={`mailto:${brand.email}`}
              className="mt-2 inline-flex text-sm font-black underline decoration-[#ff6b6b] decoration-2 underline-offset-4"
            >
              {brand.email}
            </a>
          </div>

          <div className="grid gap-12">
            {supportFaqGroups.map((group) => (
              <section key={group.id} aria-labelledby={group.id}>
                <h2
                  id={group.id}
                  className="font-display mb-5 text-3xl leading-tight"
                >
                  {group.title}
                </h2>
                <div className="overflow-hidden rounded-[16px] border border-[#dedbe9] bg-white">
                  {group.items.map((item) => (
                    <details
                      key={item.question}
                      className="faq-item group border-b border-[#dedbe9] last:border-b-0"
                    >
                      <summary className="focus-brand flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 text-left text-base font-black marker:content-none small:px-7">
                        <span>{item.question}</span>
                        <span
                          aria-hidden="true"
                          className="faq-mark flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#efedf8] text-xl font-normal transition-transform duration-300"
                        >
                          +
                        </span>
                      </summary>
                      <div className="faq-answer px-5 pb-6 pr-16 text-sm leading-7 text-[#59586b] small:px-7 small:pr-24">
                        <p>{item.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="content-container py-16 small:py-24">
        <div className="grid overflow-hidden rounded-[20px] border border-[#dedbe9] bg-white medium:grid-cols-[1.2fr_.8fr]">
          <div className="p-8 small:p-12">
            <h2 className="font-display text-4xl leading-none small:text-5xl">
              Meer weten over LVRO?
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#59586b]">
              Lees hoe we kiezen, uitleggen en helpen bij een interieur dat echt
              bij je past.
            </p>
          </div>
          <div className="flex items-end bg-[#efedf8] p-8 small:p-12">
            <LocalizedClientLink
              href="/over-ons"
              className="focus-brand inline-flex min-h-12 items-center justify-center rounded-full bg-[#ff6b6b] px-7 text-xs font-black uppercase text-[#15162a] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Ontdek ons verhaal
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </main>
  )
}
