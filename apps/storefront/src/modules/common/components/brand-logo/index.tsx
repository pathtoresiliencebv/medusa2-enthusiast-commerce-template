import Image from "next/image"

type BrandLogoProps = {
  className?: string
  inverted?: boolean
  priority?: boolean
}

export default function BrandLogo({
  className = "",
  inverted = false,
  priority = false,
}: BrandLogoProps) {
  return (
    <span
      className={`relative block h-10 w-40 overflow-hidden ${className}`}
      aria-label="lvro.nl"
    >
      <Image
        src={
          inverted
            ? "/brand/lvro-wordmark-dark.png"
            : "/brand/lvro-wordmark-light.png"
        }
        alt="lvro.nl"
        width={1448}
        height={1086}
        priority={priority}
        className="absolute left-1/2 top-1/2 h-auto w-[220px] max-w-none -translate-x-1/2 -translate-y-1/2"
        sizes="220px"
      />
    </span>
  )
}
