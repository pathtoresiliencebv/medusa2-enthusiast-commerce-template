import { NextRequest } from "next/server"

import { forwardSupport, supportBody } from "../_proxy"

export async function POST(request: NextRequest) {
  const body = await supportBody(request)
  return forwardSupport(request, "/cases", { method: "POST", body })
}
