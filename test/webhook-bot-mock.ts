export class WebhookBotMock {
  messages: string[] = [];

  constructor(readonly name: string) {}

  send(message: string) {
    this.messages.push(message);
    return Promise.resolve();
  }

  reset() {
    this.messages = [];
  }
}
