export type QuantityTier = {
  quantity: number
  discount_percentage: number
  label: string
}

export type ProductReview = {
  id: string
  author_name: string
  title?: string | null
  body: string
  rating: number
  verified_purchase: boolean
  helpful_count: number
  media?: string[] | null
  created_at: string
  source: "native" | "supplier_import" | string
  source_created_at?: string | null
  source_url?: string | null
}

export type ProductRating = {
  average: number
  count: number
  distribution: Array<{ score: number; count: number }>
}

export type ConversionBundle = {
  id: string
  handle: string
  title: string
  description?: string | null
  hero_product_id: string
  items: Array<{ variant_id: string; quantity: number }>
  discount_percentage: number
}

export type ProductMerchandising = {
  product_id: string
  swatches: Record<string, string>
  quantity_tiers: QuantityTier[]
  delivery_label: string
  financing_label?: string | null
  trust_badges: string[]
  recommendation_ids: string[]
  downsell_product_id?: string | null
}

export type ProductConversion = {
  merchandising: ProductMerchandising
  rating: ProductRating
  reviews: ProductReview[]
  bundles: ConversionBundle[]
}
