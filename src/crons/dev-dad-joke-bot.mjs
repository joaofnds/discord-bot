import { CronJob } from "cron";

export class DevDadJokeBot {
  constructor(bot, apiURL) {
    this.bot = bot;
    this.apiURL = apiURL;
    this.cron = new CronJob({
      cronTime: "0 15 * * 1-5",
      timeZone: "America/Sao_Paulo",
      onTick: this.run.bind(this),
    });
  }

  start() {
    this.cron.start();
  }

  async run() {
    const response = await fetch(this.apiURL);
    const body = await response.json();

    if (body.type === "single") {
      await this.bot.send(body.joke);
    } else {
      await this.bot.send(body.setup);
      await new Promise((resolve) => setTimeout(resolve, 20_000));
      await this.bot.send(body.delivery);
    }
  }
}
