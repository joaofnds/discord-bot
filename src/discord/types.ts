export type Content = string | { content: string; files: string[] };

export interface MsgAuthor {
  id: string;
  bot: boolean;
}

export interface MsgChannel {
  id: string;

  send(content: Content): Promise<unknown>;
}

export interface Msg {
  content: string;
  author: MsgAuthor;
  channel: MsgChannel;

  reply(content: Content): Promise<unknown>;
  react(messageID: string): unknown;
}
