export class ClientWrapper {
	constructor(client) {
		this.client = client;
	}

	async voiceDisconnect(channelID, userID) {
		const channel = await this.client.channels.fetch(channelID);
		if (!channel) return;

		const member = channel?.members.find((m) => m.id === userID);
		if (!member) return;

		await member?.voice.disconnect();
	}
}
