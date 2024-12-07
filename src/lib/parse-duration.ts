import { toMillis } from "./to-millis.ts";

export function parseDuration(content: string) {
  const duration = content.match(/^(\d+)\s?(\w+)/);
  if (!duration) return;

  const [, amount, unit] = duration;
  return toMillis(Number(amount), unit);
}
