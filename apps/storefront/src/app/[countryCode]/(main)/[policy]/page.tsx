import { Metadata } from "next"
import { notFound } from "next/navigation"
import { localizedAlternates } from "@lib/seo"
import { policyPages } from "@lib/service-policy-data"
import PolicyPage from "@modules/service/components/policy-page"

type Params = Promise<{ countryCode: string; policy: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { countryCode, policy } = await params
  const data = policyPages[policy]

  if (!data) return {}

  const alternates = localizedAlternates(countryCode, `/${data.slug}`)

  return {
    title: data.title,
    description: data.description,
    alternates,
    openGraph: {
      title: `${data.title} | lvro.nl`,
      description: data.description,
      url: alternates.canonical,
      type: "website",
    },
  }
}

export default async function PolicyRoute({ params }: { params: Params }) {
  const { policy } = await params
  const data = policyPages[policy]

  if (!data) notFound()

  return <PolicyPage data={data} />
}
