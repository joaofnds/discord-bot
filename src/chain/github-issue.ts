import { Msg } from "../discord/types.ts";
import { Chain } from "./chain.ts";

export class GitHubIssue extends Chain {
  regex = /#(\d+)/g;

  constructor(
    private readonly baseURL: string,
    private readonly channelIDs: string[],
  ) {
    super();
  }

  override async handle(message: Msg) {
    if (!this.channelIDs.includes(message.channel.id)) {
      return this.next?.handle(message);
    }

    const matches = message.content.match(this.regex);
    if (!matches) {
      return this.next?.handle(message);
    }

    await message.channel.send(
      matches.map((issue) => `${this.baseURL}/${issue.slice(1)}`).join("\n"),
    );
  }
}
