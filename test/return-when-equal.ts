import { Chain } from "../src/chain/chain.ts";
import { Msg } from "../src/discord/types.ts";

export class ReturnWhenEqual extends Chain {
  constructor(private readonly match: string, private readonly value: string) {
    super();
  }

  override handle(message: Msg) {
    if (message.content === this.match) {
      return Promise.resolve(this.value);
    }

    return this.next?.handle(message);
  }
}
