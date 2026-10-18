type Options = {
  cronTime: string;
  timeZone: string;
  onTick: () => unknown;
};

type Scheduler = (
  expression: string,
  onTick: () => unknown,
  options: Bun.CronOptions,
) => { stop(): unknown };

export class CronJob {
  private job?: ReturnType<Scheduler>;

  private constructor(
    private readonly options: Options,
    private readonly schedule: Scheduler,
  ) {}

  static from(options: Options, schedule: Scheduler = Bun.cron) {
    return new CronJob(options, schedule);
  }

  start() {
    this.job ??= this.schedule(
      this.options.cronTime,
      () => {
        // Keep async ticks independent, as cron's default did.
        void this.fire();
      },
      { tz: this.options.timeZone },
    );
  }

  stop() {
    this.job?.stop();
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
