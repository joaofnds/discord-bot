FROM denoland/deno:alpine AS build
COPY . .
RUN deno compile --output /bot --allow-env --allow-net --unstable-otel src/main.ts
RUN chmod +x /bot

FROM gcr.io/distroless/cc:nonroot
COPY --from=build /bot /
ENTRYPOINT ["/bot"]
