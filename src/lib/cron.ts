export interface CronOptions {
  cronTime: string;
  timeZone: string;
  onTick: () => void | Promise<void>;
}

export interface ScheduledJob {
  stop(): void;
}

export interface Scheduler {
  schedule(
    expression: string,
    onTick: () => void,
    timeZone: string,
  ): ScheduledJob;
}

export class CronJob {
  private job: ScheduledJob | undefined;

  constructor(
    private readonly options: CronOptions,
    private readonly scheduler: Scheduler,
  ) {}

  start() {
    if (this.job !== undefined) {
      return;
    }

    this.job = this.scheduler.schedule(
      this.options.cronTime,
      () => {
        // Keep async ticks independent, as cron's default did.
        void this.fire();
      },
      this.options.timeZone,
    );
  }

  stop() {
    if (this.job === undefined) {
      return;
    }

    this.job.stop();
    this.job = undefined;
  }

  private async fire() {
    try {
      await this.options.onTick();
    } catch (error) {
      console.error("[Cron] error in callback", error);
    }
  }
}
