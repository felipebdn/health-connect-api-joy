# Etapa base
FROM node:22 AS base
RUN npm install -g pnpm

# Etapa de instalação de dependências
FROM base AS dependencies
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Etapa de build
FROM base AS build
WORKDIR /usr/src/app
COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
RUN pnpm build
# Garanta que apenas dependências de produção estão disponíveis
RUN pnpm prune --prod

# Etapa de produção
FROM node:22-alpine AS production
WORKDIR /usr/src/app
RUN npm install -g pnpm

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json

EXPOSE 3333
CMD ["node", "dist/src/infra/http/server.js"]
