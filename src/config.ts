import { mustGetEnv } from "./lib/must-get-env.ts";

export class Config {
  constructor(
    readonly token: string,
    readonly applicationId: string,
    readonly guildId: string | undefined,
    readonly soundcloudUserId: string,
    readonly soundcloudClientId: string,
    readonly randomFolk: string,
    readonly stanleyBotURL: string,
    readonly dadBotURL: string,
    readonly rapidAPIURL: string,
    readonly rapidAPIKey: string,
    readonly pragTipBotURL: string,
    readonly richDadBotURL: string,
    readonly poorDadBotURL: string,
    readonly openExchangeRatesAppID: string,
    readonly sundayBotURL: string,
    readonly bunBotURL: string,
    readonly wed4pmBot: string,
    readonly accountantBotURL: string,
  ) {}

  static fromEnv() {
    return new Config(
      mustGetEnv("TOKEN"),
      mustGetEnv("APPLICATION_ID"),
      mustGetEnv("GUILD_ID"),
      mustGetEnv("SOUNDCLOUD_USER_ID"),
      mustGetEnv("SOUNDCLOUD_CLIENT_ID"),
      mustGetEnv("RANDOM_FOLK"),
      mustGetEnv("STANLEY_BOT_URL"),
      mustGetEnv("DAD_BOT_URL"),
      mustGetEnv("RAPID_API_URL"),
      mustGetEnv("RAPID_API_KEY"),
      mustGetEnv("PRAGTIP_BOT_URL"),
      mustGetEnv("RICH_DAD_BOT_URL"),
      mustGetEnv("POOR_DAD_BOT_URL"),
      mustGetEnv("OPEN_EXCHANGE_RATES_APP_ID"),
      mustGetEnv("SUNDAY_BOT_URL"),
      mustGetEnv("BUN_BOT_URL"),
      mustGetEnv("WED_4PM_BOT_URL"),
      mustGetEnv("ACCOUNTANT_BOT_URL"),
    );
  }
}
