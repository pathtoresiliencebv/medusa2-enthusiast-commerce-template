import { loadEnv, defineConfig } from "@medusajs/framework/utils";
import path from "node:path";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

const enthusiastPluginPath = path.dirname(
  require.resolve("@upsidelab/medusa-plugin-enthusiast/package.json", {
    paths: [__dirname],
  }),
);

const plugins = [
  {
    resolve: enthusiastPluginPath,
    options: {
      enthusiastApiUrl: process.env.ENTHUSIAST_API_URL,
      enthusiastWSUrl: process.env.ENTHUSIAST_WS_URL,
      enthusiastServiceAccountToken:
        process.env.ENTHUSIAST_SERVICE_ACCOUNT_TOKEN,
      enthusiastMedusaIntegrationName:
        process.env.ENTHUSIAST_INTEGRATION_NAME || "Medusa",
      medusaBackendUrl: process.env.ENTHUSIAST_MEDUSA_BACKEND_URL,
      medusaAdminUrl: process.env.ENTHUSIAST_MEDUSA_ADMIN_URL,
    },
  },
];

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    {
      resolve: "./src/modules/support",
    },
    {
      resolve: "./src/modules/conversion",
    },
    ...(process.env.STRIPE_API_KEY && process.env.STRIPE_WEBHOOK_SECRET
      ? [
          {
            resolve: "@medusajs/medusa/payment",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/payment-stripe",
                  id: "stripe",
                  options: {
                    apiKey: process.env.STRIPE_API_KEY,
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                    capture: true,
                    automaticPaymentMethods: true,
                    paymentDescription: `${process.env.STORE_NAME || "Webshop"} bestelling`,
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
  plugins,
});
