import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Inloggen",
  description: "Log in op je lvro.nl-account.",
  robots: { index: false, follow: false },
}

export default function Login() {
  return <LoginTemplate />
}
