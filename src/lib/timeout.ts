export class Timeout {
  private startTime = Number.MIN_SAFE_INTEGER;

  constructor(private now: () => number, private duration: number) {}

  static withDuration(duration: number) {
    return new Timeout(() => Date.now(), duration);
  }

  start() {
    this.startTime = this.now();
  }

  isActive() {
    const elapsed = this.now() - this.startTime;
    return elapsed <= this.duration;
  }
}
