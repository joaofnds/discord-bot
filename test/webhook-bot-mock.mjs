export class WebhookBotMock {
	messages = [];

	constructor(name) {
		this.name = name;
	}

	send(message) {
		this.messages.push(message);
	}

	reset() {
		this.messages = [];
	}
}
