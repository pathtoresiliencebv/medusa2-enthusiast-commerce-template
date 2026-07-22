import { Heading, Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center"
      data-testid="empty-cart-message"
    >
      <Heading level="h1" className="font-display text-5xl font-normal">
        Je winkelmand is nog leeg
      </Heading>
      <Text className="mt-5 mb-8 max-w-lg text-base leading-7 text-ui-fg-subtle">
        Ontdek onze collectie tijdloze meubels en bewaar je favorieten voor een
        interieur dat echt bij je past.
      </Text>
      <div>
        <InteractiveLink href="/store">Bekijk de collectie</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
