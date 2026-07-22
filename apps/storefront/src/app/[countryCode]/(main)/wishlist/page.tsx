import { Metadata } from "next"
import WishlistView from "@modules/wishlist/components/wishlist-view"

export const metadata: Metadata = {
  title: "Favorieten",
  description: "Jouw bewaarde meubels van lvro.nl.",
  robots: { index: false, follow: true },
}

export default function WishlistPage() {
  return <WishlistView />
}
