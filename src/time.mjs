const Millisecond = 1;
const Second = 1000 * Millisecond;
const Minute = 60 * Second;
const Hour = 60 * Minute;
const Day = 24 * Hour;

export function timeSpanInMs(amount, unit) {
  switch (unit) {
    case "millisecond":
    case "milliseconds":
      return amount * Millisecond;
    case "second":
    case "seconds":
      return amount * Second;
    case "minute":
    case "minutes":
      return amount * Minute;
    case "hour":
    case "hours":
      return amount * Hour;
    case "day":
    case "days":
      return amount * Day;
  }
}

export function convertDuration(amount, fromUnit, toUnit) {
  return Math.floor(timeSpanInMs(amount, fromUnit) / timeSpanInMs(1, toUnit));
}

export function dateAdd(date, amount, unit) {
  return new Date(date.getTime() + timeSpanInMs(amount, unit));
}

export function dateSub(d, amount, unit) {
  return new Date(d.getTime() - timeSpanInMs(amount, unit));
}
