FROM denoland/deno:alpine-2.5.6 AS build
COPY . .
RUN deno compile --output /bot --allow-env --allow-net --allow-run --allow-read --allow-write src/main.ts
RUN chmod +x /bot

FROM alpine:3.21
RUN apk add --no-cache ffmpeg yt-dlp && \
    adduser -D nonroot
COPY --from=build /bot /
USER nonroot
ENTRYPOINT ["/bot"]
