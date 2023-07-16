import { Chain } from "../src/chain/chain.mjs";

export class ReturnWhenEqual extends Chain {
  constructor({ match, value }) {
    super();
    this.match = match;
    this.value = value;
  }

  async handle(message) {
    return message === this.match ? this.value : this.next?.handle(message);
  }
}
