export interface Random {
  // returns a random number between [lower, upper)
  between(lower: number, upper: number): number;

  // returns a random integer between [lower, upper)
  intBetween(lower: number, upper: number): number;

  // returns a random index between
  index(arr: unknown[]): number;

  // returns a random element from the array
  pick<T>(arr: T[]): T;

  // returns true with the given probability
  chance(probability: number): boolean;
}

export class MathRandom implements Random {
  between(lower: number, upper: number): number {
    return Math.random() * (upper - lower) + lower;
  }

  intBetween(lower: number, upper: number): number {
    return Math.floor(this.between(lower, upper));
  }

  index(arr: unknown[]): number {
    return this.intBetween(0, arr.length);
  }

  pick<T>(arr: T[]): T {
    return arr[this.index(arr)];
  }

  chance(probability: number): boolean {
    return Math.random() < probability;
  }
}
