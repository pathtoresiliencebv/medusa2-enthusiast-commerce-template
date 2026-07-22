import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import { LockClosedSolid } from "@medusajs/icons"
import { brand } from "@lib/brand"
import BrandLogo from "@modules/common/components/brand-logo"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#f4f4f4]">
      <div className="h-16 border-b border-[#dedbe9] bg-white small:h-20">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ui-fg-base flex items-center gap-x-2 uppercase flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base ">
              Terug naar winkelmand
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
              Terug
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            data-testid="store-link"
            aria-label={`${brand.name} home`}
          >
            <BrandLogo priority />
          </LocalizedClientLink>
          <div className="flex flex-1 basis-0 items-center justify-end gap-2 text-xs text-[#666276]">
            <LockClosedSolid className="h-4 w-4" />
            <span className="hidden small:inline">Beveiligd afrekenen</span>
          </div>
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
      <div className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-8 text-center text-xs text-ui-fg-subtle">
        <span className="flex items-center gap-2">
          <LockClosedSolid className="h-4 w-4" /> Beveiligde checkout van{" "}
          {brand.name}
        </span>
        <a
          href={`mailto:${brand.email}`}
          className="underline underline-offset-4"
        >
          Hulp nodig? {brand.email}
        </a>
      </div>
    </div>
  )
}
