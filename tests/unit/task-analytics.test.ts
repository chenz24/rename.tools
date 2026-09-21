import { afterEach, describe, expect, it, vi } from "vitest";
import { sanitizeTaskEvent, taskMode, taskPayload } from "@/lib/task-analytics";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules(); });

describe("Task analytics privacy and semantics", () => {
	it("drops private fields even when provided by a caller", () => {
		const data = { recipe_id: "prefix-suffix", entry: "home", filename: "private.pdf", rules: "private code", url: "?preset=secret" };
		expect(taskPayload("recipe_open", data, "/zh/app", "test-site")).toEqual({ website: "test-site", url: "/zh/app", title: "Rename.Tools", name: "recipe_open", data: { recipe_id: "prefix-suffix", entry: "home", locale: "zh" } });
	});
	it.each(["private.pdf", "constructor", "toString", "custom_event"])("rejects unknown event %s", (name) => {
		expect(sanitizeTaskEvent(name, {})).toBeNull();
	});
	it("rejects arbitrary values in otherwise allowed fields", () => {
		expect(sanitizeTaskEvent("recipe_open", { recipe_id: "private preset", entry: "home" })).toBeNull();
		expect(sanitizeTaskEvent("rename_complete", { mode: "real", result: "private error message" })).toBeNull();
		expect(sanitizeTaskEvent("recipe_open", { recipe_id: "prefix-suffix" })).toBeNull();
	});
	it.each(["/en/app?preset=secret", "/en/app#secret", "/private.pdf", "/unknown/app"])("rejects untrusted path %s", (path) => {
		expect(taskPayload("recipe_open", { recipe_id: "prefix-suffix", entry: "home" }, path, "test")).toBeNull();
	});
	it("distinguishes sample, real, mixed and empty workspaces", () => {
		const real = { handle: {} as FileSystemFileHandle };
		expect(taskMode([])).toBe("empty");
		expect(taskMode([{}])).toBe("sample");
		expect(taskMode([real])).toBe("real");
		expect(taskMode([real, {}])).toBe("mixed");
	});
	it("does not send anything when the rollout flag is off", async () => {
		vi.stubEnv("NEXT_PUBLIC_TASK_ANALYTICS_ENABLED", "false");
		vi.stubEnv("NEXT_PUBLIC_UMAMI_WEBSITE_ID", "test");
		const track = vi.fn();
		vi.stubGlobal("window", { location: { pathname: "/en/app", href: "https://rename.tools/en/app?preset=secret" }, umami: { track } });
		vi.resetModules();
		const { trackTaskEvent } = await import("@/lib/task-analytics");
		trackTaskEvent("recipe_open", { recipe_id: "prefix-suffix", entry: "home" });
		expect(track).not.toHaveBeenCalled();
	});
	it("uses an explicit payload and deduplicates even without storage", async () => {
		vi.stubEnv("NEXT_PUBLIC_TASK_ANALYTICS_ENABLED", "true");
		vi.stubEnv("NEXT_PUBLIC_UMAMI_WEBSITE_ID", "test");
		const track = vi.fn();
		vi.stubGlobal("window", { location: { pathname: "/en/app", href: "https://rename.tools/en/app?preset=secret" }, umami: { track } });
		vi.stubGlobal("sessionStorage", { getItem: () => { throw Error("blocked"); } });
		vi.resetModules();
		const { trackTaskEvent } = await import("@/lib/task-analytics");
		trackTaskEvent("recipe_open", { recipe_id: "prefix-suffix", entry: "home" });
		trackTaskEvent("recipe_open", { recipe_id: "prefix-suffix", entry: "home" });
		expect(track).toHaveBeenCalledTimes(1);
		expect(JSON.stringify(track.mock.calls)).not.toContain("secret");
		expect(track.mock.calls[0][0].url).toBe("/en/app");
	});
	it("does not let provider failure break the app", async () => {
		vi.stubEnv("NEXT_PUBLIC_TASK_ANALYTICS_ENABLED", "true");
		vi.stubEnv("NEXT_PUBLIC_UMAMI_WEBSITE_ID", "test");
		vi.stubGlobal("window", { location: { pathname: "/en/app" }, umami: { track: () => { throw Error("offline"); } } });
		vi.resetModules();
		const { trackTaskEvent } = await import("@/lib/task-analytics");
		expect(() => trackTaskEvent("rename_complete", { mode: "real", result: "success" })).not.toThrow();
	});
});
