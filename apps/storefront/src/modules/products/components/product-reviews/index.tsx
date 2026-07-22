"use client"

import { BadgeCheck, StarSolid } from "@medusajs/icons"
import Image from "next/image"
import { useMemo, useState } from "react"

import type { ProductRating, ProductReview } from "../../../../types/conversion"

export default function ProductReviews({
  reviews,
  rating,
}: {
  reviews: ProductReview[]
  rating: ProductRating
}) {
  const [score, setScore] = useState<number | null>(null)
  const [query, setQuery] = useState("")
  const [photosOnly, setPhotosOnly] = useState(false)
  const reviewPhotos = useMemo(
    () =>
      Array.from(
        new Set(reviews.flatMap((review) => review.media || []).filter(Boolean))
      ),
    [reviews]
  )
  const filtered = useMemo(
    () =>
      reviews.filter((review) => {
        const matchesScore = score ? review.rating === score : true
        const matchesPhotos = photosOnly ? !!review.media?.length : true
        const needle = query.trim().toLowerCase()
        const matchesQuery = needle
          ? `${review.title || ""} ${review.body}`
              .toLowerCase()
              .includes(needle)
          : true
        return matchesScore && matchesPhotos && matchesQuery
      }),
    [photosOnly, query, reviews, score]
  )
  const formatReviewDate = (review: ProductReview) =>
    new Intl.DateTimeFormat("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(review.source_created_at || review.created_at))

  return (
    <section
      id="reviews"
      className="border-t border-[#dedbe9] bg-white py-16 small:py-24"
    >
      <div className="content-container">
        <div className="grid gap-10 medium:grid-cols-[320px_1fr]">
          <div>
            <p className="text-xs font-black uppercase text-[#666666]">
              Geverifieerde bronreviews
            </p>
            <h2 className="font-display mt-3 text-4xl leading-none">
              Wat klanten zeggen
            </h2>
            <div className="mt-7 flex items-end gap-3">
              <strong className="text-6xl leading-none">
                {rating.count ? rating.average : "-"}
              </strong>
              <span className="pb-1 text-sm text-[#666666]">
                van 5 / {rating.count} reviews
              </span>
            </div>
            <div className="mt-7 grid gap-2">
              {rating.distribution.map((item) => {
                const width = rating.count
                  ? (item.count / rating.count) * 100
                  : 0
                return (
                  <button
                    key={item.score}
                    type="button"
                    onClick={() =>
                      setScore(score === item.score ? null : item.score)
                    }
                    className="grid grid-cols-[48px_1fr_24px] items-center gap-3 text-xs"
                    aria-pressed={score === item.score}
                  >
                    <span>{item.score} sterren</span>
                    <span className="h-2 bg-[#efedf8]">
                      <span
                        className="block h-full bg-[#15162a]"
                        style={{ width: `${width}%` }}
                      />
                    </span>
                    <span>{item.count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            {!!reviewPhotos.length && (
              <div className="mb-7 border-b border-[#dedbe9] pb-7">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-[#6554c0]">
                      Foto's van kopers
                    </p>
                    <p className="mt-1 text-sm text-[#555555]">
                      {reviewPhotos.length} echte productfoto's uit reviews
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhotosOnly((value) => !value)}
                    aria-pressed={photosOnly}
                    className={`min-h-10 rounded-full border px-4 text-xs font-black uppercase ${
                      photosOnly
                        ? "border-[#6554c0] bg-[#6554c0] text-white"
                        : "border-[#6554c0] text-[#6554c0]"
                    }`}
                  >
                    {photosOnly ? "Toon alles" : "Alleen met foto's"}
                  </button>
                </div>
                <div className="no-scrollbar flex gap-2 overflow-x-auto">
                  {reviewPhotos.map((url, index) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative block size-24 shrink-0 overflow-hidden rounded-[10px] border border-[#dedbe9] bg-[#f5f5f5]"
                      aria-label={`Open productfoto ${index + 1}`}
                    >
                      <Image
                        src={url}
                        alt={`Productfoto uit klantreview ${index + 1}`}
                        fill
                        sizes="96px"
                        quality={90}
                        className="object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3 border-b border-[#dedbe9] pb-5 small:flex-row small:items-center small:justify-between">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Zoek in reviews"
                className="min-h-11 border border-[#c8c3dd] px-4 text-sm outline-none focus:border-[#15162a]"
              />
              <a href="/nl/account" className="brand-button">
                Schrijf een verified review
              </a>
            </div>

            {filtered.length ? (
              <div className="divide-y divide-[#dedbe9]">
                {filtered.map((review) => (
                  <article key={review.id} className="py-7">
                    <div
                      className="flex gap-1"
                      aria-label={`${review.rating} van 5 sterren`}
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <StarSolid
                          key={index}
                          className={
                            index < review.rating ? "" : "text-[#d0d0d0]"
                          }
                        />
                      ))}
                    </div>
                    {review.title && (
                      <h3 className="mt-3 font-black">{review.title}</h3>
                    )}
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#444444]">
                      {review.body}
                    </p>
                    {!!review.media?.length && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {review.media.map((url, index) => (
                          <a
                            key={`${review.id}-${url}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="relative block size-24 overflow-hidden border border-[#dedbe9] bg-[#f5f5f5]"
                            aria-label={`Bekijk reviewfoto ${index + 1}`}
                          >
                            <Image
                              src={url}
                              alt={`Reviewfoto van ${review.author_name}`}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#666666]">
                      <span className="font-bold text-[#15162a]">
                        {review.author_name}
                      </span>
                      {review.verified_purchase && (
                        <span className="flex items-center gap-1">
                          <BadgeCheck /> Geverifieerde aankoop
                        </span>
                      )}
                      {review.source === "supplier_import" && (
                        <span className="flex items-center gap-1">
                          <BadgeCheck /> Geverifieerd bij bron
                        </span>
                      )}
                      <time
                        dateTime={review.source_created_at || review.created_at}
                      >
                        {formatReviewDate(review)}
                      </time>
                      <span>{review.helpful_count} keer behulpzaam</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-12">
                <h3 className="text-xl font-black uppercase">
                  Nog geen reviews
                </h3>
                <p className="mt-2 text-sm text-[#555555]">
                  Alleen klanten met een afgeronde bestelling kunnen hier een
                  review plaatsen.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
