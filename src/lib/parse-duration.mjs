import { toMillis } from "./to-millis.mjs";

export function parseDuration(content) {
  const duration = content.match(/^(\d+)\s?(\w+)/);
  if (!duration) return;

  const [, amount, unit] = duration;
  return toMillis(amount, unit);
}
