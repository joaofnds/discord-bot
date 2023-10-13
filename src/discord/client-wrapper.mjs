export class ClientWrapper {
	constructor(client) {
		this.client = client;
	}

	voiceDisconnect(channelName, username) {
		return this.client.channels.cache
			.find((c) => c.name === channelName)
			?.members.find((m) => m.user.username === username)
			?.voice.disconnect();
	}
}
