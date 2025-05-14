import { Msg } from "../discord/types.ts";
import { captures } from "../lib/captures.ts";
import { Chain } from "./chain.ts";

export class GitHubIssue extends Chain {
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

    const issues = captures(/#(\d+)/g, message.content);
    if (!issues.length) {
      return this.next?.handle(message);
    }

    await message.channel.send(
      issues.map((issue) => `${this.baseURL}/${issue}`).join("\n"),
    );
  }
}
