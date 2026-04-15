import { CronJob } from "cron";
import {
  claudeOutageJokes,
  claudeOutageResolvedJokes,
  codingIsLargelySolvedImageUrl,
} from "../const.ts";
import { Bot } from "../discord/bot.ts";
import type { Incident, IncidentStatus } from "../lib/claude-status-api.ts";
import { Clock } from "../lib/clock.ts";
import { Random } from "../lib/random.ts";

type API = {
  latestIncident(): Promise<Incident | null>;
};

type Tracked = {
  id: string;
  startedAt: Date;
  jokesSent: number;
};

export class ClaudeStatusBot implements Disposable {
  private readonly cron: CronJob;
  private knownId?: string;
  private tracked?: Tracked;

  constructor(
    private readonly api: API,
    private readonly bot: Bot,
    private readonly clock: Clock,
    private readonly random: Random,
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

      if (this.knownId === undefined) {
        this.knownId = latest.id;
        return;
      }

      if (latest.id !== this.knownId) {
        this.knownId = latest.id;
        if (!isActive(latest.status)) {
          this.tracked = undefined;
          return;
        }
        this.tracked = {
          id: latest.id,
          startedAt: latest.startedAt,
          jokesSent: 0,
        };
        await this.bot.send(
          `**Claude Status Update:** ${latest.name}\n${latest.shortlink}`,
        );
        await this.bot.send(codingIsLargelySolvedImageUrl);
        return;
      }

      if (this.tracked === undefined) return;
      if (!isActive(latest.status)) {
        this.tracked = undefined;
        await this.bot.send(this.random.pick(claudeOutageResolvedJokes));
        return;
      }

      await this.sendDueJokes(this.tracked);
    } catch (e) {
      console.error("Error checking Claude status:", e);
    }
  }

  private async sendDueJokes(tracked: Tracked) {
    const elapsedMs = this.clock.now().getTime() - tracked.startedAt.getTime();

    while (tracked.jokesSent < claudeOutageJokes.length) {
      const bucket = claudeOutageJokes[tracked.jokesSent];
      if (elapsedMs < bucket.after) break;
      await this.bot.send(this.random.pick(bucket.texts));
      tracked.jokesSent++;
    }
  }
}

function isActive(status: IncidentStatus): boolean {
  return status !== "resolved" && status !== "postmortem";
}
