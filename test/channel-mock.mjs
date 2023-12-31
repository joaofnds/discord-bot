export class ChannelMock {
	id = "0";
	messages = [];

	send(message) {
		this.messages.push(message);
	}
}
