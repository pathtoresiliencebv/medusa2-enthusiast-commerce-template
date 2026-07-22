"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { Locale } from "@lib/data/locales"
import { brand, primaryNavigation, roomNavigation } from "@lib/brand"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, BarsThree, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import BrandLogo from "@modules/common/components/brand-logo"
import SearchForm from "@modules/layout/components/search-form"
import { clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const utilityLinks = [
  { label: "Favorieten", href: "/wishlist" },
  { label: "Account", href: "/account" },
  { label: "Winkelmand", href: "/cart" },
  { label: "Service", href: "/service" },
]

const SideMenu = ({ regions, locales, currentLocale }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <Popover className="flex h-full">
      {({ open, close }) => (
        <>
          <Popover.Button
            data-testid="nav-menu-button"
            className="focus-brand flex h-full min-h-11 items-center gap-2 text-xs font-black uppercase"
            aria-label="Menu openen"
          >
            <BarsThree />
            <span className="hidden small:inline">Menu</span>
          </Popover.Button>

          <Transition
            show={open}
            as={Fragment}
            enter="transition-opacity duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 z-[60] bg-black/45"
              onClick={close}
              data-testid="side-menu-backdrop"
            />
          </Transition>

          <Transition
            show={open}
            as={Fragment}
            enter="transition-transform duration-300 ease-out"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-200 ease-in"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <PopoverPanel className="fixed inset-y-0 left-0 z-[61] flex w-[min(92vw,460px)] flex-col overflow-y-auto bg-white p-6 text-[#15162a] small:p-9">
              <div className="flex items-center justify-between border-b border-[#dedbe9] pb-6">
                <LocalizedClientLink
                  href="/"
                  onClick={close}
                  aria-label={`${brand.name} home`}
                >
                  <BrandLogo />
                </LocalizedClientLink>
                <button
                  type="button"
                  data-testid="close-menu-button"
                  onClick={close}
                  className="focus-brand flex h-11 w-11 items-center justify-center"
                  aria-label="Menu sluiten"
                  title="Menu sluiten"
                >
                  <XMark />
                </button>
              </div>

              <div className="mt-7 medium:hidden">
                <SearchForm compact />
              </div>

              <nav className="mt-10" aria-label="Hoofdnavigatie mobiel">
                <p className="text-[10px] font-black uppercase text-[#666666]">
                  Collectie
                </p>
                <ul className="mt-4 grid gap-2">
                  {primaryNavigation.map((item) => (
                    <li key={item.label}>
                      <LocalizedClientLink
                        href={item.href}
                        onClick={close}
                        className="font-display block border-b border-[#e5e5e5] py-3 text-3xl hover:bg-[#ff6b6b]"
                      >
                        {item.label}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-9">
                <p className="text-[10px] font-black uppercase text-[#666666]">
                  Shop per ruimte
                </p>
                <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
                  {roomNavigation.map((item) => (
                    <LocalizedClientLink
                      key={item.label}
                      href={item.href}
                      onClick={close}
                    >
                      {item.label}
                    </LocalizedClientLink>
                  ))}
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3 border-t border-[#dedbe9] pt-7 text-sm font-bold">
                {utilityLinks.map((item) => (
                  <LocalizedClientLink
                    key={item.label}
                    href={item.href}
                    onClick={close}
                  >
                    {item.label}
                  </LocalizedClientLink>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-y-5 border-t border-[#dedbe9] pt-8 text-sm">
                {!!locales?.length && (
                  <div
                    className="flex justify-between"
                    onMouseEnter={languageToggleState.open}
                    onMouseLeave={languageToggleState.close}
                  >
                    <LanguageSelect
                      toggleState={languageToggleState}
                      locales={locales}
                      currentLocale={currentLocale}
                    />
                    <ArrowRightMini
                      className={clx("transition-transform", {
                        "-rotate-90": languageToggleState.state,
                      })}
                    />
                  </div>
                )}
                <div
                  className="flex justify-between"
                  onMouseEnter={countryToggleState.open}
                  onMouseLeave={countryToggleState.close}
                >
                  {regions && (
                    <CountrySelect
                      toggleState={countryToggleState}
                      regions={regions}
                    />
                  )}
                  <ArrowRightMini
                    className={clx("transition-transform", {
                      "-rotate-90": countryToggleState.state,
                    })}
                  />
                </div>
                <p className="text-xs text-[#666666]">
                  © {new Date().getFullYear()} {brand.name}
                </p>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default SideMenu
