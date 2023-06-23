import assert from "node:assert";

export function preflight() {
  assert(process.env.TOKEN, "TOKEN environment variable is required");
}
