import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { brand } from "@lib/brand"
import BrandLogo from "@modules/common/components/brand-logo"
import CookieSettingsButton from "@modules/analytics/components/cookie-settings-button"

export default async function Footer() {
  return (
    <footer className="w-full bg-[#15162a] text-white">
      <div className="border-b border-white/10 bg-[#efedf8] text-[#15162a]">
        <div className="content-container grid grid-cols-2 gap-x-5 gap-y-6 py-8 text-center small:grid-cols-5">
          <TrustItem title="Persoonlijk advies" copy="Ma-vr bereikbaar" />
          <TrustItem title="30 dagen bedenktijd" copy="Rustig thuis kiezen" />
          <TrustItem
            title="Wettelijke garantie"
            copy="Altijd een deugdelijk product"
          />
          <TrustItem title="Veilig betalen" copy="Bekende betaalmethoden" />
          <TrustItem
            title="Levering op afspraak"
            copy="Wanneer het jou uitkomt"
          />
        </div>
      </div>
      <div className="content-container flex w-full flex-col">
        <div className="grid gap-10 py-14 small:grid-cols-[1.1fr_2fr_1fr] small:py-16">
          <div className="max-w-sm">
            <LocalizedClientLink href="/" aria-label={`${brand.name} home`}>
              <BrandLogo inverted priority className="h-12 w-48" />
            </LocalizedClientLink>
            <p className="mt-4 text-sm leading-6 text-white/60">
              {brand.promise}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm small:grid-cols-3">
            <FooterColumn
              title="Shop"
              links={[
                ["Woonkamer", "/categories/living-room-furniture"],
                ["Slaapkamer", "/categories/bedroom-furniture"],
                ["Eetkamer", "/categories/dining-room-furniture"],
                ["Kantoor", "/categories/home-office-furniture"],
              ]}
            />
            <FooterColumn
              title="Ruimtes"
              links={[
                ["Badkamer", "/categories/bathroom-furniture"],
                ["Keuken", "/categories/kitchen-furniture"],
                ["Hal", "/categories/entryway-furniture"],
                ["Kinderkamer", "/categories/kids-furniture"],
              ]}
            />
            <FooterColumn
              title="Service"
              links={[
                ["Track & Trace", "/track-en-trace"],
                ["Levering", "/levering"],
                ["Verzending", "/verzending"],
                ["Retourneren", "/retourneren"],
                ["Garantie", "/garantie"],
              ]}
            />
          </div>

          <div className="rounded-[14px] border-t-4 border-[#ff6b6b] bg-white/5 p-5">
            <p className="text-sm font-black uppercase">Gratis advies</p>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Hulp nodig met maat, materiaal of een complete ruimte? Onze
              interieuradviseurs denken vrijblijvend mee.
            </p>
            <LocalizedClientLink
              href="/service"
              className="mt-5 inline-flex text-xs font-black uppercase text-white hover:text-[#ffb0b0]"
            >
              Plan gratis advies -&gt;
            </LocalizedClientLink>
          </div>
        </div>

        <div className="grid gap-8 border-t border-white/15 py-8 text-sm small:grid-cols-2 medium:grid-cols-4">
          <FooterColumn
            title="Bestellen"
            links={[
              ["Betaalmethodes", "/betaalmethodes"],
              ["Mijn account", "/account"],
              ["Winkelmand", "/cart"],
            ]}
          />
          <FooterColumn
            title="Voorwaarden"
            links={[
              ["Algemene voorwaarden", "/algemene-voorwaarden"],
              ["Privacybeleid", "/privacybeleid"],
              ["Retourbeleid", "/retourneren"],
            ]}
          />
          <FooterColumn
            title="Over LVRO"
            links={[
              ["Over ons", "/over-ons"],
              ["Veelgestelde vragen", "/faq"],
              ["Service", "/service"],
              ["Inspiratie", "/inspiratie"],
            ]}
          />
          <div>
            <p className="font-black uppercase">Contact</p>
            <p className="mt-5 leading-6 text-white/60">{brand.email}</p>
            <p className="mt-2 leading-6 text-white/60">{brand.phone}</p>
            <p className="mt-2 leading-6 text-white/60">{brand.serviceHours}</p>
            <div className="mt-3 text-white/60">
              <CookieSettingsButton />
            </div>
          </div>
        </div>

        <div className="mb-8 flex w-full flex-col justify-between gap-3 border-t border-white/20 pt-6 text-xs text-white/50 small:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.name}. Alle rechten
            voorbehouden.
          </p>
          <p>
            {brand.email} | {brand.phone}
          </p>
        </div>
      </div>
    </footer>
  )
}

function TrustItem({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <p className="text-xs font-black">{title}</p>
      <p className="mt-1 text-[11px] text-[#69667a]">{copy}</p>
    </div>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: Array<[string, string]>
}) {
  return (
    <div>
      <p className="font-black uppercase">{title}</p>
      <ul className="mt-5 grid gap-3 text-white/60">
        {links.map(([label, href]) => (
          <li key={label}>
            <LocalizedClientLink href={href} className="hover:text-white">
              {label}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
