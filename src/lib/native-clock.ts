import { Clock } from "./clock.ts";

export class NativeClock implements Clock {
  now() {
    return new Date();
  }
}
