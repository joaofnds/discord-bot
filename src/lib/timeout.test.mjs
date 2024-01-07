import assert from "node:assert/strict";
import { describe, it } from "node:test";
import time from "./time.mjs";
import { Timeout } from "./timeout.mjs";

describe(Timeout.name, () => {
	it("starts inactive", () => {
		const timeout = new Timeout(() => 0, time.Second);
		assert(!timeout.isActive());
	});

	describe("when started", () => {
		it("is active", () => {
			const timeout = new Timeout(() => 0, time.Second);

			timeout.start();

			assert(timeout.isActive());
		});

		it("stays active until the time has elapsed", () => {
			let now = Date.now();
			const timeout = new Timeout(() => now, 10 * time.Second);

			timeout.start();

			for (let i = 0; i < 10; i++) {
				now += time.Second;
				assert(timeout.isActive());
			}

			now += time.Second;
			assert(!timeout.isActive());
		});
	});
});
