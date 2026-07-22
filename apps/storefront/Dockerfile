FROM node:22-bookworm-slim AS builder

WORKDIR /app

ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://backend.invalid
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_template_runtime
ARG NEXT_PUBLIC_BASE_URL=https://storefront.invalid
ARG NEXT_PUBLIC_DEFAULT_REGION=nl
ARG NEXT_PUBLIC_STORE_NAME="My Store"
ARG NEXT_PUBLIC_STORE_EMAIL="support@example.com"

ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION
ENV NEXT_PUBLIC_STORE_NAME=$NEXT_PUBLIC_STORE_NAME
ENV NEXT_PUBLIC_STORE_EMAIL=$NEXT_PUBLIC_STORE_EMAIL

COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app ./
COPY --from=builder /app/docker-entrypoint.sh /usr/local/bin/storefront-entrypoint
RUN chmod +x /usr/local/bin/storefront-entrypoint
EXPOSE 8100

ENTRYPOINT ["storefront-entrypoint"]
CMD ["npm", "run", "start"]
