import { NextRequest } from "next/server"

import { forwardSupport } from "../_proxy"

export async function GET(request: NextRequest) {
  return forwardSupport(request, "/config")
}
