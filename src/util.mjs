export function stupidCase(str) {
  return str
    .split("")
    .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
    .join("");
}

export const normalize = (content) =>
  content.normalize("NFD").replace(/[^\p{ASCII}]/gu, "");

export const captures = (regex, str) => regex.exec(str)?.slice(1) ?? [];

export const allCaptures = (regexes, str) => {
  return regexes.map((regex) => captures(regex, str)).flat();
};
