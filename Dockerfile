FROM denoland/deno:alpine-2.5.6 AS build
COPY . .
RUN deno compile --output /bot --allow-env --allow-net src/main.ts
RUN chmod +x /bot

FROM gcr.io/distroless/cc:nonroot
COPY --from=build /bot /
ENTRYPOINT ["/bot"]
