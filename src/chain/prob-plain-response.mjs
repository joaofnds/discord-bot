export class ProbPlainResponse {
  constructor(probability, response, ...regexes) {
    this.probability = probability;
    this.response = response;
    this.regexes = regexes;
  }

  replyIfMatches(str) {
    if (
      this.regexes.some((regex) => regex.test(str)) &&
      Math.random() < this.probability
    ) {
      return this.response;
    }
  }
}
