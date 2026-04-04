FROM denoland/deno:alpine-2.5.6 AS build
COPY . .
RUN deno compile --output /bot --allow-env --allow-net --allow-run --allow-read --allow-write src/main.ts
RUN chmod +x /bot

FROM alpine:3.21 AS tools
RUN apk add --no-cache curl
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp
RUN curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o /tmp/ffmpeg.tar.xz && \
    mkdir /tmp/ffmpeg && \
    tar xJf /tmp/ffmpeg.tar.xz -C /tmp/ffmpeg --strip-components=1 && \
    cp /tmp/ffmpeg/ffmpeg /tmp/ffmpeg/ffprobe /usr/local/bin/ && \
    rm -rf /tmp/ffmpeg /tmp/ffmpeg.tar.xz

FROM gcr.io/distroless/cc:nonroot
COPY --from=build /bot /
COPY --from=tools /usr/local/bin/yt-dlp /usr/bin/yt-dlp
COPY --from=tools /usr/local/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=tools /usr/local/bin/ffprobe /usr/bin/ffprobe
ENTRYPOINT ["/bot"]
