"use client"

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new Event("lvro:open-cookie-settings"))
      }
      className="text-left hover:text-white"
    >
      Cookievoorkeuren
    </button>
  )
}
