export interface MyinstantsResult {
  title: string;
  instantUrl: string;
  audioUrl: string;
  path: string;
}

export interface MyinstantsClient {
  search(query: string): Promise<MyinstantsResult[]>;
  getInstant(pathOrUrl: string): Promise<MyinstantsResult | null>;
}

const BASE_URL = "https://www.myinstants.com";
const HTML_HEADERS = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
};

export class MyinstantsAPI implements MyinstantsClient {
  async search(query: string): Promise<MyinstantsResult[]> {
    const url = new URL("/en/search/", BASE_URL);
    url.searchParams.set("name", query);

    const html = await this.fetchHtml(url.toString());
    const matches = html.matchAll(
      /<button class="small-button" onclick="play\('([^']+)'[\s\S]*?<a href="([^"]+)" class="instant-link link-secondary">([\s\S]*?)<\/a>/g,
    );

    const results = new Map<string, MyinstantsResult>();

    for (const match of matches) {
      const audioUrl = this.toAbsoluteUrl(match[1]);
      const path = this.toInstantPath(match[2]);

      results.set(path, {
        title: decodeHtml(match[3].trim()),
        instantUrl: this.toAbsoluteUrl(path),
        audioUrl,
        path,
      });
    }

    return [...results.values()];
  }

  async getInstant(pathOrUrl: string): Promise<MyinstantsResult | null> {
    const instantUrl = this.toAbsoluteUrl(pathOrUrl);
    const html = await this.fetchHtml(instantUrl);
    const titleMatch = html.match(
      /<h1 id="instant-page-title">([\s\S]*?)<\/h1>/,
    );
    const audioMatch = html.match(/var preloadAudioUrl = '([^']+)'/) ??
      html.match(/<meta property="og:audio" content="([^"]+)"/) ??
      html.match(/<a href="([^"]+)" download target="_blank"/);

    if (!titleMatch || !audioMatch) {
      return null;
    }

    const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
    const canonicalUrl = canonicalMatch?.[1] ?? instantUrl;
    const canonical = new URL(canonicalUrl, BASE_URL);

    return {
      title: decodeHtml(titleMatch[1].trim()),
      instantUrl: canonical.toString(),
      audioUrl: this.toAbsoluteUrl(audioMatch[1]),
      path: canonical.pathname,
    };
  }

  private async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, { headers: HTML_HEADERS });

    if (!response.ok) {
      throw new Error(
        `Myinstants request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.text();
  }

  private toAbsoluteUrl(pathOrUrl: string): string {
    return new URL(pathOrUrl, BASE_URL).toString();
  }

  private toInstantPath(pathOrUrl: string): string {
    return new URL(pathOrUrl, BASE_URL).pathname;
  }
}

function decodeHtml(value: string) {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_match, entity) => {
    if (entity === "amp") return "&";
    if (entity === "lt") return "<";
    if (entity === "gt") return ">";
    if (entity === "quot") return '"';
    if (entity === "apos") return "'";
    if (entity === "nbsp") return " ";

    if (entity.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }

    if (entity.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }

    return `&${entity};`;
  });
}
