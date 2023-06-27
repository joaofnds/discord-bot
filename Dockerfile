FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production


FROM gcr.io/distroless/nodejs20-debian11
ENV NODE_ENV=production
USER 1000
WORKDIR /app
COPY --from=deps /app/node_modules/ ./node_modules
COPY ./src ./src
CMD ["src/main.mjs"]