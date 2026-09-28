import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "@/lib/service-worker-registration";

class Worker extends EventTarget {
	state = "installing";
	postMessage = vi.fn();
	install() {
		this.state = "installed";
		this.dispatchEvent(new Event("statechange"));
	}
}

class Registration extends EventTarget {
	installing: Worker | null = null;
	waiting: Worker | null = null;
	update = vi.fn().mockResolvedValue(undefined);
}

function setup({ controlled = false, waiting = false } = {}) {
	const registration = new Registration();
	const worker = new Worker();
	if (waiting) {
		worker.state = "installed";
		registration.waiting = worker;
	} else registration.installing = worker;
	const container = Object.assign(new EventTarget(), {
		controller: controlled ? new Worker() : null,
		register: vi.fn().mockResolvedValue(registration),
	});
	const onUpdate = vi.fn<(activate: () => void) => void>();
	const reload = vi.fn();
	const onError = vi.fn();
	const start = () => registerServiceWorker(
		container as unknown as ServiceWorkerContainer,
		onUpdate,
		reload,
		onError,
	);
	return { registration, worker, container, onUpdate, reload, onError, start };
}

describe("service worker lifecycle", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("does not reload or show an update on the first installation and claim", async () => {
		const s = setup();
		const dispose = s.start();
		expect(s.container.register).toHaveBeenCalledWith("/sw.js", { scope: "/", updateViaCache: "none" });
		await Promise.resolve();
		s.worker.install();
		s.container.controller = s.worker;
		s.container.dispatchEvent(new Event("controllerchange"));
		expect(s.onUpdate).not.toHaveBeenCalled();
		expect(s.reload).not.toHaveBeenCalled();
		dispose();
	});

	it("offers an already-waiting update and reloads only once after acceptance", async () => {
		const s = setup({ controlled: true, waiting: true });
		const dispose = s.start();
		await Promise.resolve();
		expect(s.onUpdate).toHaveBeenCalledOnce();
		expect(s.worker.postMessage).not.toHaveBeenCalled();
		s.onUpdate.mock.calls[0][0]();
		expect(s.worker.postMessage).toHaveBeenCalledWith("SKIP_WAITING");
		s.container.dispatchEvent(new Event("controllerchange"));
		s.container.dispatchEvent(new Event("controllerchange"));
		expect(s.reload).toHaveBeenCalledOnce();
		dispose();
	});

	it("observes new installations without duplicate prompts or unapproved reloads", async () => {
		const s = setup({ controlled: true });
		s.registration.installing = null;
		const dispose = s.start();
		await Promise.resolve();
		s.registration.installing = s.worker;
		s.registration.dispatchEvent(new Event("updatefound"));
		s.registration.dispatchEvent(new Event("updatefound"));
		s.worker.install();
		s.worker.dispatchEvent(new Event("statechange"));
		expect(s.onUpdate).toHaveBeenCalledOnce();
		// Another tab may accept the update; this tab has not consented to reload.
		s.container.dispatchEvent(new Event("controllerchange"));
		expect(s.reload).not.toHaveBeenCalled();
		dispose();
	});

	it("allows manual refresh after another tab has already activated the offered worker", async () => {
		const s = setup({ controlled: true, waiting: true });
		const dispose = s.start();
		await Promise.resolve();
		s.worker.state = "activated";
		s.registration.waiting = null;
		s.container.controller = s.worker;
		s.container.dispatchEvent(new Event("controllerchange"));
		expect(s.reload).not.toHaveBeenCalled();
		s.onUpdate.mock.calls[0][0]();
		expect(s.reload).toHaveBeenCalledOnce();
		expect(s.worker.postMessage).not.toHaveBeenCalled();
		dispose();
	});

	it("accepts the latest waiting version when an older update notice is clicked", async () => {
		const s = setup({ controlled: true, waiting: true });
		const dispose = s.start();
		await Promise.resolve();
		s.worker.state = "redundant";
		const latest = new Worker();
		latest.state = "installed";
		s.registration.waiting = latest;
		s.onUpdate.mock.calls[0][0]();
		expect(latest.postMessage).toHaveBeenCalledWith("SKIP_WAITING");
		expect(s.worker.postMessage).not.toHaveBeenCalled();
		dispose();
	});

	it("reloads once after an accepted update stalls, but never before user consent", async () => {
		const s = setup({ controlled: true, waiting: true });
		const dispose = s.start();
		await Promise.resolve();
		await vi.advanceTimersByTimeAsync(10000);
		expect(s.reload).not.toHaveBeenCalled();
		s.onUpdate.mock.calls[0][0]();
		await vi.advanceTimersByTimeAsync(10000);
		s.container.dispatchEvent(new Event("controllerchange"));
		expect(s.reload).toHaveBeenCalledOnce();
		dispose();
		expect(vi.getTimerCount()).toBe(0);
	});

	it("cleans up listeners, polling and stale toast actions on unmount", async () => {
		const s = setup({ controlled: true });
		const dispose = s.start();
		await Promise.resolve();
		s.worker.install();
		await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
		expect(s.registration.update).toHaveBeenCalledOnce();
		dispose();
		s.onUpdate.mock.calls[0][0]();
		s.container.dispatchEvent(new Event("controllerchange"));
		expect(s.worker.postMessage).not.toHaveBeenCalled();
		expect(s.reload).not.toHaveBeenCalled();
		expect(vi.getTimerCount()).toBe(0);
	});

	it("does not attach listeners or polling after a late registration resolves", async () => {
		const s = setup({ controlled: true, waiting: true });
		let resolve!: (registration: Registration) => void;
		s.container.register.mockReturnValue(new Promise<Registration>((done) => { resolve = done; }));
		const dispose = s.start();
		dispose();
		resolve(s.registration);
		await Promise.resolve();
		expect(s.onUpdate).not.toHaveBeenCalled();
		expect(vi.getTimerCount()).toBe(0);
	});

	it("reports registration and periodic update failures without unhandled rejections", async () => {
		const failed = setup();
		const error = new Error("offline");
		failed.container.register.mockRejectedValue(error);
		const disposeFailed = failed.start();
		await vi.advanceTimersByTimeAsync(0);
		expect(failed.onError).toHaveBeenCalledWith(error);
		disposeFailed();

		const s = setup();
		s.registration.update.mockRejectedValue(error);
		const dispose = s.start();
		await Promise.resolve();
		await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
		expect(s.onError).toHaveBeenCalledWith(error);
		dispose();
	});
});
