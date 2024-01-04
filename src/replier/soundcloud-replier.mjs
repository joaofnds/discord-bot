import { captures } from "../lib/captures.mjs";
import { normalize } from "../lib/normalize.mjs";

export class SoundCloudReplier {
	regex = /([\w-]+\.mp3)/i;

	reply(str) {
		const [audio] = captures(this.regex, normalize(str));
		if (!audio) return;

		return `https://soundcloud.com/joaofnds/${audio.replace(/\.mp3$/gi, "")}`;
	}
}
