import { describe, expect, it } from "bun:test";
import { FakeClock } from "../../test/fake-clock.ts";
import time from "./time.ts";
import { Timeout } from "./timeout.ts";

describe(Timeout.name, () => {
  const clock = new FakeClock(new Date());

  it("starts inactive", () => {
    const timeout = new Timeout(clock, time.Second);
    expect(timeout.isActive()).toBeFalsy();
  });

  describe("when started", () => {
    it("is active", () => {
      const timeout = new Timeout(clock, time.Second);

      timeout.start();

      expect(timeout.isActive()).toBeTruthy();
    });

    it("stays active until the time has elapsed", () => {
      const timeout = new Timeout(clock, 10 * time.Second);

      timeout.start();

      for (let i = 0; i < 10; i++) {
        clock.tickBy(time.Second);
        expect(timeout.isActive()).toBeTruthy();
      }

      clock.tickBy(time.Millisecond);
      expect(timeout.isActive()).toBeFalsy();
    });
  });
});
