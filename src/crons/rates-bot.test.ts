import { beforeEach, describe, expect, it } from "bun:test";
import { FakeScheduler } from "../../test/fake-scheduler.ts";
import { WebhookBotMock } from "../../test/webhook-bot-mock.ts";
import { RatesBot } from "./rates-bot.ts";

class FakeExchangeRates {
  rates: Record<string, number> = {};

  fetchLatest(): Promise<Record<string, number>> {
    return Promise.resolve(this.rates);
  }
}

describe(RatesBot.name, () => {
  let trillionaireDad: WebhookBotMock;
  let billionaireDad: WebhookBotMock;
  let richDad: WebhookBotMock;
  let poorDad: WebhookBotMock;
  let brokeDad: WebhookBotMock;
  let exchangeRates: FakeExchangeRates;
  let bot: RatesBot;

  const usdAt = (brl: number) => ({
    USD: 1,
    BRL: brl,
    EUR: 0.9,
    ARS: 1000,
    BTC: 0.00001,
  });

  beforeEach(() => {
    trillionaireDad = new WebhookBotMock("trillionaire dad");
    billionaireDad = new WebhookBotMock("billionaire dad");
    richDad = new WebhookBotMock("rich dad");
    poorDad = new WebhookBotMock("poor dad");
    brokeDad = new WebhookBotMock("broke dad");
    exchangeRates = new FakeExchangeRates();
    bot = new RatesBot(
      trillionaireDad,
      billionaireDad,
      richDad,
      poorDad,
      brokeDad,
      exchangeRates,
      new FakeScheduler(),
    );
  });

  it("posts the rates in reais", async () => {
    exchangeRates.rates = usdAt(5.2);

    await bot.run();

    expect(poorDad.messages).toEqual([
      ["USD: R$5.20", "EUR: R$5.78", "ARS: R$0.0052", "BTC: $100.00k"].join(
        "\n",
      ),
    ]);
  });

  it.each([
    ["trillionaire dad", 6.01],
    ["trillionaire dad", 6],
    ["billionaire dad", 5.99],
    ["billionaire dad", 5.8],
    ["rich dad", 5.79],
    ["rich dad", 5.5],
    ["poor dad", 5.49],
    ["poor dad", 5],
    ["broke dad", 4.99],
  ])("has %s post when the dollar is at R$%d", async (name, brl) => {
    exchangeRates.rates = usdAt(brl);

    await bot.run();

    const posters = [
      trillionaireDad,
      billionaireDad,
      richDad,
      poorDad,
      brokeDad,
    ]
      .filter((dad) => dad.messages.length > 0)
      .map((dad) => dad.name);
    expect(posters).toEqual([name]);
  });
});
