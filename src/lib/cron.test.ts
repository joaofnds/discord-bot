import { beforeEach, describe, expect, it } from "bun:test";
import { CronJob } from "./cron.ts";

class FakeJob {
  stopped = false;

  constructor(
    readonly expression: string,
    readonly onTick: () => unknown,
    readonly options: Bun.CronOptions,
  ) {}

  stop() {
    this.stopped = true;
  }

  fire() {
    if (!this.stopped) return this.onTick();
  }
}

class FakeScheduler {
  jobs: FakeJob[] = [];

  schedule = (
    expression: string,
    onTick: () => unknown,
    options: Bun.CronOptions,
  ) => {
    const job = new FakeJob(expression, onTick, options);
    this.jobs.push(job);
    return job;
  };
}

describe(CronJob.name, () => {
  let scheduler: FakeScheduler;
  let job: CronJob;
  let calls: number;
  let onTick: () => unknown;

  beforeEach(() => {
    scheduler = new FakeScheduler();
    calls = 0;
    onTick = () => {
      calls++;
    };
    job = CronJob.from(
      {
        cronTime: "0 9 * * 1-5",
        timeZone: "America/Sao_Paulo",
        onTick: () => onTick(),
      },
      scheduler.schedule,
    );
  });

  it("waits for start before scheduling", () => {
    expect(scheduler.jobs).toEqual([]);
    expect(calls).toBe(0);
  });

  it("starts once with the existing expression and time zone", () => {
    job.start();
    job.start();

    expect(scheduler.jobs.length).toBe(1);
    expect(scheduler.jobs[0].expression).toBe("0 9 * * 1-5");
    expect(scheduler.jobs[0].options).toEqual({ tz: "America/Sao_Paulo" });
    expect(calls).toBe(0);

    scheduler.jobs[0].fire();
    expect(calls).toBe(1);
  });

  it("can stop before starting", () => {
    job.stop();
    job.start();

    expect(scheduler.jobs.length).toBe(1);
  });

  it("stops callbacks and can restart", () => {
    job.start();
    const first = scheduler.jobs[0];
    job.stop();
    job.stop();
    first.fire();
    expect(first.stopped).toBe(true);
    expect(calls).toBe(0);

    job.start();
    expect(scheduler.jobs.length).toBe(2);
    scheduler.jobs[1].fire();
    expect(calls).toBe(1);
  });

  it("allows another tick while an earlier callback is still pending", async () => {
    const pending = Promise.withResolvers<void>();
    onTick = () => {
      calls++;
      return pending.promise;
    };
    job.start();

    expect(scheduler.jobs[0].fire()).toBeUndefined();
    scheduler.jobs[0].fire();
    expect(calls).toBe(2);

    pending.resolve();
    await pending.promise;
  });

  it("contains synchronous callback errors and keeps running", () => {
    onTick = () => {
      throw new Error("callback failed");
    };
    job.start();

    expect(() => scheduler.jobs[0].fire()).not.toThrow();
    onTick = () => {
      calls++;
    };
    scheduler.jobs[0].fire();
    expect(calls).toBe(1);
  });

  it("contains rejected callbacks and keeps running", async () => {
    onTick = () => Promise.reject(new Error("callback failed"));
    job.start();
    scheduler.jobs[0].fire();
    await Promise.resolve();

    onTick = () => {
      calls++;
    };
    scheduler.jobs[0].fire();
    expect(calls).toBe(1);
  });
});
