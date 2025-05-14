import { captures } from "../lib/captures.ts";
import { normalize } from "../lib/normalize.ts";
import { Replier } from "./replier.ts";

export class SoundCloudReplier implements Replier {
  reply(str: string) {
    const [audio] = captures(/([\w-]+)\.mp3/i, normalize(str));
    if (!audio) return;

    return `https://soundcloud.com/joaofnds/${audio}`;
  }
}
