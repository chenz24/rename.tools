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
	let reloadTimeout: ReturnType<typeof setTimeout> | undefined;
	let currentRegistration: ServiceWorkerRegistration | undefined;
	const cleanup: (() => void)[] = [];
	const observed = new Set<ServiceWorker>();
	const notified = new Set<ServiceWorker>();
	const reloadOnce = () => {
		if (disposed || reloaded) return;
		reloaded = true;
		clearTimeout(reloadTimeout);
		reload();
	};

	const notifyUpdate = (worker: ServiceWorker) => {
		if (disposed || !container.controller || notified.has(worker)) return;
		notified.add(worker);
		onUpdate(() => {
			if (disposed || updateRequested) return;
			updateRequested = true;
			// The toast can outlive its worker: another tab may have updated, or a
			// newer release may now be waiting. Act on the current registration.
			const target = currentRegistration?.waiting ?? worker;
			if (
				target.state === "activated" ||
				target.state === "redundant" ||
				container.controller === target
			) {
				reloadOnce();
				return;
			}
			try {
				target.postMessage("SKIP_WAITING");
				// Activation or clients.claim() can fail. This fallback is armed only
				// after the user explicitly chooses Refresh, and runs at most once.
				reloadTimeout = setTimeout(reloadOnce, 10000);
			} catch (error) {
				onError(error);
				reloadOnce();
			}
		});
	};

	const onControllerChange = () => {
		// clients.claim() also fires on the first visit. Never reload for that.
		if (updateRequested) reloadOnce();
	};
	container.addEventListener("controllerchange", onControllerChange);
	cleanup.push(() => container.removeEventListener("controllerchange", onControllerChange));

	void container
		.register("/sw.js", { scope: "/", updateViaCache: "none" })
		.then((registration) => {
			if (disposed) return;
			currentRegistration = registration;
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
		clearTimeout(reloadTimeout);
		for (const removeListener of cleanup) removeListener();
	};
}
