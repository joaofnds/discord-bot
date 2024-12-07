import { Chain } from "../src/chain/chain.ts";

export class RememberWhenCalled extends Chain {
  called = false;

  constructor() {
    super();
  }

  override handle(_message: unknown) {
    this.called = true;
    return Promise.resolve();
  }

  reset() {
    this.called = false;
  }
}
