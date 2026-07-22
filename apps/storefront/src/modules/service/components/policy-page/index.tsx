import { brand } from "@lib/brand"
import { PolicyPageData } from "@lib/service-policy-data"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function PolicyPage({ data }: { data: PolicyPageData }) {
  return (
    <main className="bg-[#f7f6fb] text-[#15162a]">
      <header className="bg-[#15162a] text-white">
        <div className="content-container py-16 small:py-24">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#ff8c8c]">
            {data.eyebrow}
          </p>
          <h1 className="font-display mt-5 max-w-4xl text-5xl leading-[.96] small:text-7xl">
            {data.title}
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-white/75 small:text-lg">
            {data.intro}
          </p>
          <p className="mt-7 text-xs text-white/45">
            Laatst bijgewerkt: {data.updated}
          </p>
        </div>
      </header>

      <div className="content-container grid gap-10 py-14 medium:grid-cols-[minmax(0,1fr)_300px] medium:py-20">
        <div className="grid gap-6">
          {data.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[18px] border border-[#dedbe9] bg-white p-6 shadow-[0_12px_35px_rgba(42,35,82,.06)] small:p-8"
            >
              <h2 className="font-display text-3xl leading-tight small:text-4xl">
                {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-5 max-w-3xl text-sm leading-7 text-[#555366] small:text-base"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-5 grid gap-3 text-sm leading-7 text-[#555366] small:text-base">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        className="mt-[.65rem] h-2 w-2 shrink-0 rounded-full bg-[#ff6b6b]"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.table && (
                <dl className="mt-6 overflow-hidden rounded-[12px] border border-[#dedbe9]">
                  {section.table.map(([term, detail]) => (
                    <div
                      key={term}
                      className="grid gap-1 border-b border-[#dedbe9] p-4 last:border-b-0 small:grid-cols-[190px_1fr]"
                    >
                      <dt className="text-sm font-black">{term}</dt>
                      <dd className="text-sm leading-6 text-[#555366]">
                        {detail}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          ))}
        </div>

        <aside className="h-fit rounded-[18px] border-t-4 border-[#ff6b6b] bg-[#15162a] p-6 text-white medium:sticky medium:top-36">
          <p className="text-xs font-black uppercase tracking-[.12em] text-[#ff9b9b]">
            Hulp nodig?
          </p>
          <h2 className="font-display mt-4 text-3xl">We denken met je mee.</h2>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Noem bij een bestelling altijd je ordernummer. We zijn bereikbaar op{" "}
            {brand.serviceHours.toLowerCase()}.
          </p>
          <a
            href={`mailto:${brand.email}`}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#ff6b6b] px-5 text-xs font-black uppercase text-[#15162a]"
          >
            {brand.email}
          </a>
          <a
            href={`tel:${brand.phone.replace(/\s/g, "")}`}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/25 px-5 text-xs font-black uppercase text-white"
          >
            {brand.phone}
          </a>
          <div className="mt-7 border-t border-white/15 pt-6">
            <p className="text-xs font-black uppercase text-white/45">
              Meer service
            </p>
            <nav
              className="mt-4 grid gap-3 text-sm"
              aria-label="Servicepagina's"
            >
              <LocalizedClientLink href="/track-en-trace">
                Track & Trace
              </LocalizedClientLink>
              <LocalizedClientLink href="/retourneren">
                Retourneren
              </LocalizedClientLink>
              <LocalizedClientLink href="/verzending">
                Verzending
              </LocalizedClientLink>
              <LocalizedClientLink href="/garantie">
                Garantie
              </LocalizedClientLink>
            </nav>
          </div>
        </aside>
      </div>
    </main>
  )
}
