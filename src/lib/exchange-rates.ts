export class ExchangeRates {
  private readonly endpoint: string;

  constructor(appID: string) {
    this.endpoint =
      `https://openexchangerates.org/api/latest.json?app_id=${appID}`;
  }

  fetchLatest() {
    return fetch(this.endpoint)
      .then((response) => response.json())
      .then((body) => body.rates);
  }
}
