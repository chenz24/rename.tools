"use client";

import { useCallback, useRef, useState } from "react";
import { extractMetadata } from "@/lib/file-metadata";
import type { FileMetadata, MetadataLoadState } from "@/lib/file-metadata/types";
import type { FileEntry } from "@/lib/rename/types";

export interface MetadataLoadProgress {
	current: number;
	total: number;
	state: "idle" | "loading" | "done";
}

const CONCURRENCY = 5;

export function useMetadataLoader() {
	const [progress, setProgress] = useState<MetadataLoadProgress>({
		current: 0,
		total: 0,
		state: "idle",
	});
	const abortRef = useRef(false);

	const loadMetadata = useCallback(
		async (
			files: FileEntry[],
			onUpdate: (
				id: string,
				metadata: FileMetadata | null,
				state: MetadataLoadState,
				error?: string,
			) => void,
		) => {
			// Only load for files that have handles and haven't been loaded yet
			const toLoad = files.filter(
				(f) => f.handle && f.metadataState !== "loaded" && f.metadataState !== "loading",
			);

			if (toLoad.length === 0) return;

			abortRef.current = false;
			setProgress({ current: 0, total: toLoad.length, state: "loading" });

			// Mark all as loading
			for (const file of toLoad) {
				onUpdate(file.id, null, "loading");
			}

			// Process in batches with concurrency limit
			let completed = 0;
			const queue = [...toLoad];

			const processNext = async (): Promise<void> => {
				while (queue.length > 0 && !abortRef.current) {
					const file = queue.shift();
					if (!file?.handle) continue;

					try {
						const actualFile = await file.handle.getFile();
						const metadata = await extractMetadata(actualFile);
						onUpdate(file.id, metadata, "loaded");
					} catch (err) {
						onUpdate(file.id, null, "error", String(err));
					}

					completed++;
					setProgress((prev) => ({ ...prev, current: completed }));
				}
			};

			// Start concurrent workers
			const workers = Array.from({ length: Math.min(CONCURRENCY, toLoad.length) }, () =>
				processNext(),
			);
			await Promise.all(workers);

			setProgress((prev) => ({ ...prev, state: "done" }));
		},
		[],
	);

	const cancelLoad = useCallback(() => {
		abortRef.current = true;
	}, []);

	const resetProgress = useCallback(() => {
		setProgress({ current: 0, total: 0, state: "idle" });
	}, []);

	return {
		progress,
		loadMetadata,
		cancelLoad,
		resetProgress,
	};
}
