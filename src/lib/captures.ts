export const captures = (regex: RegExp, str: string) =>
  regex.exec(str)?.slice(1) ?? [];
