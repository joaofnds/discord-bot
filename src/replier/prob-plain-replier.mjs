export class ProbPlainReplier {
	constructor(probability, response, ...regexes) {
		this.probability = probability;
		this.response = response;
		this.regexes = regexes;
	}

	reply(str) {
		if (
			Math.random() < this.probability &&
			this.regexes.some((regex) => regex.test(str))
		) {
			return this.response;
		}
	}
}
