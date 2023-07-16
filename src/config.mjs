import { mustGetEnv } from "./lib/must-get-env.mjs";

export class Config {
  constructor({ token, randomFolk }) {
    this.token = token;
    this.randomFolk = randomFolk;
  }

  static fromEnv() {
    return new Config({
      token: mustGetEnv("TOKEN"),
      randomFolk: mustGetEnv("RANDOM_FOLK"),
    });
  }
}
