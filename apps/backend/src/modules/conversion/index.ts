import { Module } from "@medusajs/framework/utils";

import ConversionModuleService from "./service";

export const CONVERSION_MODULE = "conversion";

export default Module(CONVERSION_MODULE, {
  service: ConversionModuleService,
});
