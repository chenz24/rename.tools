import type { FileEntry, PreviewResult, RenameRule } from "./types";

export function getGuidanceState({
	files,
	selectedCount,
	rules,
	preview,
	isExecuting,
	isPreviewComputing,
}: {
	files: FileEntry[];
	selectedCount: number;
	rules: RenameRule[];
	preview: PreviewResult[];
	isExecuting: boolean;
	isPreviewComputing: boolean;
}) {
	if (isExecuting) return "executing";
	if (isPreviewComputing) return "computing";
	if (!files.length) return "noFiles";
	if (!selectedCount) return "noSelection";
	if (!rules.length) return "noRules";
	if (!rules.some((rule) => rule.enabled)) return "disabledRules";
	if (preview.some((row) => row.conflict)) return "conflicts";
	const changedIds = new Set(preview.filter((row) => row.hasChange).map((row) => row.fileId));
	if (!changedIds.size) return "noChanges";
	const writableCount = files.filter((file) => changedIds.has(file.id) && file.handle).length;
	if (!writableCount) return "previewOnly";
	return writableCount < changedIds.size ? "mixed" : "ready";
}

export type GuidanceState = ReturnType<typeof getGuidanceState>;
