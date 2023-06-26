export class Chain {
  constructor() {
    this.next = null;
  }

  static fromArray(links) {
    links.reduce((previous, current) => {
      previous.setNext(current);
      return current;
    });
    return links[0];
  }

  async handle(_message) {
    throw new Error("Not implemented");
  }

  setNext(chain) {
    this.next = chain;
  }
}
