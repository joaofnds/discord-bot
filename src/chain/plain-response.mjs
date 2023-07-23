export class PlainResponse {
  constructor(response, ...regexes) {
    this.response = response;
    this.regexes = regexes;
  }

  replyIfMatches(str) {
    if (this.regexes.some((regex) => regex.test(str))) {
      return this.response;
    }
  }
}
