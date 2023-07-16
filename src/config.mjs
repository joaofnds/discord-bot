import assert from "node:assert";

export class Config {
  constructor({ token, randomFolk }) {
    this.token = token;
    this.randomFolk = randomFolk;
  }

  static fromEnv() {
    assert(process.env.TOKEN, "TOKEN environment variable is required");
    assert(
      process.env.RANDOM_FOLK,
      "RANDOM_FOLK environment variable is required"
    );

    return new Config({
      token: process.env.TOKEN,
      randomFolk: process.env.RANDOM_FOLK,
    });
  }
}
