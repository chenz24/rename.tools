"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function RegisterServiceWorker() {
	const hasShownUpdate = useRef(false);

	useEffect(() => {
		if (!("serviceWorker" in navigator)) return;

		navigator.serviceWorker
			.register("/sw.js", { scope: "/" })
			.then((registration) => {
				// Check for updates every 60 minutes
				const interval = setInterval(
					() => {
						registration.update();
					},
					60 * 60 * 1000,
				);

				registration.addEventListener("updatefound", () => {
					const newWorker = registration.installing;
					if (!newWorker) return;

					newWorker.addEventListener("statechange", () => {
						// New SW installed & waiting, and there's already a controller
						// (meaning this is an update, not the first install)
						if (
							newWorker.state === "installed" &&
							navigator.serviceWorker.controller &&
							!hasShownUpdate.current
						) {
							hasShownUpdate.current = true;
							showUpdateToast(newWorker);
						}
					});
				});

				navigator.serviceWorker.addEventListener("controllerchange", () => {
					window.location.reload();
				});

				return () => clearInterval(interval);
			})
			.catch((error) => {
				console.error("[SW] Registration failed:", error);
			});
	}, []);

	return null;
}

function showUpdateToast(waitingWorker: ServiceWorker) {
	toast.info("A new version is available", {
		description: "Refresh to get the latest features.",
		duration: Number.POSITIVE_INFINITY,
		action: {
			label: "Refresh",
			onClick: () => {
				waitingWorker.postMessage("SKIP_WAITING");
			},
		},
	});
}
