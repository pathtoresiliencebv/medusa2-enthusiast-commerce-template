export type PolicySection = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
  table?: Array<[string, string]>
}

export type PolicyPageData = {
  slug: string
  eyebrow: string
  title: string
  description: string
  intro: string
  updated: string
  sections: PolicySection[]
}

export const policyPages: Record<string, PolicyPageData> = {
  levering: {
    slug: "levering",
    eyebrow: "Van bestelling tot voordeur",
    title: "Levering van je bestelling",
    description:
      "Lees hoe LVRO je bestelling levert, welke levertijd geldt en wat je doet bij vertraging of transportschade.",
    intro:
      "We houden je vanaf de bestelling op de hoogte. De levertijd op de productpagina en in je orderbevestiging is leidend voor jouw aankoop.",
    updated: "22 juli 2026",
    sections: [
      {
        title: "Wanneer wordt mijn bestelling geleverd?",
        table: [
          ["Voorraadartikel", "Doorgaans binnen 3-5 werkdagen"],
          ["Maatwerk of nabestelling", "Doorgaans binnen 6-8 weken"],
          ["Grote meubelen", "Bezorgmoment waar mogelijk vooraf afgestemd"],
        ],
        paragraphs: [
          "Een afwijkende levertijd staat vóór het bestellen op de productpagina en daarna in de orderbevestiging. Bestaat een bestelling uit meerdere artikelen, dan kunnen deze afzonderlijk aankomen.",
        ],
      },
      {
        title: "Ontvangst en controle",
        bullets: [
          "Zorg dat het bezorgadres, telefoonnummer en eventuele toegangsinformatie kloppen.",
          "Controleer het pakket bij ontvangst op zichtbare schade en maak bij schade direct foto's van verpakking en product.",
          "Bewaar de verpakking totdat je hebt vastgesteld dat het artikel compleet en onbeschadigd is.",
        ],
      },
      {
        title: "Vertraging of schade",
        paragraphs: [
          "Is de afgesproken levertermijn verstreken of is je bestelling beschadigd? Mail service@lvro.nl met je ordernummer. Bij schade ontvangen we graag duidelijke foto's. LVRO draagt het risico van verlies of beschadiging totdat jij of een door jou aangewezen ontvanger de bestelling heeft ontvangen.",
        ],
      },
    ],
  },
  retourneren: {
    slug: "retourneren",
    eyebrow: "Rustig thuis kiezen",
    title: "Retourneren en terugbetaling",
    description:
      "Bekijk de retourtermijn, retourmethode, retourkosten en terugbetaling van bestellingen bij LVRO.",
    intro:
      "Je kunt de meeste online aankopen binnen 30 kalenderdagen na ontvangst zonder opgave van reden aanmelden voor retour. Dat is ruimer dan de wettelijke bedenktijd van 14 dagen.",
    updated: "22 juli 2026",
    sections: [
      {
        title: "Zo meld je een retour aan",
        bullets: [
          "Mail binnen 30 dagen na ontvangst naar service@lvro.nl met je ordernummer en het artikel dat je wilt retourneren.",
          "Je ontvangt retourinstructies en, als dat nodig is, informatie over een ophaalafspraak.",
          "Stuur het artikel uiterlijk 14 dagen na je retourmelding terug, compleet en waar redelijkerwijs mogelijk in de originele verpakking.",
        ],
      },
      {
        title: "Retourkosten",
        paragraphs: [
          "Bij een gewone retour zijn de directe retourkosten voor jou. Voor pakketpost hangt het bedrag af van de vervoerder. Voor grote meubels bevestigen we vóór het ophalen schriftelijk de werkelijke ophaalkosten. Is een artikel verkeerd geleverd, beschadigd of ondeugdelijk, dan zijn de noodzakelijke retourkosten voor LVRO.",
        ],
      },
      {
        title: "Terugbetaling",
        paragraphs: [
          "Bij volledige herroeping betalen we het aankoopbedrag en de kosten van de goedkoopste aangeboden standaardlevering terug via dezelfde betaalmethode. Dit gebeurt uiterlijk binnen 14 dagen na je herroepingsmelding. We mogen wachten totdat het artikel terug is of totdat je aantoont dat het is verzonden.",
          "Je bent alleen aansprakelijk voor waardevermindering die ontstaat doordat je het artikel verder hebt gebruikt dan nodig was om de aard, kenmerken en werking vast te stellen.",
        ],
      },
      {
        title: "Uitzonderingen",
        paragraphs: [
          "Het herroepingsrecht kan onder meer niet gelden voor artikelen die volgens jouw specificaties zijn gemaakt of duidelijk persoonlijk van aard zijn, en voor verzegelde hygiëneproducten waarvan de verzegeling na levering is verbroken. Als een uitzondering geldt, vermelden we dit vóór aankoop op de productpagina.",
        ],
      },
    ],
  },
  betaalmethodes: {
    slug: "betaalmethodes",
    eyebrow: "Duidelijk en beveiligd",
    title: "Betaalmethodes",
    description:
      "Lees hoe betalingen bij LVRO verlopen, wanneer een bestelling definitief is en hoe terugbetalingen worden verwerkt.",
    intro:
      "De betaalmethodes die voor jouw land en bestelling beschikbaar zijn, worden tijdens het afrekenen getoond. We tonen alleen een methode als deze op dat moment daadwerkelijk kan worden gebruikt.",
    updated: "22 juli 2026",
    sections: [
      {
        title: "Veilig afrekenen",
        bullets: [
          "De webshop en checkout gebruiken een beveiligde HTTPS-verbinding.",
          "Betalingsgegevens worden door de gekozen betaalprovider verwerkt; LVRO slaat geen volledige kaartgegevens op.",
          "Eventuele transactiekosten worden vóór het plaatsen van de bestelling zichtbaar gemaakt.",
        ],
      },
      {
        title: "Wanneer is de bestelling definitief?",
        paragraphs: [
          "Na een geslaagde betaling ontvang je een orderbevestiging per e-mail. Controleer ook je map met ongewenste e-mail. Is een betaling afgebroken of afgewezen, probeer het opnieuw of neem contact met ons op voordat je een tweede bestelling plaatst.",
        ],
      },
      {
        title: "Terugbetalingen",
        paragraphs: [
          "Een goedgekeurde terugbetaling gaat in beginsel terug naar dezelfde betaalmethode. De verwerkingstijd daarna verschilt per bank of betaalprovider.",
        ],
      },
    ],
  },
  garantie: {
    slug: "garantie",
    eyebrow: "Een product dat moet kloppen",
    title: "Garantie en klachten",
    description:
      "Lees over wettelijke garantie, aanvullende garantie en het melden van een defect of klacht bij LVRO.",
    intro:
      "Je hebt altijd recht op een deugdelijk product. De wettelijke garantie heeft in Nederland geen vaste standaardduur: wat je mag verwachten hangt onder meer af van soort product, prijs, leeftijd en normaal gebruik.",
    updated: "22 juli 2026",
    sections: [
      {
        title: "Wettelijke garantie",
        paragraphs: [
          "Voldoet het artikel bij normaal gebruik niet aan wat je er redelijkerwijs van mocht verwachten? Meld dit dan zo snel mogelijk. Als het gebrek onder de wettelijke garantie valt, zorgen we kosteloos voor een passende oplossing, zoals herstel of vervanging. Als dat niet mogelijk of redelijk is, kan prijsvermindering of ontbinding aan de orde zijn.",
        ],
      },
      {
        title: "Aanvullende garantie",
        paragraphs: [
          "Op geselecteerde meubels kan een aanvullende garantie van vijf jaar gelden. Dit staat dan uitdrukkelijk op de productpagina of orderbevestiging. Een aanvullende garantie beperkt je wettelijke rechten nooit.",
        ],
      },
      {
        title: "Een gebrek of klacht melden",
        bullets: [
          "Mail service@lvro.nl met je ordernummer, een duidelijke omschrijving en foto's of video van het probleem.",
          "Stop zo nodig met gebruiken om verdere schade te voorkomen.",
          "We bevestigen je melding en laten weten welke beoordeling of oplossing volgt.",
        ],
      },
      {
        title: "Wat valt niet onder garantie?",
        paragraphs: [
          "Normale slijtage, verkeerd gebruik, onjuiste montage, onvoldoende onderhoud en schade door een externe oorzaak vallen niet automatisch onder garantie. We beoordelen dit altijd aan de hand van het product, de gebruiksinstructies en de omstandigheden.",
        ],
      },
    ],
  },
  verzending: {
    slug: "verzending",
    eyebrow: "Vooraf weten waar je aan toe bent",
    title: "Verzending en verzendkosten",
    description:
      "Bekijk het verzendgebied, de actuele verzendopties, kosten en verwachte verzendduur van LVRO.",
    intro:
      "LVRO levert via de beschikbare verzendopties in de checkout. Kosten en snelheid worden vóór het plaatsen van je bestelling getoond en moeten overeenkomen met je orderbevestiging.",
    updated: "22 juli 2026",
    sections: [
      {
        title: "Actuele verzendopties",
        table: [
          [
            "Standaard verzending",
            "€ 10 — voorraadartikelen doorgaans binnen 3-5 werkdagen",
          ],
          [
            "Express verzending",
            "€ 10 — versnelde verwerking indien beschikbaar",
          ],
        ],
        paragraphs: [
          "De checkout is leidend: beschikbaarheid kan afhangen van land, postcode, productformaat en gewicht. Alle bedragen worden inclusief btw getoond.",
        ],
      },
      {
        title: "Verzendgebied en herkomst",
        paragraphs: [
          "De Nederlandse winkel is ingericht voor levering in Nederland en België. Artikelen kunnen vanuit verschillende magazijnen of rechtstreeks via een fulfilmentpartner worden verzonden. Daardoor kunnen artikelen uit één bestelling apart aankomen en kan het land van verzending verschillen.",
        ],
      },
      {
        title: "Tracking",
        paragraphs: [
          "Zodra een vervoerder tracking beschikbaar stelt, ontvang je een trackingnummer. Je kunt dit nummer invoeren op onze Track & Trace-pagina. Een eerste scan kan enkele uren op zich laten wachten.",
        ],
      },
    ],
  },
  "algemene-voorwaarden": {
    slug: "algemene-voorwaarden",
    eyebrow: "Afspraken zonder omwegen",
    title: "Algemene voorwaarden",
    description:
      "Lees de algemene verkoopvoorwaarden van LVRO voor bestellingen, levering, betaling, retour, garantie en klachten.",
    intro:
      "Deze voorwaarden gelden voor iedere online bestelling bij LVRO. Dwingend consumentenrecht blijft altijd van toepassing en gaat vóór een afwijkende bepaling in deze voorwaarden.",
    updated: "22 juli 2026",
    sections: [
      {
        title: "1. Identiteit en contact",
        paragraphs: [
          "LVRO.nl handelt onder de naam LVRO. Voor vragen en klachten kun je mailen naar service@lvro.nl of bellen naar +31 85 060 21 40 op werkdagen van 09:00 tot 17:30.",
        ],
      },
      {
        title: "2. Aanbod en overeenkomst",
        paragraphs: [
          "We beschrijven producten, prijzen, kenmerken en levertijden zo nauwkeurig mogelijk. Kennelijke schrijf-, prijs- of technische fouten binden ons niet. De overeenkomst ontstaat wanneer je de bestelling plaatst en wij deze per e-mail bevestigen, tenzij we de bestelling op een geldige grond niet kunnen uitvoeren.",
        ],
      },
      {
        title: "3. Prijzen en betaling",
        paragraphs: [
          "Consumentenprijzen zijn inclusief btw. Verzend- of andere verplichte kosten worden vóór het bestellen getoond. Je betaalt via een methode die in de checkout beschikbaar is.",
        ],
      },
      {
        title: "4. Levering",
        paragraphs: [
          "We leveren op het opgegeven adres binnen de afgesproken termijn en uiterlijk binnen 30 dagen, tenzij je met een langere termijn hebt ingestemd. Het risico gaat over wanneer jij of een door jou aangewezen derde de bestelling ontvangt.",
        ],
      },
      {
        title: "5. Herroepingsrecht en retour",
        paragraphs: [
          "Voor de meeste artikelen biedt LVRO 30 dagen na ontvangst om de retour aan te melden. De voorwaarden, kosten, terugbetaling en wettelijke uitzonderingen staan op de pagina Retourneren en maken deel uit van deze voorwaarden.",
        ],
      },
      {
        title: "6. Garantie en conformiteit",
        paragraphs: [
          "Je hebt recht op een product dat aan de overeenkomst voldoet. Wettelijke garantie wordt niet beperkt door een commerciële garantie. Meer informatie staat op de pagina Garantie.",
        ],
      },
      {
        title: "7. Klachten en geschillen",
        paragraphs: [
          "Meld een klacht eerst bij service@lvro.nl. We proberen inhoudelijk en binnen een redelijke termijn te reageren. Op overeenkomsten is Nederlands recht van toepassing, zonder dat dit de dwingende bescherming ontneemt die je op grond van het recht van je woonland hebt. Een geschil kan worden voorgelegd aan de bevoegde rechter.",
        ],
      },
      {
        title: "8. Persoonsgegevens en wijzigingen",
        paragraphs: [
          "We verwerken persoonsgegevens volgens ons privacybeleid. We kunnen deze voorwaarden wijzigen voor toekomstige bestellingen. De versie die je bij aankoop kon raadplegen blijft gelden voor die bestelling.",
        ],
      },
    ],
  },
  privacybeleid: {
    slug: "privacybeleid",
    eyebrow: "Zorgvuldig met jouw gegevens",
    title: "Privacybeleid",
    description:
      "Lees welke persoonsgegevens LVRO verwerkt, waarom, met wie gegevens worden gedeeld en welke privacyrechten je hebt.",
    intro:
      "LVRO verwerkt alleen persoonsgegevens die nodig zijn voor de webshop, bestellingen, service, beveiliging en — met toestemming waar vereist — analyse of marketing.",
    updated: "22 juli 2026",
    sections: [
      {
        title: "Welke gegevens verwerken we?",
        bullets: [
          "Account- en contactgegevens, zoals naam, e-mailadres en telefoonnummer.",
          "Bezorg- en factuurgegevens en informatie over bestellingen, retouren en klantenservice.",
          "Betaalstatus en beperkte transactiegegevens; volledige kaartgegevens blijven bij de betaalprovider.",
          "Technische gegevens, zoals IP-adres, browser, apparaat, beveiligingslogs en cookievoorkeuren.",
          "Marketing- en analysegegevens als je daarvoor toestemming hebt gegeven of wanneer een andere geldige grondslag geldt.",
        ],
      },
      {
        title: "Doelen en grondslagen",
        table: [
          ["Bestelling en levering", "Uitvoering van de overeenkomst"],
          [
            "Klantenservice, retour en garantie",
            "Overeenkomst en gerechtvaardigd belang",
          ],
          ["Administratie en fiscale bewaarplicht", "Wettelijke verplichting"],
          [
            "Fraude- en beveiligingspreventie",
            "Gerechtvaardigd belang en wettelijke verplichting",
          ],
          [
            "Niet-noodzakelijke analyse of marketing",
            "Toestemming, waar die vereist is",
          ],
        ],
      },
      {
        title: "Met wie delen we gegevens?",
        paragraphs: [
          "We delen alleen noodzakelijke gegevens met partijen die ons helpen de webshop uit te voeren, zoals hosting, Medusa-commerce-infrastructuur, betaalproviders, magazijn- en verzendpartners, klantenservice, analyse- en beveiligingsdiensten. Track & Trace via 17TRACK wordt pas geladen wanneer je die pagina gebruikt; het ingevoerde trackingnummer wordt dan met 17TRACK gedeeld.",
          "Als een leverancier buiten de Europese Economische Ruimte verwerkt, gebruiken we waar nodig een geldig doorgiftemechanisme en passende waarborgen.",
        ],
      },
      {
        title: "Bewaartermijnen",
        paragraphs: [
          "We bewaren gegevens niet langer dan nodig voor het doel. Administratie en factuurgegevens bewaren we zolang de fiscale wet dat verlangt. Accountgegevens bewaren we tot je account wordt verwijderd, tenzij een wettelijke plicht of lopend geschil een langere termijn vereist. Gewone supportchatgesprekken bewaren we maximaal 90 dagen. Supportcases bewaren we maximaal 24 maanden, tenzij een wettelijke plicht of lopend geschil een langere bewaartermijn vereist.",
        ],
      },
      {
        title: "Jouw rechten",
        paragraphs: [
          "Je kunt vragen om inzage, correctie, verwijdering, beperking, overdracht of bezwaar. Toestemming kun je altijd intrekken zonder dat dit eerdere verwerking ongeldig maakt. Mail je verzoek naar service@lvro.nl. We kunnen om aanvullende informatie vragen om je identiteit te controleren. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens.",
        ],
      },
      {
        title: "Cookies en beveiliging",
        paragraphs: [
          "Noodzakelijke cookies zorgen voor winkelmand, checkout, voorkeuren en beveiliging. Niet-noodzakelijke analyse- of marketingtechnologie wordt alleen gebruikt volgens je keuze in de cookiebanner. Je kunt die keuze later opnieuw aanpassen. We gebruiken technische en organisatorische maatregelen om persoonsgegevens te beschermen, maar geen enkel systeem is volledig zonder risico.",
        ],
      },
    ],
  },
}

export const policySlugs = Object.keys(policyPages)
