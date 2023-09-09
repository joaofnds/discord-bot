import { captures } from "./captures.mjs";

export const allCaptures = (regexes, str) => {
	return regexes.flatMap((regex) => captures(regex, str));
};
