export const captures = (regex, str) => regex.exec(str)?.slice(1) ?? [];
