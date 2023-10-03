import { captures } from "./captures.mjs";

export const allCaptures = (regexes, str) =>
	regexes.flatMap((regex) => captures(regex, str));
