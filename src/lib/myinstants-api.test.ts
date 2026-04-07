import { assertEquals } from "@std/assert";
import { MyinstantsAPI } from "./myinstants-api.ts";

Deno.test("MyinstantsAPI.search parses results from the search page", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = ((input: string | URL | Request) => {
      assertEquals(
        String(input),
        "https://www.myinstants.com/en/search/?name=bruh",
      );

      return Promise.resolve(
        new Response(
          String.raw`
            <div class="instant">
              <button class="small-button" onclick="play('/media/sounds/movie_1.mp3', 'loader-23010', 'bruh')"></button>
              <a href="/en/instant/bruh/" class="instant-link link-secondary">BRUH &amp; FRIENDS</a>
            </div>
            <div class="instant">
              <button class="small-button" onclick="play('/media/sounds/bruh.mp3', 'loader-25761', 'bruhhh')"></button>
              <a href="/en/instant/bruhhh/" class="instant-link link-secondary">BRUHHH</a>
            </div>
          `,
          { status: 200 },
        ),
      );
    }) as typeof fetch;

    const api = new MyinstantsAPI();
    const results = await api.search("bruh");

    assertEquals(results, [
      {
        title: "BRUH & FRIENDS",
        path: "/en/instant/bruh/",
        instantUrl: "https://www.myinstants.com/en/instant/bruh/",
        audioUrl: "https://www.myinstants.com/media/sounds/movie_1.mp3",
      },
      {
        title: "BRUHHH",
        path: "/en/instant/bruhhh/",
        instantUrl: "https://www.myinstants.com/en/instant/bruhhh/",
        audioUrl: "https://www.myinstants.com/media/sounds/bruh.mp3",
      },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("MyinstantsAPI.getInstant parses the instant page", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = ((input: string | URL | Request) => {
      assertEquals(
        String(input),
        "https://www.myinstants.com/en/instant/bruh/",
      );

      return Promise.resolve(
        new Response(
          String.raw`
            <link rel="canonical" href="https://www.myinstants.com/en/instant/bruh/" />
            <meta property="og:audio" content="https://www.myinstants.com/media/sounds/movie_1.mp3"/>
            <h1 id="instant-page-title">BRUH</h1>
          `,
          { status: 200 },
        ),
      );
    }) as typeof fetch;

    const api = new MyinstantsAPI();
    const result = await api.getInstant("/en/instant/bruh/");

    assertEquals(result, {
      title: "BRUH",
      path: "/en/instant/bruh/",
      instantUrl: "https://www.myinstants.com/en/instant/bruh/",
      audioUrl: "https://www.myinstants.com/media/sounds/movie_1.mp3",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("MyinstantsAPI.getInstant returns null when the page is missing audio", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = (() => {
      return Promise.resolve(
        new Response(`<h1 id="instant-page-title">BRUH</h1>`, { status: 200 }),
      );
    }) as typeof fetch;

    const api = new MyinstantsAPI();
    const result = await api.getInstant("/en/instant/bruh/");

    assertEquals(result, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
