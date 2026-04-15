import { expect } from "@std/expect";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { FakeClock } from "../../test/fake-clock.ts";
import { WebhookBotMock } from "../../test/webhook-bot-mock.ts";
import {
  claudeOutageJokes,
  claudeOutageResolvedJokes,
  codingIsLargelySolvedImageUrl,
} from "../const.ts";
import type { Incident, IncidentStatus } from "../lib/claude-status-api.ts";
import type { Bot } from "../discord/bot.ts";
import { Random } from "../lib/random.ts";
import time from "../lib/time.ts";
import { ClaudeStatusBot } from "./claude-status-bot.ts";

class FakeClaudeStatusAPI {
  incidents: Incident[] = [];
  error: Error | null = null;

  latestIncident(): Promise<Incident | null> {
    if (this.error) return Promise.reject(this.error);
    return Promise.resolve(this.incidents[0] ?? null);
  }
}

class FakeRandom implements Random {
  picks: number[] = [0];
  private calls = 0;

  private next(): number {
    const i = this.picks[this.calls % this.picks.length];
    this.calls++;
    return i;
  }

  between(lower: number, _upper: number): number {
    return lower;
  }
  intBetween(lower: number, _upper: number): number {
    return lower;
  }
  index(_arr: readonly unknown[]): number {
    return this.next();
  }
  pick<T>(arr: readonly T[]): T {
    return arr[this.next()];
  }
  chance(_probability: number): boolean {
    return false;
  }
}

