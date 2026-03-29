"use client";

import { Download, FileText, Play, RotateCcw, Terminal, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PreviewResult } from "@/lib/rename/types";

interface Props {
	preview: PreviewResult[];
	isExecuting: boolean;
	onExecute: () => void;
	onClearRules: () => void;
}

function esc(s: string) {
	return s.replace(/"/g, '\\"');
}

function downloadBlob(content: string, filename: string, type: string) {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export function ExecuteBar({ preview, isExecuting, onExecute, onClearRules }: Props) {
	const t = useTranslations("rename.execute");
	const [warningChecked, setWarningChecked] = useState(false);

	const affectedCount = preview.filter((r) => r.hasChange).length;
	const hasConflicts = preview.some((r) => r.conflict);
	const affected = preview.filter((r) => r.hasChange);

	const exportJSON = useCallback(() => {
		const data = affected.map((r) => ({
			oldName: r.original,
			newName: r.newName,
			conflict: r.conflict,
		}));
		downloadBlob(JSON.stringify(data, null, 2), "rename-plan.json", "application/json");
	}, [affected]);

	const exportBash = useCallback(() => {
		const lines = affected.map((r) => `mv "${esc(r.original)}" "${esc(r.newName)}"`);
		downloadBlob(lines.join("\n"), "rename.sh", "text/plain");
	}, [affected]);

	const exportPowerShell = useCallback(() => {
		const lines = affected.map(
			(r) => `Rename-Item -LiteralPath "${esc(r.original)}" -NewName "${esc(r.newName)}"`,
		);
		downloadBlob(lines.join("\n"), "rename.ps1", "text/plain");
	}, [affected]);

	const exportCSV = useCallback(() => {
		const header = "oldName,newName";
		const rows = affected.map((r) => `"${esc(r.original)}","${esc(r.newName)}"`);
		downloadBlob([header, ...rows].join("\n"), "rename-mapping.csv", "text/csv");
	}, [affected]);

	const exportReverse = useCallback(() => {
		const lines = affected.map((r) => `mv "${esc(r.newName)}" "${esc(r.original)}"`);
		downloadBlob(lines.join("\n"), "rename-undo.sh", "text/plain");
	}, [affected]);

	return (
		<div className="flex items-center gap-2 border-t bg-card px-4 py-2.5 shadow-[0_-2px_10px_hsl(var(--border)/0.5)]">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="gap-1 text-xs"
						disabled={affectedCount === 0}
					>
						<Download className="h-3.5 w-3.5" /> {t("exportScript")}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<DropdownMenuItem onClick={exportBash}>
						<Terminal className="h-3.5 w-3.5 mr-2" /> Bash (.sh)
					</DropdownMenuItem>
					<DropdownMenuItem onClick={exportPowerShell}>
						<Terminal className="h-3.5 w-3.5 mr-2" /> PowerShell (.ps1)
					</DropdownMenuItem>
					<DropdownMenuItem onClick={exportReverse}>
						<RotateCcw className="h-3.5 w-3.5 mr-2" /> Undo Script (.sh)
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="gap-1 text-xs"
						disabled={affectedCount === 0}
					>
						<FileText className="h-3.5 w-3.5" /> {t("exportPlan")}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<DropdownMenuItem onClick={exportJSON}>JSON (.json)</DropdownMenuItem>
					<DropdownMenuItem onClick={exportCSV}>CSV (.csv)</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<div className="ml-auto flex items-center gap-2">
				<Button variant="outline" size="sm" className="gap-1 text-xs" onClick={onClearRules}>
					<Trash2 className="h-3.5 w-3.5" /> {t("clear")}
				</Button>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<button
							type="button"
							className="inline-flex items-center gap-1.5 rounded-md brand-gradient px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none"
							disabled={affectedCount === 0 || hasConflicts || isExecuting}
						>
							<Play className="h-3.5 w-3.5" />
							{t("execute")} ({affectedCount})
						</button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>{t("confirmTitle")}</AlertDialogTitle>
							<AlertDialogDescription>
								{t("confirmDesc", {
									count: String(affectedCount),
								})}
							</AlertDialogDescription>
						</AlertDialogHeader>

						<div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-3">
							<Checkbox
								id="timestamp-warning"
								checked={warningChecked}
								onCheckedChange={(v) => setWarningChecked(!!v)}
								className="mt-0.5"
							/>
							<label
								htmlFor="timestamp-warning"
								className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
							>
								{t("timestampWarning")}
							</label>
						</div>

						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setWarningChecked(false)}>
								{t("cancel")}
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									onExecute();
									setWarningChecked(false);
								}}
								disabled={!warningChecked}
							>
								{t("confirm")}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
