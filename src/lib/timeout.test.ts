import { assert } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { FakeClock } from "../../test/fake-clock.ts";
import time from "./time.ts";
import { Timeout } from "./timeout.ts";

describe(Timeout.name, () => {
  const clock = new FakeClock(new Date());

  it("starts inactive", () => {
    const timeout = new Timeout(clock, time.Second);
    assert(!timeout.isActive());
  });

  describe("when started", () => {
    it("is active", () => {
      const timeout = new Timeout(clock, time.Second);

      timeout.start();

      assert(timeout.isActive());
    });

    it("stays active until the time has elapsed", () => {
      const timeout = new Timeout(clock, 10 * time.Second);

      timeout.start();

      for (let i = 0; i < 10; i++) {
        clock.tickBy(time.Second);
        assert(timeout.isActive());
      }

      clock.tickBy(time.Millisecond);
      assert(!timeout.isActive());
    });
  });
});
