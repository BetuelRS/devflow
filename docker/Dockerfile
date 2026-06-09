FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm install
COPY shared shared
COPY server server
COPY client client
RUN npm run build -w shared && npm run build -w server && npm run build -w client

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/server/dist server/dist
COPY --from=builder /app/client/dist client/dist
COPY --from=builder /app/server/package.json server/
COPY --from=builder /app/node_modules node_modules
EXPOSE 3001
CMD ["node", "server/dist/index.js"]
