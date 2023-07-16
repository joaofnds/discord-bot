import assert from "node:assert";

export function preflight() {
  assert(process.env.TOKEN, "TOKEN environment variable is required");
  assert(
    process.env.RANDOM_FOLK,
    "RANDOM_FOLK environment variable is required"
  );
}
