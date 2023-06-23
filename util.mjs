export function stupidCase(str) {
  return str
    .split("")
    .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
    .join("");
}

export const normalize = (content) =>
  content.normalize("NFD").replace(/[^\p{ASCII}]/gu, "");

export const captures = (regex, str) => {
  const match = regex.exec(str);
  return match ? match.slice(1) : [];
};

export const allCaptures = (regexes, str) =>
  regexes.map((regex) => captures(regex, str)).flat();
