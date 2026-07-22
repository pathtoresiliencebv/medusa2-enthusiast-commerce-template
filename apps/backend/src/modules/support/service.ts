import { MedusaService } from "@medusajs/framework/utils";

import SupportCase from "./models/support-case";
import SupportConversation from "./models/support-conversation";

class SupportModuleService extends MedusaService({
  SupportConversation,
  SupportCase,
}) {}

export default SupportModuleService;
