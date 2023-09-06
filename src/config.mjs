import { mustGetEnv } from "./lib/must-get-env.mjs";

export class Config {
  constructor({ token, randomFolk, stanleyBotURL }) {
    this.token = token;
    this.randomFolk = randomFolk;
    this.stanleyBotURL = stanleyBotURL;
  }

  static fromEnv() {
    return new Config({
      token: mustGetEnv("TOKEN"),
      randomFolk: mustGetEnv("RANDOM_FOLK"),
      stanleyBotURL: mustGetEnv("STANLEY_BOT_URL"),
    });
  }
}
