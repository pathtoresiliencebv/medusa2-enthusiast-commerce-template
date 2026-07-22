// @ts-nocheck -- Medusa Admin compiles React 18 separately from the workspace React 19 types.
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { ChartBar } from "@medusajs/icons";
import { Button, Container, Heading, Text } from "@medusajs/ui";

const ProductConversionWidget = () => (
  <Container className="flex items-center justify-between p-6">
    <div className="flex items-start gap-3">
      <ChartBar className="mt-0.5" />
      <div>
        <Heading level="h2">Conversie-merchandising</Heading>
        <Text className="text-ui-fg-subtle">
          Beheer staffels, swatches, aanbevelingen, bundels en reviews.
        </Text>
      </div>
    </div>
    <Button asChild variant="secondary">
      <a href="/app/conversion">Open conversiecentrum</a>
    </Button>
  </Container>
);

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductConversionWidget;
