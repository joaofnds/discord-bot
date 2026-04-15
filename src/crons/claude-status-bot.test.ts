import { expect } from "@std/expect";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { WebhookBotMock } from "../../test/webhook-bot-mock.ts";
import { codingIsLargelySolvedImageUrl } from "../const.ts";
import type { Incident, IncidentStatus } from "../lib/claude-status-api.ts";
import { ClaudeStatusBot } from "./claude-status-bot.ts";

class FakeClaudeStatusAPI {
  incidents: Incident[] = [];
  error: Error | null = null;

  latestIncident(): Promise<Incident | null> {
    if (this.error) return Promise.reject(this.error);
    return Promise.resolve(this.incidents[0] ?? null);
  }
}

describe(ClaudeStatusBot.name, () => {
  const incident = (overrides: Partial<Incident> = {}): Incident => ({
    id: "inc-1",
    name: "Elevated errors",
    shortlink: "https://stspg.io/abc",
    status: "identified",
    ...overrides,
  });

  let api: FakeClaudeStatusAPI;
  let webhook: WebhookBotMock;
  let bot: ClaudeStatusBot;

  beforeEach(() => {
    api = new FakeClaudeStatusAPI();
    webhook = new WebhookBotMock("claude-status");
    bot = new ClaudeStatusBot(api, webhook);
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
    api.incidents = [incident({ id: "old" })];
    await bot.run();

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
      api.incidents = [incident({ id: "old" })];
      await bot.run();

      api.incidents = [incident({ id: "new", status })];
      await bot.run();

      expect(webhook.messages.length).toEqual(2);
    });
  }

  const skipStatuses: IncidentStatus[] = ["resolved", "postmortem"];
  for (const status of skipStatuses) {
    it(`does not send when a new incident arrives with status '${status}'`, async () => {
      api.incidents = [incident({ id: "old" })];
      await bot.run();

      api.incidents = [incident({ id: "new", status })];
      await bot.run();

      expect(webhook.messages).toEqual([]);
    });
  }

  it("advances the seen id when skipping a resolved incident so a later active one still fires", async () => {
    api.incidents = [incident({ id: "old" })];
    await bot.run();

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
});
