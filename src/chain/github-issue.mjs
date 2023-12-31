import { Chain } from "./chain.mjs";

export class GitHubIssue extends Chain {
	regex = /#(\d+)/g;

	constructor(baseURL, channelID) {
		super();
		this.baseURL = baseURL;
		this.channelID = channelID;
	}

	handle(message) {
		if (message.channel.id !== this.channelID) {
			return this.next?.handle(message);
		}

		const matches = message.content.match(this.regex);
		if (!matches) {
			return this.next?.handle(message);
		}

		message.channel.send(
			matches.map((issue) => `${this.baseURL}/${issue.slice(1)}`).join("\n"),
		);
	}
}