describe(ClaudeStatusBot.name, () => {
  const now = new Date("2026-04-15T10:00:00Z");

  let clock: FakeClock;
  let api: FakeClaudeStatusAPI;
  let webhook: WebhookBotMock;
  let random: FakeRandom;
  let bot: ClaudeStatusBot;

  const incident = (overrides: Partial<Incident> = {}): Incident => ({
    id: "inc-1",
    name: "Elevated errors",
    shortlink: "https://stspg.io/abc",
    status: "identified",
    startedAt: clock.now(),
    ...overrides,
  });

  const primeWith = async (first: Incident) => {
    api.incidents = [first];
    await bot.run();
  };

  const announceNew = async (newIncident: Incident) => {
    api.incidents = [newIncident];
    await bot.run();
    webhook.reset();
  };

  beforeEach(() => {
    clock = new FakeClock(now);
    api = new FakeClaudeStatusAPI();
    webhook = new WebhookBotMock("claude-status");
    random = new FakeRandom();
    bot = new ClaudeStatusBot(api, webhook, clock, random);
  });

  it("does not send on the first run even when an active incident is present", async () => {
    api.incidents = [incident()];

    await bot.run();

    expect(webhook.messages).toEqual([]);
  });

  it("does not send when the latest incident is unchanged", async () => {
    api.incidents = [incident()];

    await bot.run();
    await bot.run();

    expect(webhook.messages).toEqual([]);
  });

  it("sends the status update and the meme when a new active incident appears", async () => {
    await primeWith(incident({ id: "old" }));

    api.incidents = [
      incident({
        id: "new",
        name: "Elevated errors on Claude.ai",
        shortlink: "https://stspg.io/new",
      }),
    ];
    await bot.run();

    expect(webhook.messages).toEqual([
      "**Claude Status Update:** Elevated errors on Claude.ai\nhttps://stspg.io/new",
      codingIsLargelySolvedImageUrl,
    ]);
  });

  const activeStatuses: IncidentStatus[] = [
    "investigating",
    "identified",
    "monitoring",
  ];
  for (const status of activeStatuses) {
    it(`sends when a new incident arrives with status '${status}'`, async () => {
      await primeWith(incident({ id: "old" }));

      api.incidents = [incident({ id: "new", status })];
      await bot.run();

      expect(webhook.messages.length).toEqual(2);
    });
  }

  const skipStatuses: IncidentStatus[] = ["resolved", "postmortem"];
  for (const status of skipStatuses) {
    it(`does not send when a new incident arrives with status '${status}'`, async () => {
      await primeWith(incident({ id: "old" }));

      api.incidents = [incident({ id: "new", status })];
      await bot.run();

      expect(webhook.messages).toEqual([]);
    });
  }

  it("advances the seen id when skipping a resolved incident so a later active one still fires", async () => {
    await primeWith(incident({ id: "old" }));

    api.incidents = [incident({ id: "resolved", status: "resolved" })];
    await bot.run();

    api.incidents = [
      incident({
        id: "active",
        name: "Outage",
        shortlink: "https://stspg.io/active",
      }),
    ];
    await bot.run();

    expect(webhook.messages).toEqual([
      "**Claude Status Update:** Outage\nhttps://stspg.io/active",
      codingIsLargelySolvedImageUrl,
    ]);
  });

  it("does nothing when the incidents list is empty", async () => {
    await bot.run();

    expect(webhook.messages).toEqual([]);
  });

  it("swallows API errors without sending", async () => {
    api.error = new Error("boom");

    await bot.run();

    expect(webhook.messages).toEqual([]);
  });

  it("swallows webhook send failures so they cannot bring the bot down", async () => {
    const failingBot: Bot = {
      send: () => Promise.reject(new Error("webhook exploded")),
    };
    const resilientBot = new ClaudeStatusBot(api, failingBot, clock, random);

    api.incidents = [incident({ id: "old" })];
    await resilientBot.run();

    api.incidents = [incident({ id: "new" })];
    await resilientBot.run();
  });

  describe("escalation jokes", () => {
    beforeEach(async () => {
      await primeWith(incident({ id: "old" }));
      await announceNew(incident({ id: "outage" }));
    });

    it("does not send a joke before the first threshold", async () => {
      clock.tickBy(claudeOutageJokes[0].after - time.Minute);
      api.incidents = [incident({ id: "outage" })];

      await bot.run();

      expect(webhook.messages).toEqual([]);
    });

    it("sends a joke from the first bucket once the first threshold is reached", async () => {
      clock.tickBy(claudeOutageJokes[0].after);
      api.incidents = [incident({ id: "outage" })];

      await bot.run();

      expect(webhook.messages).toEqual([claudeOutageJokes[0].texts[0]]);
    });

    it("picks a joke from the bucket using the random source", async () => {
      random.picks = [2];
      clock.tickBy(claudeOutageJokes[0].after);
      api.incidents = [incident({ id: "outage" })];

      await bot.run();

      expect(webhook.messages).toEqual([claudeOutageJokes[0].texts[2]]);
    });

    it("does not re-send the same joke on subsequent polls", async () => {
      clock.tickBy(claudeOutageJokes[0].after);
      api.incidents = [incident({ id: "outage" })];
      await bot.run();
      webhook.reset();

      clock.tickBy(time.Minute);
      await bot.run();

      expect(webhook.messages).toEqual([]);
    });

    it("sends jokes in order as each threshold is reached", async () => {
      random.picks = [1];
      let previousMs = 0;
      for (const bucket of claudeOutageJokes) {
        clock.tickBy(bucket.after - previousMs);
        api.incidents = [incident({ id: "outage" })];
        await bot.run();
        previousMs = bucket.after;
      }

      expect(webhook.messages).toEqual(
        claudeOutageJokes.map((b) => b.texts[1]),
      );
    });

    it("catches up on multiple thresholds in a single poll", async () => {
      random.picks = [0, 1, 2];
      clock.tickBy(claudeOutageJokes[2].after);
      api.incidents = [incident({ id: "outage" })];

      await bot.run();

      expect(webhook.messages).toEqual([
        claudeOutageJokes[0].texts[0],
        claudeOutageJokes[1].texts[1],
        claudeOutageJokes[2].texts[2],
      ]);
    });

    it("stops sending after all jokes are exhausted", async () => {
      const last = claudeOutageJokes[claudeOutageJokes.length - 1];
      clock.tickBy(last.after + 1000 * time.Minute);
      api.incidents = [incident({ id: "outage" })];
      await bot.run();
      webhook.reset();

      clock.tickBy(60 * time.Minute);
      await bot.run();

      expect(webhook.messages).toEqual([]);
    });

    it("sends a resolved joke and stops escalation when the tracked incident resolves", async () => {
      clock.tickBy(claudeOutageJokes[0].after);
      api.incidents = [incident({ id: "outage", status: "resolved" })];

      await bot.run();

      expect(webhook.messages).toEqual([claudeOutageResolvedJokes[0]]);
    });

    it("sends a resolved joke when the tracked incident transitions to postmortem", async () => {
      api.incidents = [incident({ id: "outage", status: "postmortem" })];

      await bot.run();

      expect(webhook.messages).toEqual([claudeOutageResolvedJokes[0]]);
    });

    it("picks the resolved joke using the random source", async () => {
      random.picks = [3];
      api.incidents = [incident({ id: "outage", status: "resolved" })];

      await bot.run();

      expect(webhook.messages).toEqual([claudeOutageResolvedJokes[3]]);
    });

    it("does not send an image with the resolved joke", async () => {
      api.incidents = [incident({ id: "outage", status: "resolved" })];

      await bot.run();

      expect(webhook.messages).not.toContain(codingIsLargelySolvedImageUrl);
    });

    it("only sends the resolved joke once — subsequent polls stay silent", async () => {
      api.incidents = [incident({ id: "outage", status: "resolved" })];
      await bot.run();
      webhook.reset();

      await bot.run();

      expect(webhook.messages).toEqual([]);
    });

    it("resets escalation state so a new incident starts fresh", async () => {
      clock.tickBy(claudeOutageJokes[0].after);
      api.incidents = [incident({ id: "outage" })];
      await bot.run();

      api.incidents = [incident({ id: "outage", status: "resolved" })];
      await bot.run();
      webhook.reset();

      clock.tickBy(time.Minute);
      api.incidents = [
        incident({
          id: "outage-2",
          name: "Another one",
          shortlink: "https://stspg.io/two",
          startedAt: clock.now(),
        }),
      ];
      await bot.run();

      expect(webhook.messages).toEqual([
        "**Claude Status Update:** Another one\nhttps://stspg.io/two",
        codingIsLargelySolvedImageUrl,
      ]);
    });
  });

  describe("priming with an active incident", () => {
    it("does not escalate an incident the bot only ever saw via priming", async () => {
      const longRunning = incident({
        id: "pre-existing",
        startedAt: new Date(now.getTime() - 2 * time.Hour),
      });
      await primeWith(longRunning);

      clock.tickBy(60 * time.Minute);
      api.incidents = [longRunning];
      await bot.run();

      expect(webhook.messages).toEqual([]);
    });
  });
});
