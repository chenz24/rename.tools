import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const template = readFileSync("scripts/service-worker.js", "utf8");
function setup() {
	const stores = new Map<string, Map<string, Response>>();
	const cacheKey = (request: Request | string) => new URL(typeof request === "string" ? request : request.url, "https://rename.tools").href;
	const caches = {
		keys: async () => [...stores.keys()],
		delete: vi.fn(async (name: string) => stores.delete(name)),
		open: async (name: string) => {
			if (!stores.has(name)) stores.set(name, new Map());
			const store = stores.get(name)!;
			return {
				match: async (request: Request | string) => store.get(cacheKey(request))?.clone(),
				put: async (request: Request | string, response: Response) => { store.set(cacheKey(request), response.clone()); },
				addAll: vi.fn(),
			};
		},
		match: async (request: Request | string, options?: { cacheName: string }) => {
			const key = cacheKey(request);
			for (const [name, store] of stores) if ((!options || name === options.cacheName) && store.has(key)) return store.get(key)!.clone();
		},
	};
	const fetch = vi.fn(async (_request?: unknown, _options?: { signal?: AbortSignal }) => new Response("new release", { headers: { "Content-Type": "text/html" } }));
	const handlers: Record<string, (event: unknown) => void> = {};
	const self = { location: { origin: "https://rename.tools" }, clients: { claim: vi.fn() }, skipWaiting: vi.fn(), addEventListener: (name: string, handler: (event: unknown) => void) => { handlers[name] = handler; } };
	const load = (release: string) => runInNewContext(template.replaceAll("__RENAME_RELEASE__", release), { self, caches, fetch, URL, Response, AbortController, setTimeout, clearTimeout });
	const request = async (path: string, options: { mode?: string; headers?: Record<string, string> } = {}) => {
		const req = { url: `https://rename.tools${path}`, method: "GET", mode: options.mode || "cors", headers: new Headers(options.headers) };
		const pending: Promise<unknown>[] = [];
		let response: Promise<Response> | undefined;
		handlers.fetch({ request: req, respondWith: (value: Promise<Response>) => { response = value; }, waitUntil: (value: Promise<unknown>) => pending.push(value) });
		const result = await response;
		await Promise.all(pending);
		return result;
	};
	const activate = async () => {
		let work: Promise<unknown> | undefined;
		handlers.activate({ waitUntil: (value: Promise<unknown>) => { work = value; } });
		await work;
	};
	const seed = async (cache: string, path: string, text: string) => (await caches.open(cache)).put(`https://rename.tools${path}`, new Response(text));
	load("release-a");
	return { request, activate, seed, load, fetch, stores, caches, self };
}

describe("production SW deployment compatibility", () => {
	it.each([
		["/en/app?_rsc=old-key", {}],
		["/en/app", { RSC: "1" }],
		["/en/app", { "Next-Router-Prefetch": "1" }],
		["/en/app", { "Next-Router-State-Tree": "tree" }],
		["/en/app", { "Next-Router-Segment-Prefetch": "/_tree" }],
		["/en/app", { Accept: "text/x-component" }],
	] as [string, Record<string, string>][])('does not intercept Flight/prefetch %s %j', async (path, headers) => {
		const s = setup();
		await s.seed("rename-tools-dynamic-v1.1", path, "old Flight");
		expect(await s.request(path, { headers })).toBeUndefined();
		expect(s.fetch).not.toHaveBeenCalled();
	});

	it("migrates legacy caches without deleting immutable JS or unrelated caches", async () => {
		const s = setup();
		await s.seed("rename-tools-dynamic-v1.1", "/en", "old HTML");
		await s.seed("rename-tools-pages-previous", "/en", "old HTML");
		await s.seed("rename-tools-static-v1.1", "/_next/static/old-hash.js", "old JS");
		await s.seed("other-app", "/data", "user data");
		await s.activate();
		expect(s.caches.delete.mock.calls).toEqual([["rename-tools-dynamic-v1.1"], ["rename-tools-pages-previous"]]);
		expect(await (await s.request("/_next/static/old-hash.js"))?.text()).toBe("old JS");
		expect(await (await s.request("/_next/static/new-hash.js"))?.text()).toBe("new release");
		expect(s.self.clients.claim).toHaveBeenCalledOnce();
		expect(s.self.skipWaiting).not.toHaveBeenCalled();
	});

	it("uses online HTML and isolates the offline cache of each build", async () => {
		const s = setup();
		expect(await (await s.request("/en", { mode: "navigate" }))?.text()).toBe("new release");
		s.fetch.mockRejectedValue(new Error("offline"));
		expect(await (await s.request("/en", { mode: "navigate" }))?.text()).toBe("new release");
		s.load("release-b");
		await s.activate();
		expect((await s.request("/en", { mode: "navigate" }))?.status).toBe(503);
	});

	it("serves the current offline page instead of the legacy page without repair", async () => {
		const s = setup();
		await s.seed("rename-tools-static-v1.1", "/offline.html", "legacy offline page");
		await s.seed("rename-tools-static-v2", "/offline.html", "offline with repair link");
		s.fetch.mockRejectedValue(new Error("offline"));
		expect(await (await s.request("/zh/app", { mode: "navigate" }))?.text()).toBe("offline with repair link");
	});

	it("falls back to cached HTML if the navigation network never responds", async () => {
		vi.useFakeTimers();
		try {
			const s = setup();
			await s.seed("rename-tools-pages-release-a", "/en", "usable cached page");
			s.fetch.mockImplementation((_request, options) => new Promise((_resolve, reject) => {
				options?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
			}));
			const result = s.request("/en", { mode: "navigate" });
			await vi.advanceTimersByTimeAsync(10000);
			expect(await (await result)?.text()).toBe("usable cached page");
			expect(vi.getTimerCount()).toBe(0);
		} finally { vi.useRealTimers(); }
	});

	it("still loads online when CacheStorage is unavailable", async () => {
		const s = setup();
		vi.spyOn(s.caches, "open").mockRejectedValue(new Error("storage blocked"));
		expect(await (await s.request("/_next/static/main.js"))?.text()).toBe("new release");
		expect(await (await s.request("/en", { mode: "navigate" }))?.text()).toBe("new release");
	});

	it("does not hide a missing chunk behind a successful response or cache it", async () => {
		const s = setup();
		s.fetch.mockResolvedValue(new Response("missing", { status: 404 }));
		expect((await s.request("/_next/static/missing.js"))?.status).toBe(404);
		expect(s.stores.get("rename-tools-static-v2")?.size).toBe(0);
	});

	it.each(["/repair.html", "/repair", "/repair?probe=123", "/repair.html?probe=123", "/sw.js", "/api/data", "/en/about", "/random.json"])("leaves %s to the network", async (path) => {
		const s = setup();
		expect(await s.request(path)).toBeUndefined();
	});
});
