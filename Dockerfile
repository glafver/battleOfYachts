# ---- Stage 1: build the React client ----
FROM node:18-alpine AS client-build
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
ENV CI=false
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# ---- Stage 2: run the server ----
FROM node:18-alpine
WORKDIR /usr/src/app

COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/ ./
COPY --from=client-build /app/client/build ./public

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "server.js"]
