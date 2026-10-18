import { ScheduledJob, Scheduler } from "../src/lib/cron.ts";

class FakeJob implements ScheduledJob {
  stopped = false;

  constructor(
    readonly expression: string,
    readonly onTick: () => void,
    readonly timeZone: string,
  ) {}

  stop() {
    this.stopped = true;
  }

  fire() {
    if (this.stopped) {
      return;
    }
    return this.onTick();
  }
}

export class FakeScheduler implements Scheduler {
  jobs: FakeJob[] = [];

  schedule(
    expression: string,
    onTick: () => void,
    timeZone: string,
  ): ScheduledJob {
    const job = new FakeJob(expression, onTick, timeZone);
    this.jobs.push(job);
    return job;
  }
}
