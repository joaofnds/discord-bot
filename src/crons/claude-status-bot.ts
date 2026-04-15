import { CronJob } from "cron";
import { codingIsLargelySolvedImageUrl } from "../const.ts";
import { Bot } from "../discord/bot.ts";
import type { Incident } from "../lib/claude-status-api.ts";

type API = {
  latestIncident(): Promise<Incident | null>;
};

export class ClaudeStatusBot implements Disposable {
  private readonly cron: CronJob;
  private lastSeenId: string | null = null;

  constructor(
    private readonly api: API,
    private readonly bot: Bot,
  ) {
    this.cron = CronJob.from({
      cronTime: "*/5 * * * *",
      timeZone: "UTC",
      onTick: this.run.bind(this),
    });
  }

  start() {
    this.cron.start();
  }

  stop() {
    this.cron.stop();
  }

  [Symbol.dispose](): void {
    this.stop();
  }

  async run() {
    try {
      const latest = await this.api.latestIncident();
      if (!latest) return;

      const previous = this.lastSeenId;
      this.lastSeenId = latest.id;

      if (previous === null) return;
      if (latest.id === previous) return;
      if (latest.status === "resolved" || latest.status === "postmortem") {
        return;
      }

      await this.bot.send(
        `**Claude Status Update:** ${latest.name}\n${latest.shortlink}`,
      );
      await this.bot.send(codingIsLargelySolvedImageUrl);
    } catch (e) {
      console.error("Error checking Claude status:", e);
    }
  }
}
