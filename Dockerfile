FROM node:24-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --legacy-peer-deps

FROM deps AS build
COPY shared shared
COPY server server
COPY client client
RUN npm run build -w server && npm run build -w client

FROM base AS runner
WORKDIR /app/server
ENV NODE_ENV=production
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/server/package.json ./
COPY --from=build /app/node_modules ../node_modules
COPY --from=build /app/client/dist ./client-dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
