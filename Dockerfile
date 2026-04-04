FROM denoland/deno:alpine-2.5.6 AS build
COPY . .
RUN deno compile --output /bot --allow-env --allow-net --allow-run --allow-read --allow-write src/main.ts
RUN chmod +x /bot

FROM debian:bookworm-slim
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates ffmpeg yt-dlp && \
    rm -rf /var/lib/apt/lists/* && \
    useradd -r nonroot
COPY --from=build /bot /
USER nonroot
ENTRYPOINT ["/bot"]
