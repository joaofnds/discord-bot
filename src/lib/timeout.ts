import { Clock } from "./clock.ts";
import { NativeClock } from "./native-clock.ts";

export class Timeout {
  private startTime = Number.MIN_SAFE_INTEGER;

  constructor(private clock: Clock, private duration: number) {}

  static withDuration(duration: number) {
    return new Timeout(new NativeClock(), duration);
  }

  start() {
    this.startTime = this.clock.now().getTime();
  }

  isActive() {
    const elapsed = this.clock.now().getTime() - this.startTime;
    return elapsed <= this.duration;
  }
}
