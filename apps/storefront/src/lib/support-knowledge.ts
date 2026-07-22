import { brand } from "./brand"
import { policyPages } from "./service-policy-data"

export type SupportFaqItem = { question: string; answer: string }
export type SupportFaqGroup = { id: string; title: string; items: SupportFaqItem[] }

export const supportFaqGroups: SupportFaqGroup[] = [
  {
    id: "bestellen-en-betalen",
    title: "Bestellen en betalen",
    items: [
      {
        question: "Heb ik een account nodig om te bestellen?",
        answer: "Nee. Je kunt als gast bestellen. Met een account kun je jouw gegevens en bestellingen wel makkelijker terugvinden.",
      },
      {
        question: "Welke betaalmethodes kan ik gebruiken?",
        answer: "De betaalmethodes die voor jouw land en bestelling beschikbaar zijn, zie je tijdens het afrekenen. We tonen alleen methodes die je op dat moment kunt gebruiken.",
      },
      {
        question: "Wanneer is mijn bestelling definitief?",
        answer: "Na een geslaagde betaling ontvang je een orderbevestiging per e-mail. Controleer ook je map met ongewenste e-mail.",
      },
      {
        question: "Kan ik mijn bestelling nog wijzigen?",
        answer: `Mail zo snel mogelijk naar ${brand.email} met je ordernummer. We bekijken wat nog mogelijk is, maar kunnen een wijziging na verwerking niet garanderen.`,
      },
    ],
  },
  {
    id: "levering-en-tracking",
    title: "Levering en tracking",
    items: [
      {
        question: "Wat is de verwachte levertijd?",
        answer: "Voorraadartikelen worden doorgaans binnen 3-5 werkdagen geleverd. Voor maatwerk of nabestellingen geldt doorgaans 6-8 weken. De levertijd op de productpagina en in je orderbevestiging is leidend.",
      },
      {
        question: "Hoe volg ik mijn bestelling?",
        answer: "Zodra de vervoerder tracking beschikbaar stelt, ontvang je een trackingnummer. Voer dat nummer in op onze Track & Trace-pagina.",
      },
      {
        question: "Kan mijn bestelling in meerdere delen aankomen?",
        answer: "Ja. Artikelen kunnen vanuit verschillende magazijnen of via een fulfilmentpartner worden verzonden. Daardoor kunnen delen van één bestelling apart aankomen.",
      },
      {
        question: "Wat doe ik bij schade tijdens de levering?",
        answer: `Maak direct duidelijke foto's van de verpakking en het product. Mail deze samen met je ordernummer naar ${brand.email}. Bewaar de verpakking totdat je melding is beoordeeld.`,
      },
    ],
  },
  {
    id: "retour-en-garantie",
    title: "Retour en garantie",
    items: [
      {
        question: "Hoe lang heb ik om een retour aan te melden?",
        answer: "Je kunt de meeste online aankopen binnen 30 kalenderdagen na ontvangst aanmelden voor retour. Stuur het artikel daarna uiterlijk binnen 14 dagen terug.",
      },
      {
        question: "Wie betaalt de retourkosten?",
        answer: "Bij een gewone retour betaal je de directe retourkosten. Is een artikel verkeerd geleverd, beschadigd of ondeugdelijk, dan zijn de noodzakelijke retourkosten voor LVRO.",
      },
      {
        question: "Wanneer ontvang ik mijn terugbetaling?",
        answer: "We betalen uiterlijk binnen 14 dagen na je herroepingsmelding terug. We mogen wachten totdat het artikel terug is of totdat je aantoont dat het is verzonden.",
      },
      {
        question: "Welke garantie krijg ik?",
        answer: "Je hebt altijd recht op een deugdelijk product. Op geselecteerde meubels kan daarnaast vijf jaar aanvullende garantie gelden. Dit staat dan op de productpagina of orderbevestiging.",
      },
    ],
  },
]

export const publicSupportKnowledge = {
  version: "2026-07-22",
  entries: [
    ...supportFaqGroups.flatMap((group) =>
      group.items.map((item) => ({
        id: `faq-${group.id}-${item.question.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        title: group.title,
        question: item.question,
        answer: item.answer,
        keywords: group.id.split("-"),
        source_url: `https://lvro.nl/nl/faq#${group.id}`,
      }))
    ),
    ...Object.values(policyPages).flatMap((page) =>
      page.sections.map((section, index) => ({
        id: `policy-${page.slug}-${index + 1}`,
        title: `${page.title}: ${section.title}`,
        question: section.title,
        answer: [
          ...(section.paragraphs || []),
          ...(section.bullets || []),
          ...(section.table || []).map(([label, value]) => `${label}: ${value}`),
        ].join(" "),
        keywords: [page.slug, page.title, section.title],
        source_url: `https://lvro.nl/nl/${page.slug}`,
      }))
    ),
  ],
}
