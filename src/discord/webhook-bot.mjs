export class WebhookBot {
	constructor(url) {
		this.url = url;
	}

	send(content) {
		return fetch(this.url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content }),
		});
	}
}
