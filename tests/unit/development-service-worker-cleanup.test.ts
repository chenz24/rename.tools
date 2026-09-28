import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";
import { developmentServiceWorkerCleanup } from "@/lib/development-service-worker-cleanup";

function setup() {
	const origin = "http://localhost:3000";
	const worker = { scriptURL: `${origin}/sw.js` };
	const registration = {
		scope: `${origin}/`,
		active: worker,
		unregister: vi.fn().mockResolvedValue(true),
	};
	const serviceWorker = {
		controller: worker as typeof worker | null,
		getRegistrations: vi.fn().mockResolvedValue([registration]),
	};
	const caches = {
		keys: vi
			.fn()
			.mockResolvedValue(["rename-tools-static-v1.1", "rename-tools-dynamic-v1.1", "other-app"]),
		delete: vi.fn().mockResolvedValue(true),
	};
	const location = { origin, reload: vi.fn() };
	const console = { warn: vi.fn() };
	const run = () =>
		runInNewContext(developmentServiceWorkerCleanup, {
			URL,
			navigator: { serviceWorker },
			window: { caches },
			caches,
			location,
			console,
		});
	return { worker, registration, serviceWorker, caches, location, console, run };
}

describe("development recovery before React starts", () => {
	it("removes the legacy worker and only this app's caches before reloading", async () => {
		const s = setup();
		await s.run();
		expect(s.registration.unregister).toHaveBeenCalledOnce();
		expect(s.caches.delete.mock.calls).toEqual([
			["rename-tools-static-v1.1"],
			["rename-tools-dynamic-v1.1"],
		]);
		expect(s.location.reload).toHaveBeenCalledOnce();
		expect(s.location.reload.mock.invocationCallOrder[0]).toBeGreaterThan(
			s.caches.delete.mock.invocationCallOrder[1],
		);
	});

	it("does nothing on the next uncontrolled page, preventing a reload loop", async () => {
		const s = setup();
		await s.run();
		s.serviceWorker.controller = null;
		s.serviceWorker.getRegistrations.mockResolvedValue([]);
		await s.run();
		expect(s.location.reload).toHaveBeenCalledOnce();
		expect(s.caches.keys).toHaveBeenCalledOnce();
	});

	it("leaves unrelated workers and all caches alone", async () => {
		const s = setup();
		s.worker.scriptURL = "http://localhost:3000/another-app/sw.js";
		await s.run();
		expect(s.registration.unregister).not.toHaveBeenCalled();
		expect(s.caches.keys).not.toHaveBeenCalled();
		expect(s.location.reload).not.toHaveBeenCalled();
	});

	it("does not unregister the same script registered under another scope", async () => {
		const s = setup();
		s.serviceWorker.controller = null;
		s.registration.scope += "another-app/";
		await s.run();
		expect(s.registration.unregister).not.toHaveBeenCalled();
		expect(s.caches.keys).not.toHaveBeenCalled();
	});

	it("cleans an inactive registration without an unnecessary reload", async () => {
		const s = setup();
		s.serviceWorker.controller = null;
		await s.run();
		expect(s.registration.unregister).toHaveBeenCalledOnce();
		expect(s.caches.delete).toHaveBeenCalledTimes(2);
		expect(s.location.reload).not.toHaveBeenCalled();
	});

	it("releases a controller whose registration was already removed", async () => {
		const s = setup();
		s.serviceWorker.getRegistrations.mockResolvedValue([]);
		await s.run();
		expect(s.location.reload).toHaveBeenCalledOnce();
	});

	it("does not reload if unregistering fails", async () => {
		const s = setup();
		s.registration.unregister.mockResolvedValue(false);
		await s.run();
		expect(s.location.reload).not.toHaveBeenCalled();
	});

	it("handles restricted storage without an unhandled error or reload loop", async () => {
		const s = setup();
		s.caches.keys.mockRejectedValue(new Error("storage unavailable"));
		await expect(s.run()).resolves.toBeUndefined();
		expect(s.console.warn).toHaveBeenCalledOnce();
		expect(s.location.reload).not.toHaveBeenCalled();
	});
});
