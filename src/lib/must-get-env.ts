import { assert } from "@std/assert";

export function mustGetEnv(key: string): string {
  const value = Deno.env.get(key);

  assert(value, `missing environment variable: ${key}`);

  return value;
}
