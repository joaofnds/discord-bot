import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { MathRandom } from "./random.ts";

describe("random", () => {
  const tries = 100;
  const random = new MathRandom();

  describe("between", () => {
    it("returns a number between the given range", () => {
      const lower = 1;
      const upper = 10;

      for (let i = 0; i < tries; i++) {
        const result = random.between(lower, upper);
        expect(result).toBeGreaterThanOrEqual(lower);
        expect(result).toBeLessThanOrEqual(upper);
      }
    });
  });

  describe("intBetween", () => {
    it("returns an integer between the given range", () => {
      const lower = 1;
      const upper = 10;

      for (let i = 0; i < tries; i++) {
        const result = random.intBetween(lower, upper);
        expect(result).toBeGreaterThanOrEqual(lower);
        expect(result).toBeLessThan(upper);
        expect(result).toBe(Math.floor(result));
      }
    });
  });

  describe("index", () => {
    it("returns a number between 0 and the given number", () => {
      const length = 10;
      const upper = Array.from({ length }, (_, i) => i);

      for (let i = 0; i < tries; i++) {
        const result = random.index(upper);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(length);
      }
    });
  });

  describe("pick", () => {
    it("returns a random element from the given array", () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const picked = new Set<number>();

      for (let i = 0; i < tries; i++) {
        picked.add(random.pick(array));
      }

      expect(picked.size).toBe(array.length);
    });
  });

  describe("chance", () => {
    it("returns true or false based on the given probability", () => {
      const probability = 0.5;
      let trueCount = 0;

      for (let i = 0; i < tries; i++) {
        if (random.chance(probability)) {
          trueCount++;
        } else {
          trueCount--;
        }
      }

      expect(trueCount).toBeGreaterThan(tries / -2);
      expect(trueCount).toBeLessThan(tries / 2);
    });
  });
});
