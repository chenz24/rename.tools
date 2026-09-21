"use client";

import { useEffect } from "react";
import { useRenameStore } from "@/hooks/useRenameStore";
import { taskMode, trackTaskEvent } from "@/lib/task-analytics";

export function TaskMeasurement() {
	useEffect(() => {
		const observe = () => {
			const state = useRenameStore.getState();
			if (
				state.isPreviewComputing ||
				state.isExecuting ||
				!state.preview.some((row) => row.hasChange) ||
				state.preview.some((row) => row.conflict)
			)
				return;
			trackTaskEvent("preview_ready", {
				mode: taskMode(state.filteredFiles),
				capability:
					typeof FileSystemFileHandle !== "undefined" && "move" in FileSystemFileHandle.prototype
						? "direct"
						: "script",
			});
		};
		observe();
		return useRenameStore.subscribe(observe);
	}, []);
	return null;
}
