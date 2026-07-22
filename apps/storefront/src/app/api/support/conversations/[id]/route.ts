import { NextRequest } from "next/server"

import { forwardSupport, supportBody } from "../../_proxy"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return forwardSupport(request, `/conversations/${encodeURIComponent(id)}`)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return forwardSupport(request, `/conversations/${encodeURIComponent(id)}`, {
    method: "POST",
    body: await supportBody(request, ["message"]),
  })
}
