import { publicSupportKnowledge } from "@lib/support-knowledge"
import { NextResponse } from "next/server"

export const revalidate = 3600

export async function GET() {
  return NextResponse.json(publicSupportKnowledge, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  })
}
