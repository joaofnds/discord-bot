import { ChannelMock } from "./channel-mock.mjs";

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
