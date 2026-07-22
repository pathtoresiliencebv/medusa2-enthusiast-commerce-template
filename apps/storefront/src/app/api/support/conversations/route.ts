import { NextRequest } from "next/server"

import { forwardSupport, supportBody } from "../_proxy"

export async function POST(request: NextRequest) {
  return forwardSupport(request, "/conversations", {
    method: "POST",
    body: await supportBody(request),
  })
}
