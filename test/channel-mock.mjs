export class ChannelMock {
	messages = [];

	send(message) {
		this.messages.push(message);
	}
}
