import { Millisecond, Minute, Second } from "./time.ts";

export function toMillis(amount: number, unit: string) {
  switch (unit) {
    case "ms":
    case "millisecond":
    case "milliseconds":
      return amount * Millisecond;
    case "s":
    case "sec":
    case "second":
    case "seconds":
      return amount * Second;
    case "m":
    case "min":
    case "minute":
    case "minutes":
      return amount * Minute;
  }
}
