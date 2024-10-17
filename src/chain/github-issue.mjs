import { Chain } from "./chain.mjs";

export class GitHubIssue extends Chain {
	regex = /#(\d+)/g;

	constructor(baseURL, channelIDs) {
		super();
		this.baseURL = baseURL;
		this.channelIDs = channelIDs;
	}

	handle(message) {
		if (!this.channelIDs.includes(message.channel.id)) {
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
