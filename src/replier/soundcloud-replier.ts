import { captures } from "../lib/captures.ts";
import { normalize } from "../lib/normalize.ts";
import { Replier } from "./replier.ts";

export class SoundCloudReplier implements Replier {
  regex = /([\w-]+\.mp3)/i;

  reply(str: string) {
    const [audio] = captures(this.regex, normalize(str));
    if (!audio) return;

    return `https://soundcloud.com/joaofnds/${audio.replace(/\.mp3$/gi, "")}`;
  }
}
