import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";
import { pageRecoveryBootstrap } from "@/lib/page-recovery";

type TestElement = { id: string; textContent: string; href: string; disabled: boolean; style: { cssText: string }; dataset: Record<string, string>; children: TestElement[]; setAttribute: ReturnType<typeof vi.fn>; append(...items: TestElement[]): void; remove: ReturnType<typeof vi.fn>; onclick?: () => Promise<void> };
function element(): TestElement {
	return { id: "", textContent: "", href: "", disabled: false, style: { cssText: "" }, dataset: {} as Record<string, string>, children: [] as ReturnType<typeof element>[], setAttribute: vi.fn(), append(...items: ReturnType<typeof element>[]) { this.children.push(...items); }, remove: vi.fn(), onclick: undefined as (() => Promise<void>) | undefined };
}
function dom() {
	const elements = new Map<string, ReturnType<typeof element>>();
	const body = { appendChild: (el: ReturnType<typeof element>) => { elements.set(el.id, el); } };
	const document = { body, documentElement: { lang: "en" }, createElement: element, getElementById: (id: string) => elements.get(id), addEventListener: vi.fn() };
	return { elements, document };
}

describe("pre-hydration recovery", () => {
	function setup() {
		const d = dom();
		const listeners: Record<string, (event?: unknown) => void> = {};
		let watchdog!: () => void;
		const window = { addEventListener: (name: string, fn: (event?: unknown) => void) => { listeners[name] = fn; } };
		runInNewContext(pageRecoveryBootstrap("zh"), { window, document: d.document, URL, location: { origin: "https://rename.tools", href: "https://rename.tools/zh/app", pathname: "/zh/app", search: "?preset=123", hash: "" }, setTimeout: (fn: () => void) => { watchdog = fn; } });
		return { ...d, listeners, watchdog };
	}
	it("offers a plain repair link even when application JS never loaded", () => {
		const s = setup();
		s.listeners.error({ target: { src: "https://rename.tools/_next/static/missing.js" } });
		const box = s.elements.get("rename-recovery")!;
		expect(box.children[2].textContent).toBe("修复并重新加载");
		expect(box.children[2].href).toBe("/repair.html?returnTo=%2Fzh%2Fapp%3Fpreset%3D123");
		s.watchdog();
		s.listeners["rename:ready"]();
		expect(box.remove).not.toHaveBeenCalled();
	});
	it("detects module factory and lazy chunk rejection errors", () => {
		const s = setup();
		s.listeners.unhandledrejection({ reason: new Error("module factory is not available") });
		expect(s.elements.has("rename-recovery")).toBe(true);
	});
	it("does not interrupt healthy pages or failures in third-party analytics", () => {
		const s = setup();
		s.listeners.error({ target: { src: "https://analytics.example/_next/static/analytics.js" } });
		s.listeners["rename:ready"]();
		s.watchdog();
		expect(s.elements.size).toBe(0);
	});
	it("provides a slow-start fallback without a reload, and removes it after startup", () => {
		const s = setup();
		s.watchdog();
		const box = s.elements.get("rename-recovery")!;
		expect(box.children[0].textContent).toContain("加载时间较长");
		s.listeners["rename:ready"]();
		expect(box.remove).toHaveBeenCalledOnce();
	});
});

