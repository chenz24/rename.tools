import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRenameStore } from "@/hooks/useRenameStore";
import * as analytics from "@/lib/task-analytics";

describe("Actual file execution measurement", () => {
	beforeEach(() => useRenameStore.setState(useRenameStore.getInitialState(), true));
	afterEach(() => vi.restoreAllMocks());

	async function batch(handles?: FileSystemFileHandle[]) {
		await useRenameStore.getState().addFiles(["private-a.pdf", "private-b.pdf"], handles);
		useRenameStore.getState().addRulesFromTemplate([{ type: "insert", config: { text: "private_", position: "start", index: 0 } }], "name");
	}

	it("does not report sample execution as a real rename", async () => {
		const track = vi.spyOn(analytics, "trackTaskEvent");
		await batch();
		await useRenameStore.getState().execute();
		expect(track).not.toHaveBeenCalled();
	});
	it("reports only a fixed success result for actual successful handles", async () => {
		const track = vi.spyOn(analytics, "trackTaskEvent");
		const handle = { move: vi.fn().mockResolvedValue(undefined) } as unknown as FileSystemFileHandle;
		await batch([handle, handle]);
		await useRenameStore.getState().execute();
		expect(track).toHaveBeenCalledWith("rename_complete", { mode: "real", result: "success" });
		expect(JSON.stringify(track.mock.calls)).not.toContain("private");
	});
	it("distinguishes partial failure and never exports the error text", async () => {
		const track = vi.spyOn(analytics, "trackTaskEvent");
		const good = { move: vi.fn().mockResolvedValue(undefined) } as unknown as FileSystemFileHandle;
		const bad = { move: vi.fn().mockRejectedValue(Error("private-b.pdf denied")) } as unknown as FileSystemFileHandle;
		await batch([good, bad]);
		await useRenameStore.getState().execute();
		expect(track).toHaveBeenCalledWith("rename_complete", { mode: "real", result: "partial" });
		expect(JSON.stringify(track.mock.calls)).not.toContain("private");
	});
});
