import { soundcloudBase } from "../const.mjs";

export class SoundCloudReplier {
	constructor() {
		this.regex = /((\w+-{0,1})+.mp3){1}/gi;
	}

	reply(str) {
		if (this.regex.test(str)) {
			return `${soundcloudBase}/${str.slice(0, -4)}`;
		}
	}
}
