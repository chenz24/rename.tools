import { describe, expect, it } from "vitest";
import { nextTourStep, type TourSnapshot } from "@/lib/rename/tour";

const ready: TourSnapshot = { fileCount: 3, ruleCount: 1, hasChanges: true, computing: false };

describe("Rename tour progression", () => {
	it("stays at import when a picker is cancelled, and restarts when files are cleared", () => {
		const empty = { ...ready, fileCount: 0 };
		expect(nextTourStep(0, empty, false)).toBe(0);
		expect(nextTourStep(3, empty, false)).toBe(0);
	});

	it("stops at rules after loading a complete demo", () => {
		expect(nextTourStep(0, ready, true)).toBe(1);
		expect(nextTourStep(1, ready, false)).toBe(1);
	});

	it("requires a finished edit and a computed change before advancing", () => {
		expect(nextTourStep(1, { ...ready, computing: true }, true)).toBe(1);
		expect(nextTourStep(1, { ...ready, hasChanges: false }, true)).toBe(1);
		expect(nextTourStep(1, ready, false)).toBe(1);
		expect(nextTourStep(1, ready, true)).toBe(2);
	});

	it("returns to rules if they are removed or no longer change filenames", () => {
		expect(nextTourStep(2, { ...ready, ruleCount: 0 }, false)).toBe(1);
		expect(nextTourStep(3, { ...ready, hasChanges: false }, false)).toBe(1);
		expect(nextTourStep(2, { ...ready, hasChanges: false, computing: true }, false)).toBe(2);
	});

	it("requires an explicit action to leave preview and never advances beyond confirmation", () => {
		expect(nextTourStep(2, ready, true)).toBe(2);
		expect(nextTourStep(3, ready, true)).toBe(3);
		expect(nextTourStep(4, ready, true)).toBe(4);
	});
});
