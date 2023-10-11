export class ClientWrapper {
	constructor(client) {
		this.client = client;
	}

	async voiceDisconnect(channelName, username) {
		await this.client.channels.fetch();
		await this.client.channels.cache
			.find((c) => c.name === channelName)
			?.members.find((m) => m.user.username === username)
			?.voice.disconnect();
	}
}
