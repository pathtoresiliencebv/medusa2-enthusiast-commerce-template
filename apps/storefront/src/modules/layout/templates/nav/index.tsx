import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import SearchForm from "@modules/layout/components/search-form"
import { brand, primaryNavigation } from "@lib/brand"
import { Heart, User } from "@medusajs/icons"
import BrandLogo from "@modules/common/components/brand-logo"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky inset-x-0 top-0 z-50 bg-white/95 shadow-[0_8px_24px_rgba(21,22,42,0.06)] backdrop-blur">
      <div className="bg-[#ff6b6b] px-4 py-2 text-center text-[11px] font-black text-[#15162a]">
        <span className="mr-2 rounded-full bg-white/75 px-2 py-0.5">
          LANCERING
        </span>
        30 DAGEN RETOUR · VERZENDING VANAF EUR 10
      </div>
      <header className="relative mx-auto border-b border-[#dedbe9] bg-white">
        <nav className="content-container grid min-h-[64px] w-full grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm text-[#15162a]">
          <div className="flex items-center gap-4">
            <div className="h-full">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <LocalizedClientLink
              className="hidden rounded-full px-3 py-2 text-xs font-black hover:bg-[#f7f6fb] small:block"
              href="/store"
            >
              Shop alles
            </LocalizedClientLink>
          </div>

          <div className="flex flex-col items-center">
            <LocalizedClientLink
              href="/"
              className="focus-brand"
              data-testid="nav-store-link"
              aria-label={`${brand.name} home`}
            >
              <BrandLogo priority />
            </LocalizedClientLink>
          </div>

          <div className="flex items-center justify-end gap-x-2 small:gap-x-4">
            <SearchForm />
            <div className="hidden items-center gap-x-1 small:flex">
              <LocalizedClientLink
                className="focus-brand flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#f7f6fb]"
                href="/wishlist"
                aria-label="Favorieten"
                title="Favorieten"
              >
                <Heart />
              </LocalizedClientLink>
              <LocalizedClientLink
                className="focus-brand flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#f7f6fb]"
                href="/account"
                data-testid="nav-account-link"
                aria-label="Account"
                title="Account"
              >
                <User />
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex gap-2 font-bold hover:underline"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Mand (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
        <div className="hidden border-t border-[#efedf8] medium:block">
          <div className="content-container flex min-h-[44px] items-center justify-center gap-8 text-[11px] font-black text-[#15162a]">
            {primaryNavigation.map((item) => (
              <LocalizedClientLink
                key={item.label}
                href={item.href}
                className="focus-brand rounded-full px-2 py-2 hover:bg-[#f7f6fb] hover:text-[#6554c0]"
              >
                {item.label}
              </LocalizedClientLink>
            ))}
            <LocalizedClientLink
              href="/store?sortBy=price_asc"
              className="focus-brand rounded-full bg-[#6554c0] px-4 py-2 text-white hover:bg-[#4e3fa5]"
            >
              Sale
            </LocalizedClientLink>
          </div>
        </div>
      </header>
    </div>
  )
}
