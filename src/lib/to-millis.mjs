import { Millisecond, Minute, Second } from "./time.mjs";

export function toMillis(amount, unit) {
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
