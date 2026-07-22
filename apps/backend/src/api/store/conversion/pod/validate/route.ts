import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { CONVERSION_MODULE } from "../../../../../modules/conversion";

type ValidatePodBody = {
  variant_id?: string;
  personalization?: Record<string, string>;
};

export async function POST(
  req: MedusaRequest<ValidatePodBody>,
  res: MedusaResponse,
) {
  const { variant_id, personalization = {} } = req.body;
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const [mapping] = await service.listPodVariantMappings({
    variant_id,
    active: true,
  });

  if (!mapping) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Geen actieve POD-koppeling voor deze variant.",
    );
  }

  const schema = (mapping.personalization_schema || {}) as Record<
    string,
    { required?: boolean; max_length?: number }
  >;
  const errors = Object.entries(schema).flatMap(([key, rule]) => {
    const value = personalization[key]?.trim() || "";
    if (rule.required && !value) return [`${key} is verplicht.`];
    if (rule.max_length && value.length > rule.max_length) {
      return [`${key} mag maximaal ${rule.max_length} tekens bevatten.`];
    }
    return [];
  });

  if (errors.length) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, errors.join(" "));
  }

  res.json({ valid: true, provider: mapping.provider });
}
