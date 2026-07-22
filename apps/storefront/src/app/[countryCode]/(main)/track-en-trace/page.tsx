import { Metadata } from "next"
import { localizedPageMetadata } from "@lib/seo"
import TrackingForm from "@modules/service/components/tracking-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  return localizedPageMetadata({
    countryCode: (await params).countryCode,
    path: "/track-en-trace",
    title: "Track & Trace van je LVRO-bestelling",
    description:
      "Volg je LVRO-bestelling met je trackingnummer en bekijk direct de actuele pakketstatus.",
  })
}

export default function TrackAndTracePage() {
  return (
    <main className="bg-[#f7f6fb] text-[#15162a]">
      <header className="bg-[#15162a] text-white">
        <div className="content-container py-16 small:py-24">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#ff8c8c]">
            Waar is mijn bestelling?
          </p>
          <h1 className="font-display mt-5 max-w-4xl text-5xl leading-[.96] small:text-7xl">
            Track & Trace, in één oogopslag.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/75 small:text-lg">
            Vul het trackingnummer uit je verzendbevestiging in. De actuele
            vervoerdersinformatie verschijnt hieronder, binnen de LVRO-omgeving.
          </p>
        </div>
      </header>

      <div className="content-container py-14 small:py-20">
        <section className="rounded-[18px] border border-[#dedbe9] bg-white p-6 shadow-[0_12px_35px_rgba(42,35,82,.06)] small:p-9">
          <TrackingForm />
        </section>

        <section className="mt-8 grid gap-5 medium:grid-cols-3">
          <InfoCard
            number="01"
            title="Tracking nog onbekend?"
            copy="Een vervoerder kan enkele uren nodig hebben om de eerste scan zichtbaar te maken. Probeer het later opnieuw."
          />
          <InfoCard
            number="02"
            title="Meerdere pakketten"
            copy="Een bestelling kan in delen worden verzonden. Je ontvangt dan per zending een apart trackingnummer."
          />
          <InfoCard
            number="03"
            title="Status blijft hangen"
            copy="Is er langer dan drie werkdagen geen update? Mail ons je order- en trackingnummer, dan kijken we mee."
          />
        </section>

        <section className="mt-8 rounded-[18px] bg-[#ff6b6b] p-7 small:p-10">
          <div className="grid gap-6 medium:grid-cols-[1fr_auto] medium:items-center">
            <div>
              <h2 className="font-display text-4xl">Goed om te weten</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#29263d]">
                De trackingweergave wordt geleverd door 17TRACK. Na het invoeren
                wordt je trackingnummer met 17TRACK gedeeld om de vervoerder en
                pakketstatus op te halen. Lees meer in ons privacybeleid.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LocalizedClientLink href="/verzending" className="brand-button">
                Over verzending
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/privacybeleid"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#15162a] px-6 text-xs font-black uppercase"
              >
                Privacybeleid
              </LocalizedClientLink>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function InfoCard({
  number,
  title,
  copy,
}: {
  number: string
  title: string
  copy: string
}) {
  return (
    <article className="rounded-[16px] border-t-4 border-[#15162a] bg-white p-6">
      <p className="text-xs font-black text-[#777287]">{number}</p>
      <h2 className="font-display mt-4 text-3xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-[#5b586b]">{copy}</p>
    </article>
  )
}
