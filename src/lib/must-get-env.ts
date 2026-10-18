import { ok as assert } from "node:assert";

export function mustGetEnv(key: string): string {
  const value = process.env[key];

  assert(value, `missing environment variable: ${key}`);

  return value;
}
