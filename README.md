# Medusa 2 + Enthusiast Commerce Template

A reusable production starter for a branded Dutch/Belgian webshop. It combines a Medusa 2 backend, a conversion-focused Next.js storefront and the complete Enthusiast AI stack.

## Included

- Medusa 2 backend and admin
- Next.js storefront with mobile cart, checkout, account pages and service pages
- Google Shopping, Meta and JSON feeds
- SEO, structured data and Consent Mode-ready analytics
- Internal sourcing, margins, inventory and Shopping approval controls
- `@upsidelab/medusa-plugin-enthusiast`
- Enthusiast API, worker, scheduler and frontend
- PostgreSQL and Redis for both Medusa and Enthusiast
- Railway health checks and Docker builds
- Rebrand and template verification scripts

No LVRO production database, customer information, supplier catalog, scraped reviews or credentials are included.

## One-click Railway deployment

[![Deploy on Railway](https://railway.com/button.svg)](RAILWAY_TEMPLATE_URL)

The button URL is updated after the Railway template is published. See [docs/RAILWAY_TEMPLATE.md](docs/RAILWAY_TEMPLATE.md) for the service map, required variables and first-deploy checklist.

## Local development

Requirements: Node.js 20+, npm 10+, PostgreSQL and Redis.

```bash
npm install
cp apps/backend/.env.template apps/backend/.env
cp apps/storefront/.env.example apps/storefront/.env.local
npm run backend:dev
npm run storefront:dev
```

The backend uses port `9000` by default and the storefront uses port `8100`.

## Create a new brand

Run the rebrand command immediately after creating a repository from this template:

```bash
npm run rebrand -- \
  --name "My Store" \
  --domain "mystore.nl" \
  --email "service@mystore.nl" \
  --slug "mystore"
```

Then review the legal pages, contact details, shipping promise and payment provider configuration before launch. Legal text is a starting point and not legal advice.

## First Medusa setup

1. Deploy the backend and let the migration/initial seed finish.
2. Open `/app` on the Medusa domain and create the owner account.
3. Copy the generated publishable API key to `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` on the storefront service.
4. Set the backend and storefront public domains in the CORS variables.
5. Configure payments, shipping and transactional email.
6. Keep Shopping core feed mode disabled until product, stock and Merchant Center checks pass.

## Safety defaults

- Unknown inventory is never invented.
- Shopping core-feed publication requires explicit approval.
- Sourcing data stays behind Medusa admin authorization.
- Analytics consent starts denied until the visitor opts in.
- Advertising campaigns are not activated by this repository.

## License

The commerce starter is MIT licensed. Enthusiast is included under its upstream MIT license; see `services/enthusiast/LICENSE.md`.
