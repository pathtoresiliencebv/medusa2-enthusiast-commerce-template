export const brand = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "My Store",
  descriptor:
    process.env.NEXT_PUBLIC_STORE_DESCRIPTOR || "Living, redefined.",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || "support@example.com",
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || "+31 00 000 00 00",
  serviceHours:
    process.env.NEXT_PUBLIC_STORE_SERVICE_HOURS || "Ma-vr 09:00-17:30",
  promise:
    "Living, redefined. Tijdloze meubels voor een interieur dat echt bij je past.",
}

export const primaryNavigation = [
  { label: "Nieuw", href: "/store?sortBy=created_at" },
  { label: "Collecties", href: "/collecties" },
  { label: "Woonkamer", href: "/categories/living-room-furniture" },
  { label: "Slaapkamer", href: "/categories/bedroom-furniture" },
  { label: "Eetkamer", href: "/categories/dining-room-furniture" },
  { label: "Kantoor", href: "/categories/home-office-furniture" },
  { label: "Badkamer", href: "/categories/bathroom-furniture" },
  { label: "Keuken", href: "/categories/kitchen-furniture" },
  { label: "Inspiratie", href: "/inspiratie" },
]

export const roomNavigation = [
  { label: "Woonkamer", href: "/categories/living-room-furniture" },
  { label: "Eetkamer", href: "/categories/dining-room-furniture" },
  { label: "Slaapkamer", href: "/categories/bedroom-furniture" },
  { label: "Werkruimte", href: "/categories/home-office-furniture" },
  { label: "Hal", href: "/categories/entryway-furniture" },
  { label: "Kinderkamer", href: "/categories/kids-furniture" },
  { label: "Salontafels", href: "/categories/coffee-tables" },
  { label: "Bijzettafels", href: "/categories/side-tables" },
]
