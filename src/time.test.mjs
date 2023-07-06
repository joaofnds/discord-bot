import assert from "node:assert";
import { test } from "node:test";
import { convertDuration, dateAdd, dateSub, timeSpanInMs } from "./time.mjs";

test("timeSpanInMs", async (t) => {
  const testCase = [
    [1, "millisecond", 1],
    [999, "milliseconds", 999],
    [1, "second", 1000],
    [123, "seconds", 123000],
    [1, "minute", 60000],
    [1, "minute", 60000],
    [2, "minutes", 120000],
    [1, "hour", 3600000],
    [2, "hours", 7200000],
    [1, "day", 86400000],
    [2, "days", 172800000],
  ];

  for (const [amount, unit, expected] of testCase) {
    await t.test(
      `${amount} ${unit} = ${expected} ms`,
      (amount, unit, expected) => {
        assert.equal(timeSpanInMs(amount, unit), expected);
      },
    );
  }
});

test("convert", async (t) => {
  const testCases = [
    [1, "second", 1000, "milliseconds"],
    [1000, "milliseconds", 1, "second"],

    [60, "seconds", 1, "minute"],
    [1, "minute", 60, "seconds"],

    [60, "minutes", 1, "hour"],
    [1, "hour", 60, "minutes"],

    [24, "hours", 1, "day"],
    [1, "day", 24, "hours"],

    [1, "day", 86_400_000, "milliseconds"],
    [86_400_000, "milliseconds", 1, "day"],

    [59, "seconds", 0, "minutes"],
    [61, "seconds", 1, "minute"],

    [59, "minutes", 0, "hours"],
    [61, "minutes", 1, "hour"],

    [23, "hours", 0, "days"],
    [25, "hours", 1, "day"],
  ];

  for (const [amount, fromUnit, expected, toUnit] of testCases) {
    await t.test(`${amount} ${fromUnit} = ${expected} ${toUnit}`, () => {
      assert.equal(convertDuration(amount, fromUnit, toUnit), expected);
    });
  }
});

test("dateAdd", async (t) => {
  const testCases = [
    [new Date(2023, 1, 1, 1, 1), 1, "minute", new Date(2023, 1, 1, 1, 2)],
    [new Date(2023, 1, 1, 1, 1), 2, "minutes", new Date(2023, 1, 1, 1, 3)],
    [new Date(2023, 1, 1, 1), 1, "hour", new Date(2023, 1, 1, 2)],
    [new Date(2023, 1, 1, 1), 2, "hours", new Date(2023, 1, 1, 3)],
    [new Date(2023, 1, 1), 1, "day", new Date(2023, 1, 2)],
    [new Date(2023, 1, 1), 2, "days", new Date(2023, 1, 3)],
  ];

  for (const [base, amount, unit, date] of testCases) {
    await t.test(`${base} + ${amount} ${unit} = ${date}`, () => {
      assert.equal(dateAdd(base, amount, unit).getTime(), date.getTime());
    });
  }
});

test("dateSub", async (t) => {
  const testCases = [
    [new Date(2023, 1, 1, 1, 2), 1, "minute", new Date(2023, 1, 1, 1, 1)],
    [new Date(2023, 1, 1, 1, 3), 2, "minutes", new Date(2023, 1, 1, 1, 1)],
    [new Date(2023, 1, 1, 2), 1, "hour", new Date(2023, 1, 1, 1)],
    [new Date(2023, 1, 1, 3), 2, "hours", new Date(2023, 1, 1, 1)],
    [new Date(2023, 1, 2), 1, "day", new Date(2023, 1, 1)],
    [new Date(2023, 1, 3), 2, "days", new Date(2023, 1, 1)],
  ];
  for (const [base, amount, unit, date] of testCases) {
    await t.test(`${base} - ${amount} ${unit} = ${date}`, () => {
      assert.equal(dateSub(base, amount, unit).getTime(), date.getTime());
    });
  }
});
