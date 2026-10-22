FROM oven/bun:1.4.4-debian AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun --no-env-file install --frozen-lockfile --production --ignore-scripts

COPY tsconfig.json bunfig.toml ./
COPY src ./src
RUN bun run build

FROM gcr.io/distroless/cc:nonroot
COPY --from=build /app/bot /bot
ENTRYPOINT ["/bot"]
