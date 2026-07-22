import { Metadata } from "next"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { localizedPageMetadata } from "@lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  return localizedPageMetadata({
    countryCode: (await params).countryCode,
    path: "/inspiratie",
    title: "Wooninspiratie voor iedere kamer",
    description:
      "Ontdek woonideeën, materiaalcombinaties en samengestelde kamers van lvro.nl.",
  })
}

const stories = [
  {
    title: "Zachte vormen, sterke basis",
    body: "Combineer een royale bank met slanke bijzettafels en laat ruimte rondom de belangrijkste vormen.",
    href: "/categories/sofas",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=90",
  },
  {
    title: "Hout dat samen mag leven",
    body: "Verschillende houttonen werken wanneer ondertoon, nerf en afwerking bewust terugkomen.",
    href: "/categories/tables",
    image:
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1400&q=90",
  },
  {
    title: "Een werkplek die niet voelt als kantoor",
    body: "Goede verlichting, een comfortabele stoel en gesloten opbergruimte brengen rust in hybride ruimtes.",
    href: "/categories/chairs",
    image:
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1400&q=90",
  },
]

export default function InspirationPage() {
  return (
    <main className="bg-white">
      <section className="content-container py-16 small:py-24">
        <p className="text-xs font-black uppercase text-[#666666]">
          Room edits
        </p>
        <h1 className="font-display mt-4 max-w-5xl text-5xl leading-[.95] small:text-7xl">
          Nieuwe energie voor iedere ruimte
        </h1>
      </section>
      <section className="content-container grid gap-6 pb-24 medium:grid-cols-12">
        {stories.map((story, index) => (
          <article
            key={story.title}
            className={index === 0 ? "medium:col-span-7" : "medium:col-span-5"}
          >
            <LocalizedClientLink href={story.href} className="group block">
              <div
                className={`relative overflow-hidden bg-[#efedf8] ${
                  index === 0 ? "aspect-[4/3]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes={
                    index === 0
                      ? "(max-width: 1024px) 100vw, 58vw"
                      : "(max-width: 1024px) 100vw, 42vw"
                  }
                />
              </div>
              <p className="mt-5 text-xs font-black uppercase text-[#666666]">
                Room edit {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="font-display mt-2 text-4xl leading-none small:text-5xl">
                {story.title}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#555555]">
                {story.body}
              </p>
            </LocalizedClientLink>
          </article>
        ))}
      </section>
    </main>
  )
}
