FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package.json .npmrc ./
COPY vendor ./vendor
RUN npm install

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends libatomic1 \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.medusa/server ./
COPY .npmrc ./
COPY vendor ./vendor
RUN npm install --omit=dev

EXPOSE 9000

CMD ["npm", "run", "start"]