const html = readFileSync("public/repair.html", "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)![1];
function repairSetup(returnTo = "/zh/app?preset=123#rules") {
	const d = dom();
	for (const id of ["title", "description", "notice", "repair", "back", "status"]) d.elements.set(id, element());
	const origin = "https://rename.tools";
	const ownRegistration = { scope: `${origin}/`, active: { scriptURL: `${origin}/sw.js` }, unregister: vi.fn().mockResolvedValue(true) };
	const unrelated = { scope: `${origin}/another/`, active: { scriptURL: `${origin}/another/sw.js` }, unregister: vi.fn() };
	const serviceWorker = { getRegistrations: vi.fn().mockResolvedValue([ownRegistration, unrelated]) };
	ownRegistration.unregister.mockImplementation(async () => { serviceWorker.getRegistrations.mockResolvedValue([unrelated]); return true; });
	const caches = { keys: vi.fn().mockResolvedValue(["rename-tools-static-v1.1", "rename-tools-pages-old", "other-app"]), delete: vi.fn().mockResolvedValue(true) };
	const fetch = vi.fn().mockImplementation(async () => new Response(html, { headers: { "Content-Type": "text/html" } }));
	const location = { origin, href: `${origin}/repair.html?returnTo=${encodeURIComponent(returnTo)}`, replace: vi.fn() };
	const localStorage = { clear: vi.fn(), removeItem: vi.fn() };
	runInNewContext(script, { window: { caches }, document: d.document, URL, location, navigator: { serviceWorker }, caches, fetch, AbortController, setTimeout, clearTimeout, localStorage });
	return { ...d, ownRegistration, unrelated, serviceWorker, caches, fetch, location, localStorage, repair: () => d.elements.get("repair")!.onclick!() };
}

describe("standalone repair", () => {
	it("waits for an explicit click, removes only own worker/caches, preserves user data and returns once", async () => {
		const s = repairSetup();
		expect(s.fetch).not.toHaveBeenCalled();
		await s.repair();
		await s.repair();
		expect(s.ownRegistration.unregister).toHaveBeenCalledOnce();
		expect(s.unrelated.unregister).not.toHaveBeenCalled();
		expect(s.caches.delete.mock.calls).toEqual([["rename-tools-static-v1.1"], ["rename-tools-pages-old"]]);
		expect(s.localStorage.clear).not.toHaveBeenCalled();
		expect(s.localStorage.removeItem).not.toHaveBeenCalled();
		expect(s.location.replace).toHaveBeenCalledOnce();
		const target = new URL(s.location.replace.mock.calls[0][0]);
		expect(target.pathname).toBe("/zh/app");
		expect(target.searchParams.get("preset")).toBe("123");
		expect(target.searchParams.has("_repair")).toBe(true);
		expect(target.hash).toBe("#rules");
	});
	it("does not clear caches when another tab re-registers the worker during repair", async () => {
		const s = repairSetup();
		s.ownRegistration.unregister.mockImplementation(async () => true);
		await s.repair();
		expect(s.caches.delete).not.toHaveBeenCalled();
		expect(s.location.replace).not.toHaveBeenCalled();
		expect(s.elements.get("repair")!.disabled).toBe(false);
	});

	it("does not destroy offline caches when connectivity verification fails", async () => {
		const s = repairSetup();
		s.fetch.mockRejectedValue(new Error("offline"));
		await s.repair();
		expect(s.ownRegistration.unregister).not.toHaveBeenCalled();
		expect(s.caches.delete).not.toHaveBeenCalled();
		expect(s.location.replace).not.toHaveBeenCalled();
		expect(s.elements.get("repair")!.disabled).toBe(false);
		expect(s.elements.get("status")!.textContent).toContain("修复未完成");
	});
	it("keeps retry available if storage is blocked instead of looping reloads", async () => {
		const s = repairSetup();
		s.caches.keys.mockRejectedValue(new Error("storage denied"));
		await s.repair();
		expect(s.location.replace).not.toHaveBeenCalled();
		expect(s.elements.get("repair")!.disabled).toBe(false);
		s.caches.keys.mockResolvedValue([]);
		await s.repair();
		expect(s.location.replace).toHaveBeenCalledOnce();
	});
	it.each(["https://user:password@rename.tools/en", "https://evil.example/zh", "//evil.example/en", "/repair.html", "/api/delete", "javascript:alert(1)"])("rejects unsafe/recursive return target %s", async (target) => {
		const s = repairSetup(target);
		await s.repair();
		expect(new URL(s.location.replace.mock.calls[0][0]).pathname).toBe("/en");
		expect(new URL(s.location.replace.mock.calls[0][0]).origin).toBe("https://rename.tools");
	});
});
