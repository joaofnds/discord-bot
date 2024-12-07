import { captures } from "./captures.ts";

export const allCaptures = (regexes: RegExp[], str: string) =>
  regexes.flatMap((regex) => captures(regex, str));
