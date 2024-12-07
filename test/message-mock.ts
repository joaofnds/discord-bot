import { Msg } from "../src/discord/types.ts";
import { AuthorMock } from "./author-mock.ts";
import { ChannelMock } from "./channel-mock.ts";

export class MessageMock implements Msg {
  channel = new ChannelMock();
  author = new AuthorMock();
  replies: string[] = [];
  reacts: string[] = [];

  constructor(readonly content: string) {}

  reply(message: string) {
    this.replies.push(message);
    return Promise.resolve();
  }

  react(message: string) {
    this.reacts.push(message);
  }
}
