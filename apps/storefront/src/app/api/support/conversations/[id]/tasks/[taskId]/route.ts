import { NextRequest } from "next/server"

import { forwardSupport } from "../../../../_proxy"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id, taskId } = await params
  return forwardSupport(
    request,
    `/conversations/${encodeURIComponent(id)}/tasks/${encodeURIComponent(taskId)}`
  )
}
