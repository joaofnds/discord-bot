import { z } from "zod";

const exchangeRatesSchema = z.object({
  rates: z.record(z.string(), z.number()),
});

export class ExchangeRates {
  private readonly endpoint: string;

  constructor(appID: string) {
    this.endpoint =
      `https://openexchangerates.org/api/latest.json?app_id=${appID}`;
  }

  fetchLatest() {
    return fetch(this.endpoint)
      .then((response) => response.json())
      .then((body) => exchangeRatesSchema.parse(body).rates);
  }
}
