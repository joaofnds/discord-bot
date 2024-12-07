import { MsgChannel } from "../src/discord/types.ts";

export class ChannelMock implements MsgChannel {
  id = "0";
  messages: string[] = [];

  send(content: string) {
    this.messages.push(content);
    return Promise.resolve();
  }
}
