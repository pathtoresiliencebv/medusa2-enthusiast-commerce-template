"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Productinformatie",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Levering en retour",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const material =
    typeof product.metadata?.material === "string"
      ? product.metadata.material
      : product.material
  const dimensions =
    typeof product.metadata?.dimensions === "string"
      ? product.metadata.dimensions
      : null

  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Materiaal</span>
            <p>{material || "Op aanvraag"}</p>
          </div>
          <div>
            <span className="font-semibold">Afmetingen</span>
            <p>{dimensions || "Afhankelijk van de gekozen uitvoering"}</p>
          </div>
          <div>
            <span className="font-semibold">Uitvoeringen</span>
            <p>
              {product.options
                ?.map((option) => option.title)
                .filter(Boolean)
                .join(" en ") || "Zie de beschikbare keuzes"}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Onderhoud</span>
            <p>Regelmatig afstoffen en vlekken direct deppen.</p>
          </div>
          <div>
            <span className="font-semibold">Advies</span>
            <p>Vraag gratis een materiaal- of maatadvies aan.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Snelle, afgestemde levering</span>
            <p className="max-w-sm">
              Voorraadartikelen arriveren doorgaans binnen 3-5 werkdagen. Voor
              grote meubels stemmen we de bezorgdag vooraf met je af.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Eenvoudig ruilen</span>
            <p className="max-w-sm">
              Past de uitvoering niet bij je ruimte? Neem contact op; we helpen
              je met een passende omruiling.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">30 dagen retour</span>
            <p className="max-w-sm">
              Meld je retour binnen 30 dagen aan. We maken de vervolgstappen en
              eventuele ophaalafspraak vooraf duidelijk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
