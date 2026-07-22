"use client"

import { trackSupport } from "@lib/analytics"
import { FormEvent, useEffect, useRef, useState } from "react"

import type { CaseType, SupportMessage, SupportOrder } from "../types"

type Props = { authenticated: boolean; countryCode: string; orders: SupportOrder[] }
type CaseDraft = {
  type: CaseType
  subject: string
  message: string
  orderId: string
  idempotencyKey: string
}

const CASE_LABELS: Record<CaseType, string> = {
  general: "Medewerker",
  cancellation: "Annulering aanvragen",
  return: "Retour aanmelden",
  damage: "Schade melden",
  delivery: "Leveringsvraag",
  payment: "Betalingsvraag",
}

function cleanAnswer(value: string) {
  return value
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/\[(LOGIN_REQUIRED|HANDOFF_AVAILABLE)\]/g, "")
    .trim()
}

async function jsonRequest(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || payload.error || "De supportservice reageert niet.")
  return payload
}

export default function SupportChat({ authenticated, countryCode, orders }: Props) {
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState("")
  const [showLogin, setShowLogin] = useState(false)
  const [showHandoff, setShowHandoff] = useState(false)
  const [caseType, setCaseType] = useState<CaseType | null>(null)
  const [caseStage, setCaseStage] = useState<"form" | "confirm">("form")
  const [caseDraft, setCaseDraft] = useState<CaseDraft | null>(null)
  const [caseBusy, setCaseBusy] = useState(false)
  const [caseResult, setCaseResult] = useState<string | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    jsonRequest("/api/support/config")
      .then((payload) => setEnabled(Boolean(payload.enabled)))
      .catch(() => setEnabled(false))
  }, [])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const stored = window.localStorage.getItem("lvro-support-conversation")
    if (!stored || conversationId) return
    jsonRequest(`/api/support/conversations/${encodeURIComponent(stored)}`)
      .then((payload) => {
        setConversationId(stored)
        setMessages(payload.conversation?.messages || [])
      })
      .catch(() => window.localStorage.removeItem("lvro-support-conversation"))
  }, [open, conversationId])

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, typing, error])

  useEffect(() => {
    if (!open) return
    const escape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", escape)
    return () => window.removeEventListener("keydown", escape)
  }, [open])

  const launch = () => {
    setOpen(true)
    trackSupport("support_chat_opened", { authenticated })
  }

  const ensureConversation = async () => {
    if (conversationId) return conversationId
    const payload = await jsonRequest("/api/support/conversations", {
      method: "POST",
      body: JSON.stringify({ locale: countryCode }),
    })
    const id = payload.conversation.id as string
    setConversationId(id)
    window.localStorage.setItem("lvro-support-conversation", id)
    return id
  }

  const send = async (value: string) => {
    const question = value.trim()
    if (!question || typing || question.length > 2000) return
    setError("")
    setShowLogin(false)
    setShowHandoff(false)
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", content: question }])
    setInput("")
    setTyping(true)
    trackSupport("support_question_sent", { authenticated })
    try {
      const id = await ensureConversation()
      const queued = await jsonRequest(`/api/support/conversations/${encodeURIComponent(id)}`, {
        method: "POST",
        body: JSON.stringify({ message: question }),
      })
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => window.setTimeout(resolve, 1000))
        const result = await jsonRequest(
          `/api/support/conversations/${encodeURIComponent(id)}/tasks/${encodeURIComponent(queued.task.id)}`
        )
        if (result.task?.state === "success") {
          const latest = (result.messages || []) as SupportMessage[]
          const answer = [...latest].reverse().find((item) => item.role === "assistant")
          if (!answer) throw new Error("Er kwam geen leesbaar antwoord terug.")
          setShowLogin(answer.content.includes("[LOGIN_REQUIRED]"))
          setShowHandoff(answer.content.includes("[HANDOFF_AVAILABLE]"))
          setMessages(latest)
          trackSupport("support_answer_received", { authenticated })
          return
        }
      }
      throw new Error("Het antwoord duurt langer dan verwacht.")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Er ging iets mis.")
      setShowHandoff(true)
    } finally {
      setTyping(false)
    }
  }

  const startCase = (type: CaseType) => {
    if (type !== "general" && !authenticated) {
      setShowLogin(true)
      return
    }
    setCaseType(type)
    setCaseStage("form")
    setCaseDraft(null)
    setCaseResult(null)
  }

  const prepareCase = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const orderId = String(data.get("orderId") || "")
    if (caseType !== "general" && orders.length && !orderId) {
      setError("Selecteer eerst de bestelling waarop je aanvraag betrekking heeft.")
      return
    }
    setError("")
    setCaseDraft({
      type: caseType!,
      subject: String(data.get("subject") || "").trim(),
      message: String(data.get("message") || "").trim(),
      orderId,
      idempotencyKey: crypto.randomUUID(),
    })
    setCaseStage("confirm")
  }

  const confirmCase = async () => {
    if (!caseDraft || caseBusy) return
    setCaseBusy(true)
    setError("")
    try {
      const id = await ensureConversation()
      const payload = await jsonRequest("/api/support/cases", {
        method: "POST",
        headers: { "Idempotency-Key": caseDraft.idempotencyKey },
        body: JSON.stringify({
          type: caseDraft.type,
          conversationId: id,
          subject: caseDraft.subject,
          message: caseDraft.message,
          orderId: caseDraft.orderId || undefined,
          idempotencyKey: caseDraft.idempotencyKey,
        }),
      })
      setCaseResult(payload.case.id)
      setCaseType(null)
      trackSupport("support_case_created", { authenticated, category: caseDraft.type })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "De aanvraag kon niet worden opgeslagen.")
    } finally {
      setCaseBusy(false)
    }
  }

  if (!enabled) return null

  return (
    <>
      <button
        type="button"
        onClick={launch}
        aria-label="Open LVRO klantenservicechat"
        aria-expanded={open}
        className="focus-brand fixed bottom-5 right-5 z-[80] flex min-h-14 items-center gap-2 rounded-full bg-[#15162a] px-5 text-sm font-black text-white shadow-[0_16px_45px_rgba(21,22,42,.28)] hover:bg-[#6554c0]"
      >
        <span aria-hidden="true">✦</span> Hulp nodig?
      </button>
      {open && (
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="lvro-support-title"
          className="fixed inset-0 z-[90] flex flex-col bg-white text-[#15162a] sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(720px,calc(100vh-40px))] sm:w-[430px] sm:overflow-hidden sm:rounded-[20px] sm:border sm:border-[#dedbe9] sm:shadow-[0_22px_70px_rgba(21,22,42,.24)]"
        >
          <header className="flex items-start justify-between bg-[#15162a] px-5 py-4 text-white">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-[#ff9c9c]">LVRO Customer Support</p>
              <h2 id="lvro-support-title" className="mt-1 text-lg font-black">Waar kunnen we mee helpen?</h2>
              <p className="mt-1 text-xs text-white/70">AI-assistent · medewerker altijd beschikbaar</p>
            </div>
            <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Sluit chat" className="focus-brand rounded-full p-2 text-xl">×</button>
          </header>

          {caseType ? (
            <div className="flex-1 overflow-y-auto p-5">
              <button type="button" onClick={() => setCaseType(null)} className="focus-brand text-sm font-black underline">← Terug naar chat</button>
              <h3 className="mt-5 text-xl font-black">{CASE_LABELS[caseType]}</h3>
              {caseStage === "form" ? (
                <form className="mt-5 grid gap-4" onSubmit={prepareCase}>
                  {caseType !== "general" && (
                    <label className="grid gap-1 text-sm font-bold">
                      Bestelling
                      <select name="orderId" required={orders.length > 0} className="focus-brand min-h-12 rounded-xl border border-[#dedbe9] px-3 font-normal">
                        <option value="">Selecteer een bestelling</option>
                        {orders.map((order) => <option key={order.id} value={order.id}>Bestelling #{order.display_id || order.id.slice(-8)}</option>)}
                      </select>
                      {!orders.length && <span className="text-xs font-normal text-[#69667a]">Er staan geen bestellingen in dit account. Kies Medewerker voor algemene hulp.</span>}
                    </label>
                  )}
                  <label className="grid gap-1 text-sm font-bold">Onderwerp<input required maxLength={160} name="subject" className="focus-brand min-h-12 rounded-xl border border-[#dedbe9] px-3 font-normal" /></label>
                  <label className="grid gap-1 text-sm font-bold">Toelichting<textarea required maxLength={2000} name="message" rows={6} className="focus-brand rounded-xl border border-[#dedbe9] p-3 font-normal" /></label>
                  <p className="text-xs leading-5 text-[#69667a]">Er wordt nog niets geannuleerd, terugbetaald of gewijzigd. Je registreert alleen een verzoek voor beoordeling.</p>
                  <button className="brand-button" type="submit">Controleer aanvraag</button>
                </form>
              ) : caseDraft ? (
                <div className="mt-5 rounded-2xl bg-[#f7f6fb] p-5">
                  <p className="text-xs font-black uppercase text-[#6554c0]">Controleer en bevestig</p>
                  <p className="mt-3 font-black">{caseDraft.subject}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{caseDraft.message}</p>
                  <div className="mt-5 flex gap-3">
                    <button type="button" onClick={() => setCaseStage("form")} className="focus-brand rounded-full border px-5 py-3 text-xs font-black">Wijzigen</button>
                    <button type="button" disabled={caseBusy} onClick={confirmCase} className="brand-button disabled:opacity-50">{caseBusy ? "Opslaan..." : "Definitief indienen"}</button>
                  </div>
                </div>
              ) : null}
              {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            </div>
          ) : (
            <>
              <div className="border-b border-[#dedbe9] px-4 py-3">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <button onClick={() => send("Help mij een passend product te vinden.")} className="focus-brand shrink-0 rounded-full bg-[#efedf8] px-3 py-2 text-xs font-black">Product zoeken</button>
                  <button onClick={() => authenticated ? send("Wat is de status van mijn meest recente bestelling?") : setShowLogin(true)} className="focus-brand shrink-0 rounded-full bg-[#efedf8] px-3 py-2 text-xs font-black">Orderstatus</button>
                  <button onClick={() => startCase("return")} className="focus-brand shrink-0 rounded-full bg-[#efedf8] px-3 py-2 text-xs font-black">Retour</button>
                  <button onClick={() => startCase("damage")} className="focus-brand shrink-0 rounded-full bg-[#efedf8] px-3 py-2 text-xs font-black">Schade</button>
                  <button onClick={() => startCase("cancellation")} className="focus-brand shrink-0 rounded-full bg-[#efedf8] px-3 py-2 text-xs font-black">Annulering</button>
                  <button onClick={() => startCase("general")} className="focus-brand shrink-0 rounded-full bg-[#efedf8] px-3 py-2 text-xs font-black">Medewerker</button>
                </div>
              </div>
              <div ref={messagesRef} role="log" aria-live="polite" aria-label="Chatgeschiedenis" className="flex-1 space-y-3 overflow-y-auto bg-[#f7f6fb] p-4">
                {!messages.length && (
                  <div className="rounded-2xl bg-white p-4 text-sm leading-6 shadow-sm">Hoi! Ik help je met producten, levering, retouren en je eigen bestellingen. Deel geen adres of betaalgegevens in de chat.</div>
                )}
                {messages.map((message) => (
                  <div key={message.id} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-[#6554c0] text-white" : "bg-white shadow-sm"}`}>
                    {cleanAnswer(message.content)}
                  </div>
                ))}
                {typing && <p role="status" className="w-fit rounded-2xl bg-white px-4 py-3 text-sm text-[#69667a]">LVRO typt<span aria-hidden="true">…</span></p>}
                {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
                {caseResult && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Aanvraag opgeslagen als case {caseResult}. Een medewerker beoordeelt je verzoek.</p>}
                {showLogin && (
                  <a href={`/${countryCode}/account`} className="brand-button w-full">Log in om bestellingen te bekijken</a>
                )}
                {showHandoff && (
                  <button type="button" onClick={() => startCase("general")} className="brand-button w-full">Schakel een medewerker in</button>
                )}
              </div>
              <form onSubmit={(event) => { event.preventDefault(); send(input) }} className="border-t border-[#dedbe9] bg-white p-4">
                <label htmlFor="lvro-support-message" className="sr-only">Typ je vraag</label>
                <div className="flex items-end gap-2">
                  <textarea id="lvro-support-message" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(input) } }} maxLength={2000} rows={2} placeholder="Typ je vraag…" className="focus-brand min-h-12 flex-1 resize-none rounded-xl border border-[#dedbe9] p-3 text-sm" />
                  <button type="submit" disabled={typing || !input.trim()} aria-label="Verstuur bericht" className="focus-brand h-12 rounded-xl bg-[#15162a] px-4 font-black text-white disabled:opacity-40">↑</button>
                </div>
                <p className="mt-2 text-[11px] text-[#69667a]">AI kan fouten maken. Gevoelige gegevens worden verwijderd vóór verwerking.</p>
              </form>
            </>
          )}
        </section>
      )}
    </>
  )
}
