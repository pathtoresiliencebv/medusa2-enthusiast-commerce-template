import { MedusaService } from "@medusajs/framework/utils";

import Bundle from "./models/bundle";
import PodVariantMapping from "./models/pod-variant-mapping";
import PodWebhookEvent from "./models/pod-webhook-event";
import ProductMerchandising from "./models/product-merchandising";
import Review from "./models/review";
import MerchantIssue from "./models/merchant-issue";
import SourcingAuditLog from "./models/sourcing-audit-log";
import SourcingCostDefault from "./models/sourcing-cost-default";
import SourcingProfile from "./models/sourcing-profile";

class ConversionModuleService extends MedusaService({
  Review,
  ProductMerchandising,
  Bundle,
  PodVariantMapping,
  PodWebhookEvent,
  SourcingProfile,
  SourcingAuditLog,
  SourcingCostDefault,
  MerchantIssue,
}) {}

export default ConversionModuleService;
