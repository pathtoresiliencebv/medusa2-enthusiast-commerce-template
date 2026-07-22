import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any;
  const requestedHandle = decodeURIComponent(req.params.handle);
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["handle", "metadata"],
    pagination: { skip: 0, take: 10000 },
  });
  const product = products.find((item: any) =>
    Array.isArray(item.metadata?.legacy_handles)
      ? item.metadata.legacy_handles.includes(requestedHandle)
      : false,
  );

  if (!product) {
    return res.status(404).json({ message: "Redirect niet gevonden." });
  }

  res.json({ handle: product.handle });
}
