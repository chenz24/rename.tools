"use client";

import {
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	MousePointerClick,
	SkipForward,
	X,
	XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LogEntry } from "@/hooks/useRenameStore";

interface Props {
	log: LogEntry[];
	progress: { current: number; total: number } | null;
	isExecuting: boolean;
	needsUserActivation: boolean;
	onClear: () => void;
	onConfirmActivation: () => void;
}

export function ExecutionLog({
	log,
	progress,
	isExecuting,
	needsUserActivation,
	onClear,
	onConfirmActivation,
}: Props) {
	const t = useTranslations("rename.execute");
	const [open, setOpen] = useState(true);

	if (!progress && log.length === 0) return null;

	const successCount = log.filter((e) => e.status === "success").length;
	const failedCount = log.filter((e) => e.status === "failed").length;
	const skippedCount = log.filter((e) => e.status === "skipped").length;
	const percent = progress ? Math.round((progress.current / progress.total) * 100) : 100;

	return (
		<div className="border-t bg-card">
			<div className="flex items-center gap-3 px-4 py-2">
				<Button
					variant="ghost"
					size="sm"
					className="gap-1 p-1 h-auto"
					onClick={() => setOpen(!open)}
				>
					{open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
					<span className="text-xs font-medium">{t("log")}</span>
				</Button>

				<div className="flex-1">
					<Progress value={percent} className="h-2" />
				</div>

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					{progress && (
						<span>
							{progress.current}/{progress.total}
						</span>
					)}
					{!isExecuting && log.length > 0 && (
						<>
							<span className="text-success flex items-center gap-0.5">
								<CheckCircle2 className="h-3 w-3" />
								{successCount}
							</span>
							{failedCount > 0 && (
								<span className="text-destructive flex items-center gap-0.5">
									<XCircle className="h-3 w-3" />
									{failedCount}
								</span>
							)}
							{skippedCount > 0 && (
								<span className="text-muted-foreground flex items-center gap-0.5">
									<SkipForward className="h-3 w-3" />
									{skippedCount}
								</span>
							)}
						</>
					)}
				</div>

				{!isExecuting && log.length > 0 && (
					<Button variant="ghost" size="sm" className="h-auto p-1" onClick={onClear}>
						<X className="h-3.5 w-3.5" />
					</Button>
				)}
			</div>

			{needsUserActivation && (
				<div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20">
					<Button
						variant="outline"
						size="sm"
						className="w-full gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
						onClick={onConfirmActivation}
					>
						<MousePointerClick className="h-4 w-4" />
						{t("activationRequired")}
					</Button>
				</div>
			)}

			{open && (
				<ScrollArea className="h-40 px-4 pb-2">
					<div className="space-y-0.5">
						{log.map((entry, i) => (
							<div
								key={`${entry.fileId}-${i}`}
								className="flex items-center gap-2 text-xs py-0.5 font-mono"
							>
								{entry.status === "success" && (
									<CheckCircle2 className="h-3 w-3 text-success shrink-0" />
								)}
								{entry.status === "failed" && (
									<XCircle className="h-3 w-3 text-destructive shrink-0" />
								)}
								{entry.status === "skipped" && (
									<SkipForward className="h-3 w-3 text-muted-foreground shrink-0" />
								)}
								<span className="text-muted-foreground truncate">{entry.original}</span>
								<span className="text-muted-foreground">→</span>
								<span className="truncate">{entry.newName}</span>
								{entry.reason && (
									<span className="text-destructive ml-auto shrink-0">({entry.reason})</span>
								)}
							</div>
						))}
					</div>
				</ScrollArea>
			)}
		</div>
	);
}
