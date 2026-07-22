"use client"

import { clx } from "@modules/common/components/ui"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
  "data-testid": dataTestid,
}: {
  page: number
  totalPages: number
  "data-testid"?: string
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Helper function to generate an array of numbers within a range
  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, index) => start + index)

  const hrefForPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams)

    if (newPage === 1) {
      params.delete("page")
    } else {
      params.set("page", newPage.toString())
    }

    const query = params.toString()

    return query ? `${pathname}?${query}` : pathname
  }

  // Function to render a page button
  const renderPageButton = (
    p: number,
    label: string | number,
    isCurrent: boolean
  ) =>
    isCurrent ? (
      <span
        key={p}
        aria-current="page"
        className="flex h-10 min-w-10 items-center justify-center rounded-full bg-[#15162a] px-3 text-sm font-black text-white"
      >
        {label}
      </span>
    ) : (
      <Link
        key={p}
        href={hrefForPage(p)}
        aria-label={`Ga naar pagina ${p}`}
        className="flex h-10 min-w-10 items-center justify-center rounded-full border border-[#dedbe9] px-3 text-sm font-black text-[#15162a] hover:border-[#6554c0]"
      >
        {label}
      </Link>
    )

  // Function to render ellipsis
  const renderEllipsis = (key: string) => (
    <span
      key={key}
      className="txt-xlarge-plus text-ui-fg-muted items-center cursor-default"
    >
      ...
    </span>
  )

  // Function to render page buttons based on the current page and total pages
  const renderPageButtons = () => {
    const buttons = []

    if (totalPages <= 7) {
      // Show all pages
      buttons.push(
        ...arrayRange(1, totalPages).map((p) =>
          renderPageButton(p, p, p === page)
        )
      )
    } else {
      // Handle different cases for displaying pages and ellipses
      if (page <= 4) {
        // Show 1, 2, 3, 4, 5, ..., lastpage
        buttons.push(
          ...arrayRange(1, 5).map((p) => renderPageButton(p, p, p === page))
        )
        buttons.push(renderEllipsis("ellipsis1"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      } else if (page >= totalPages - 3) {
        // Show 1, ..., lastpage - 4, lastpage - 3, lastpage - 2, lastpage - 1, lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis2"))
        buttons.push(
          ...arrayRange(totalPages - 4, totalPages).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
      } else {
        // Show 1, ..., page - 1, page, page + 1, ..., lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis3"))
        buttons.push(
          ...arrayRange(page - 1, page + 1).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
        buttons.push(renderEllipsis("ellipsis4"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      }
    }

    return buttons
  }

  // Render the component
  return (
    <nav
      className="mt-12 flex w-full justify-center"
      aria-label="Productpagina's"
    >
      <div className="flex flex-wrap items-end gap-2" data-testid={dataTestid}>
        {page > 1 && (
          <Link
            href={hrefForPage(page - 1)}
            rel="prev"
            className={clx(
              "flex h-10 items-center rounded-full border border-[#dedbe9] px-4 text-sm font-black text-[#15162a] hover:border-[#6554c0]"
            )}
          >
            Vorige
          </Link>
        )}
        {renderPageButtons()}
        {page < totalPages && (
          <Link
            href={hrefForPage(page + 1)}
            rel="next"
            className={clx(
              "flex h-10 items-center rounded-full border border-[#dedbe9] px-4 text-sm font-black text-[#15162a] hover:border-[#6554c0]"
            )}
          >
            Volgende
          </Link>
        )}
      </div>
    </nav>
  )
}
