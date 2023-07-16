import { captures } from "./captures.mjs";

export const allCaptures = (regexes, str) => {
  return regexes.map((regex) => captures(regex, str)).flat();
};
