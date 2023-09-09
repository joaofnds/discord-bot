import assert from "node:assert";

export function mustGetEnv(key) {
	assert(process.env[key], `${key} environment variable is required`);
	return process.env[key];
}
