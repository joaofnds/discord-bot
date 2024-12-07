import { Bot } from "./bot.ts";

export class WebhookBot implements Bot {
  constructor(private readonly url: string) {}

  async send(content: string) {
    await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  }
}
