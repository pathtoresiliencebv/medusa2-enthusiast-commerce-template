"use client"

import { MagnifyingGlass } from "@medusajs/icons"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function SearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const params = useParams<{ countryCode: string }>()
  const [query, setQuery] = useState("")

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = query.trim()

    if (!normalized) return

    router.push(
      `/${params.countryCode}/search?q=${encodeURIComponent(normalized)}`
    )
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className={`focus-within:border-[#15162a] ${
        compact
          ? "flex w-full border-b border-[#15162a]"
          : "hidden min-w-[230px] items-center border-b border-[#b9b9b9] bg-white medium:flex"
      }`}
    >
      <label
        htmlFor={compact ? "mobile-search" : "desktop-search"}
        className="sr-only"
      >
        Zoek in de collectie
      </label>
      <input
        id={compact ? "mobile-search" : "desktop-search"}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Zoek producten"
        className="min-h-10 w-full bg-transparent px-3 text-sm outline-none placeholder:text-[#707070]"
      />
      <button
        type="submit"
        className="focus-brand flex h-11 w-11 shrink-0 items-center justify-center"
        aria-label="Zoeken"
        title="Zoeken"
      >
        <MagnifyingGlass />
      </button>
    </form>
  )
}
