export class ChannelMock {
	messages = [];

	send(message) {
		this.messages.push(message);
	}
}

export class MessageMock {
	channel = new ChannelMock();
	replies = [];
	reacts = [];
	author = { bot: false };

	constructor(content) {
		this.content = content;
	}

	reply(message) {
		this.replies.push(message);
	}

	react(message) {
		this.reacts.push(message);
	}

	setAuthorId(id) {
		this.author.id = id;
	}
}
