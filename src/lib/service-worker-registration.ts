/** Keep first installation separate from a user-approved application update. */
export function registerServiceWorker(
	container: ServiceWorkerContainer,
	onUpdate: (activate: () => void) => void,
	reload: () => void,
	onError: (error: unknown) => void,
): () => void {
	let disposed = false;
	let updateRequested = false;
	let reloaded = false;
	let interval: ReturnType<typeof setInterval> | undefined;
	const cleanup: (() => void)[] = [];
	const observed = new Set<ServiceWorker>();
	const notified = new Set<ServiceWorker>();

	const notifyUpdate = (worker: ServiceWorker) => {
		if (disposed || !container.controller || notified.has(worker)) return;
		notified.add(worker);
		onUpdate(() => {
			if (disposed) return;
			updateRequested = true;
			worker.postMessage("SKIP_WAITING");
		});
	};

	const onControllerChange = () => {
		// clients.claim() also fires on the first visit. Never reload for that.
		if (!disposed && updateRequested && !reloaded) {
			reloaded = true;
			reload();
		}
	};
	container.addEventListener("controllerchange", onControllerChange);
	cleanup.push(() => container.removeEventListener("controllerchange", onControllerChange));

	void container
		.register("/sw.js", { scope: "/", updateViaCache: "none" })
		.then((registration) => {
			if (disposed) return;
			const observeInstalling = () => {
				const worker = registration.installing;
				if (!worker || observed.has(worker)) return;
				observed.add(worker);
				const onStateChange = () => {
					if (worker.state === "installed") notifyUpdate(worker);
				};
				worker.addEventListener("statechange", onStateChange);
				cleanup.push(() => worker.removeEventListener("statechange", onStateChange));
				onStateChange();
			};
			registration.addEventListener("updatefound", observeInstalling);
			cleanup.push(() => registration.removeEventListener("updatefound", observeInstalling));
			observeInstalling();
			// An update may already be waiting when the page mounts.
			if (registration.waiting) notifyUpdate(registration.waiting);
			interval = setInterval(
				() => {
					void registration.update().catch((error) => {
						if (!disposed) onError(error);
					});
				},
				60 * 60 * 1000,
			);
		})
		.catch((error) => {
			if (!disposed) onError(error);
		});

	return () => {
		disposed = true;
		clearInterval(interval);
		for (const removeListener of cleanup) removeListener();
	};
}
