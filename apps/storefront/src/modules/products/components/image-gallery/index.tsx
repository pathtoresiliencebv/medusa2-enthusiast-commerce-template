"use client"

import { ArrowsPointingOut, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  title: string
}

const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [selected, setSelected] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const selectedImage = images[selected]

  if (!images.length) {
    return <div className="aspect-square rounded-[18px] bg-[#efedf8]" />
  }

  return (
    <div>
      <div className="hidden gap-3 small:grid small:grid-cols-[84px_1fr]">
        <div className="grid content-start gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelected(index)}
              className={`relative aspect-square overflow-hidden rounded-[10px] border-2 bg-[#efedf8] ${
                selected === index ? "border-[#6554c0]" : "border-transparent"
              }`}
              aria-label={`Bekijk afbeelding ${index + 1}`}
              aria-pressed={selected === index}
            >
              {image.url && (
                <Image
                  src={image.url}
                  alt=""
                  fill
                  className="object-contain"
                  quality={90}
                  sizes="84px"
                />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="group relative aspect-square overflow-hidden rounded-[18px] bg-[#efedf8]"
          aria-label="Vergroot productafbeelding"
        >
          {selectedImage?.url && (
            <Image
              src={selectedImage.url}
              priority
              className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              alt={`${title}, afbeelding ${selected + 1}`}
              fill
              quality={90}
              sizes="(max-width: 1024px) 70vw, 58vw"
            />
          )}
          <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <ArrowsPointingOut />
          </span>
          <span className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-2 text-xs font-black shadow-sm">
            {selected + 1} / {images.length}
          </span>
        </button>
      </div>

      <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto small:hidden">
        {images.map((image, index) => (
          <button
            type="button"
            key={image.id}
            onClick={() => {
              setSelected(index)
              setZoomOpen(true)
            }}
            className="relative aspect-square min-w-full snap-center overflow-hidden rounded-[14px] bg-[#efedf8]"
            aria-label={`Vergroot afbeelding ${index + 1}`}
          >
            {image.url && (
              <Image
                src={image.url}
                priority={index === 0}
                alt={`${title}, afbeelding ${index + 1}`}
                fill
                className="object-contain"
                quality={90}
                sizes="100vw"
              />
            )}
            <span className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-2 text-xs font-black shadow-sm">
              {index + 1} / {images.length}
            </span>
          </button>
        ))}
      </div>

      {zoomOpen && selectedImage?.url && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-white p-4 small:p-10"
          role="dialog"
          aria-modal="true"
          aria-label="Productafbeelding vergroten"
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#15162a] bg-white"
            aria-label="Sluiten"
          >
            <XMark />
          </button>
          <div className="relative h-full w-full">
            <Image
              src={selectedImage.url}
              alt={`${title}, vergrote afbeelding ${selected + 1}`}
              fill
              className="object-contain"
              quality={90}
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageGallery
