import { Msg } from "../discord/types.ts";
import { Clock } from "../lib/clock.ts";
import time from "../lib/time.ts";
import { Timeout } from "../lib/timeout.ts";
import { Chain } from "./chain.ts";

export class Repeat extends Chain {
  private readonly lastMessage = new Map<string, string>(); // channel.id -> message
  private readonly replyTimeout = new Map<string, Timeout>(); // channel.id -> timestamp

  constructor(
    private readonly clock: Clock,
    private readonly timeout: number = 5 * time.Minute,
  ) {
    super();
  }

  override async handle(message: Msg) {
    const lastMessage = this.lastMessage.get(message.channel.id);
    const normalizedContent = this.normalize(message.content);

    if (normalizedContent.length === 0) {
      return this.next?.handle(message);
    }

    if (lastMessage !== normalizedContent) {
      this.lastMessage.set(message.channel.id, normalizedContent);
      return this.next?.handle(message);
    }

    const timeout = this.replyTimeout.get(this.timeoutKey(message));
    if (timeout?.isActive()) {
      return this.next?.handle(message);
    }

    this.replyTimeout.set(this.timeoutKey(message), this.newTimeout());
    this.lastMessage.delete(message.channel.id);
    this.deleteExpiredTimeouts();

    return await message.channel.send(message.content);
  }

  private normalize(str: string) {
    const normalized = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const withoutSpecialChars = normalized.replace(
      /[^\p{L}\p{N}\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\s]/gu,
      "",
    );

    const withoutMultipleSpaces = withoutSpecialChars.replace(/\s+/g, " ");

    return withoutMultipleSpaces.trim().toLowerCase();
  }

  private newTimeout() {
    const timeout = new Timeout(this.clock, this.timeout);
    timeout.start();
    return timeout;
  }

  private timeoutKey(message: Msg) {
    return `${message.channel.id}:${this.lastMessage.get(message.channel.id)}`;
  }

  private deleteExpiredTimeouts() {
    for (const [key, timeout] of this.replyTimeout) {
      if (!timeout.isActive()) {
        this.replyTimeout.delete(key);
      }
    }
  }
}
