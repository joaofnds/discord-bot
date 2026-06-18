import { Content, MsgChannel } from "../src/discord/types.ts";

export class ChannelMock implements MsgChannel {
  id = "0";
  messages: Content[] = [];

  send(content: Content) {
    this.messages.push(content);
    return Promise.resolve();
  }
}
