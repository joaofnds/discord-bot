export class Chain<T = unknown> {
  next?: Chain<T>;

  handle(_: T): void | Promise<unknown> {
    throw new Error("not implemented");
  }

  setNext(chain: Chain<T>) {
    this.next = chain;
  }
}
