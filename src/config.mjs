import { mustGetEnv } from "./lib/must-get-env.mjs";

export class Config {
  constructor({
    token,
    randomFolk,
    stanleyBotURL,
    dadBotURL,
    rapidAPIURL,
    rapidAPIKey,
    pragTipBotURL,
  }) {
    this.token = token;
    this.randomFolk = randomFolk;
    this.stanleyBotURL = stanleyBotURL;
    this.dadBotURL = dadBotURL;
    this.rapidAPIURL = rapidAPIURL;
    this.rapidAPIKey = rapidAPIKey;
    this.pragTipBotURL = pragTipBotURL;
  }

  static fromEnv() {
    return new Config({
      token: mustGetEnv("TOKEN"),
      randomFolk: mustGetEnv("RANDOM_FOLK"),
      stanleyBotURL: mustGetEnv("STANLEY_BOT_URL"),
      dadBotURL: mustGetEnv("DAD_BOT_URL"),
      rapidAPIURL: mustGetEnv("RAPID_API_URL"),
      rapidAPIKey: mustGetEnv("RAPID_API_KEY"),
      pragTipBotURL: mustGetEnv("PRAGTIP_BOT_URL"),
    });
  }
}
