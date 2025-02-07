import { Chain } from "../src/chain/chain.ts";

export class RememberWhenCalled extends Chain {
  count = 0;

  get called() {
    return this.count > 0;
  }

  override handle(_message: unknown) {
    this.count += 1;
    return Promise.resolve();
  }

  reset() {
    this.count = 0;
  }
}
