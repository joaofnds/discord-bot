import { Clock } from "../src/lib/clock.ts";

export class FakeClock implements Clock {
  private nowValue: Date;

  constructor(nowValue: Date) {
    this.nowValue = nowValue;
  }

  now() {
    return this.nowValue;
  }

  tick() {
    this.tickBy(1);
  }

  tickBy(ms: number) {
    this.nowValue = new Date(this.nowValue.getTime() + ms);
  }
}
