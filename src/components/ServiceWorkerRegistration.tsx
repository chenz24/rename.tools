"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { registerServiceWorker } from "@/lib/service-worker-registration";

export function RegisterServiceWorker() {
	useEffect(() => {
		// Development chunk URLs are not immutable; cache-first would serve stale code after edits.
		if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

		let dispose: (() => void) | undefined;
		const start = () => {
			dispose = registerServiceWorker(
				navigator.serviceWorker,
				showUpdateToast,
				() => window.location.reload(),
				(error) => console.error("[SW] Registration or update failed:", error),
			);
		};
		// Precaching offline assets should not compete with the initial page load.
		if (document.readyState === "complete") start();
		else window.addEventListener("load", start, { once: true });
		return () => {
			window.removeEventListener("load", start);
			dispose?.();
		};
	}, []);

	return null;
}

function showUpdateToast(activate: () => void) {
	toast.info("A new version is available", {
		description: "Refresh to get the latest features.",
		duration: Number.POSITIVE_INFINITY,
		action: {
			label: "Refresh",
			onClick: activate,
		},
	});
}
