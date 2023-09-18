export class XKCDAPI {
	#url = "https://xkcd.com";

	comic(number) {
		return fetch(`${this.#url}/${number}/info.0.json`).then((response) =>
			response.json(),
		);
	}

	random() {
		return fetch(`${this.#url}/info.0.json`)
			.then((response) => response.json())
			.then((data) => this.comic(Math.floor(Math.random() * data.num) + 1));
	}
}
