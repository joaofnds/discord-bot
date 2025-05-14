export function captures(regex: RegExp, str: string) {
  if (!regex.global) {
    return regex.exec(str)?.slice(1) ?? [];
  }

  return str.matchAll(regex).flatMap((match) => match.slice(1)).toArray();
}
