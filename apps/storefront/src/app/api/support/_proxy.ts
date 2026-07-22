import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = "lvro_support_session"

function redact(input: string) {
  return input
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[e-mail verwijderd]")
    .replace(/(?:\+31|0031|0)[\s.-]?(?:\d[\s.-]?){8,10}/g, "[telefoon verwijderd]")
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, "[betaalgegevens verwijderd]")
    .replace(/\b\d{4}\s?[A-Z]{2}\b(?:\s+[^,.;\n]{1,60})?/gi, "[adres verwijderd]")
    .slice(0, 2000)
    .trim()
}

export async function supportBody(request: NextRequest, redactFields: string[] = []) {
  const body = await request.json().catch(() => ({}))
  for (const field of redactFields) {
    if (typeof body[field] === "string") body[field] = redact(body[field])
  }
  return body
}

export async function forwardSupport(
  request: NextRequest,
  path: string,
  init: { method?: string; body?: unknown } = {}
) {
  const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const bffSecret = process.env.SUPPORT_BFF_SECRET
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (!backend || !bffSecret || !publishableKey) {
    return NextResponse.json(
      { message: "De supportchat is nog niet beschikbaar. Neem contact op via service@lvro.nl." },
      { status: 503 }
    )
  }
  const existingSession = request.cookies.get(SESSION_COOKIE)?.value
  const session = existingSession || crypto.randomUUID()
  const auth = request.cookies.get("_medusa_jwt")?.value
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  let upstream: Response
  try {
    upstream = await fetch(`${backend.replace(/\/$/, "")}/store/support${path}`, {
      method: init.method || request.method,
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey,
        "x-support-bff-secret": bffSecret,
        "x-support-session": session,
        "x-support-client-ip": clientIp,
        ...(auth ? { authorization: `Bearer ${auth}` } : {}),
      },
      ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    })
  } catch {
    return NextResponse.json(
      { message: "De klantenservice is tijdelijk niet bereikbaar. Je kunt wel een medewerker inschakelen." },
      { status: 503 }
    )
  }
  const text = await upstream.text()
  const payload = (() => {
    try { return text ? JSON.parse(text) : {} } catch { return { message: "Onverwacht antwoord van de supportservice." } }
  })()
  const response = NextResponse.json(payload, { status: upstream.status })
  if (!existingSession) {
    response.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 90 * 24 * 60 * 60,
      path: "/",
    })
  }
  response.headers.set("Cache-Control", "no-store")
  return response
}
