export class Chain {
  constructor() {
    this.next = null;
  }

  async handle(_message) {
    throw new Error("Not implemented");
  }

  setNext(chain) {
    this.next = chain;
  }
}
