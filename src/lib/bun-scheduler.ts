import { ScheduledJob, Scheduler } from "./cron.ts";

export class BunScheduler implements Scheduler {
  schedule(
    expression: string,
    onTick: () => void,
    timeZone: string,
  ): ScheduledJob {
    return Bun.cron(expression, onTick, { tz: timeZone });
  }
}
