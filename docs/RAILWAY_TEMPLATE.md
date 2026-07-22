# Railway template architecture

The Railway template contains ten services:

| Service | Source/root | Purpose |
| --- | --- | --- |
| `medusa-db` | Railway PostgreSQL | Medusa data |
| `medusa-redis` | Railway Redis | Cache and events |
| `medusa` | `apps/backend` | Medusa API and admin |
| `storefront` | `apps/storefront` | Next.js webshop |
| `enthusiast-db` | Railway PostgreSQL | Enthusiast data |
| `enthusiast-redis` | Railway Redis | Celery and Channels |
| `enthusiast-api` | `services/enthusiast/server` | Django/ASGI API |
| `enthusiast-worker` | `services/enthusiast/server` | Celery worker |
| `enthusiast-beat` | `services/enthusiast/server` | Celery scheduler |
| `enthusiast-frontend` | `services/enthusiast/frontend` | Enthusiast UI |

## Required user input

- `ECL_ADMIN_EMAIL`
- `ECL_ADMIN_PASSWORD`
- `OPENAI_API_KEY` or another supported model provider
- `SOURCING_OWNER_EMAILS`
- Storefront/backend public domains and CORS values
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` after the first Medusa seed

## Internal references

Use Railway reference variables rather than copying credentials:

```text
DATABASE_URL=${{medusa-db.DATABASE_URL}}
REDIS_URL=${{medusa-redis.REDIS_URL}}
ECL_DB_HOST=${{enthusiast-db.PGHOST}}
ECL_DB_PORT=${{enthusiast-db.PGPORT}}
ECL_DB_USER=${{enthusiast-db.PGUSER}}
ECL_DB_PASSWORD=${{enthusiast-db.PGPASSWORD}}
ECL_DB_NAME=${{enthusiast-db.PGDATABASE}}
ECL_CELERY_BROKER_URL=${{enthusiast-redis.REDIS_URL}}
ECL_CELERY_RESULT_BACKEND=${{enthusiast-redis.REDIS_URL}}
```

Generate unique `JWT_SECRET`, `COOKIE_SECRET`, `ECL_DJANGO_SECRET_KEY`, `SUPPORT_BFF_SECRET`, `SUPPORT_INTERNAL_SECRET` and `SUPPORT_SESSION_PEPPER` values for every deployment.

## Role variables

- API: `RUN_MIGRATIONS=True`, `RUN_WORKER=False`, `RUN_BEAT=False`
- Worker: `RUN_MIGRATIONS=False`, `RUN_WORKER=True`, `RUN_BEAT=False`
- Beat: `RUN_MIGRATIONS=False`, `RUN_WORKER=False`, `RUN_BEAT=True`

Only the API service runs migrations and creates the initial Enthusiast admin.

## Launch gate

Before connecting a production domain, verify `/health` on Medusa, `/` on both frontends, the Enthusiast API docs, a test cart/checkout, inventory behavior and all Shopping-feed gates.
