export class PlainReplier {
  constructor(response, ...regexes) {
    this.response = response;
    this.regexes = regexes;
  }

  reply(str) {
    if (this.regexes.some((regex) => regex.test(str))) {
      return this.response;
    }
  }
}
