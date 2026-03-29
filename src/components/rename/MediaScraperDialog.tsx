"use client";

import {
	AlertCircle,
	Check,
	ChevronRight,
	Clapperboard,
	Edit3,
	Loader2,
	RefreshCw,
	Search,
	X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { UseMediaScraperReturn } from "@/hooks/useMediaScraper";
import { formatScrapedName } from "@/lib/media-scraper/matcher";
import { DEFAULT_NAMING_TEMPLATES } from "@/lib/media-scraper/types";
import type { FileEntry, RuleConfig } from "@/lib/rename/types";

type Step = "groups" | "matching" | "results";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	files: FileEntry[];
	scraper: UseMediaScraperReturn;
	apiKey: string;
	onApplyResults: (rules: RuleConfig[]) => void;
}

export function MediaScraperDialog({
	open,
	files,
	scraper,
	apiKey,
	onOpenChange,
	onApplyResults,
}: Props) {
	const t = useTranslations("rename.scraper");
	const [step, setStep] = useState<Step>("groups");
	const [editingGroup, setEditingGroup] = useState<string | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [customTemplate, setCustomTemplate] = useState("");
	const [templateMode, setTemplateMode] = useState<"preset" | "custom">("preset");

	// Parse files when dialog opens
	useEffect(() => {
		if (open) {
			scraper.startParsing(files);
			setStep("groups");
		} else {
			scraper.reset();
			setEditingGroup(null);
		}
	}, [open, files, scraper.startParsing, scraper.reset]);

	const handleSearch = useCallback(async () => {
		setStep("matching");
		try {
			const updatedGroups = await scraper.startSearching(apiKey);
			if (scraper.error) {
				return; // Stay on matching step to show error
			}
			await scraper.fetchMatches(files, apiKey, updatedGroups);
			if (!scraper.error) {
				setStep("results");
			}
		} catch {
			// Error is handled by scraper.error
		}
	}, [apiKey, files, scraper]);

	const handleRetry = useCallback(() => {
		setStep("groups");
	}, []);

	const handleApply = useCallback(() => {
		const results = scraper.getFormattedResults();
		if (results.length === 0) return;

		// Generate find/replace rules for each matched file
		const rules: RuleConfig[] = [];

		for (const result of results) {
			const file = files.find((f) => f.id === result.fileId);
			if (!file) continue;

			// Create a find-replace rule: replace the full original baseName with the new name
			const lastDot = result.newName.lastIndexOf(".");
			const newBase = lastDot > 0 ? result.newName.slice(0, lastDot) : result.newName;

			rules.push({
				type: "findReplace",
				config: {
					find: file.baseName,
					replace: newBase,
					caseSensitive: true,
					matchAll: false,
					usePosition: false,
					fromEnd: false,
					positionStart: 0,
					positionCount: 1,
				},
			});
		}

		if (rules.length > 0) {
			onApplyResults(rules);
		}
		onOpenChange(false);
	}, [scraper, files, onApplyResults, onOpenChange]);

	const startEditGroup = useCallback(
		(groupId: string) => {
			const group = scraper.groups.find((g) => g.id === groupId);
			if (group) {
				setEditingGroup(groupId);
				setEditTitle(group.title);
			}
		},
		[scraper.groups],
	);

	const saveEditGroup = useCallback(() => {
		if (editingGroup && editTitle.trim()) {
			scraper.updateGroupTitle(editingGroup, editTitle.trim());
		}
		setEditingGroup(null);
	}, [editingGroup, editTitle, scraper.updateGroupTitle]);

	const selectedCount = useMemo(
		() => scraper.matchResults.filter((r) => r.selected).length,
		[scraper.matchResults],
	);

	const totalMatched = useMemo(
		() => scraper.matchResults.filter((r) => r.match).length,
		[scraper.matchResults],
	);

	const activeTemplate = templateMode === "custom" ? customTemplate : scraper.selectedTemplate;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Clapperboard className="h-4 w-4" />
						{t("title")}
					</DialogTitle>
					<DialogDescription>{t("description")}</DialogDescription>
				</DialogHeader>

				{/* Step Indicator */}
				<div className="flex items-center gap-2 text-xs text-muted-foreground pb-2 border-b">
					<StepIndicator
						label={t("steps.parse")}
						active={step === "groups"}
						done={step !== "groups"}
					/>
					<ChevronRight className="h-3 w-3" />
					<StepIndicator
						label={t("steps.match")}
						active={step === "matching"}
						done={step === "results"}
					/>
					<ChevronRight className="h-3 w-3" />
					<StepIndicator label={t("steps.confirm")} active={step === "results"} done={false} />
				</div>

				{/* Content */}
				<ScrollArea className="flex-1 min-h-0 max-h-[50vh]">
					{step === "groups" && (
						<GroupsStep
							groups={scraper.groups}
							editingGroup={editingGroup}
							editTitle={editTitle}
							onEditTitle={setEditTitle}
							onStartEdit={startEditGroup}
							onSaveEdit={saveEditGroup}
							onCancelEdit={() => setEditingGroup(null)}
							onSelectTmdbResult={scraper.selectTmdbResult}
							t={t}
						/>
					)}

					{step === "matching" && (
						<div className="flex flex-col items-center justify-center py-12 gap-3">
							{scraper.error ? (
								<>
									<AlertCircle className="h-8 w-8 text-destructive" />
									<p className="text-sm text-destructive">
										{t("error", { message: scraper.error })}
									</p>
									<Button variant="outline" size="sm" onClick={handleRetry}>
										<RefreshCw className="mr-2 h-3.5 w-3.5" />
										{t("retry")}
									</Button>
								</>
							) : (
								<>
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
									<p className="text-sm text-muted-foreground">
										{scraper.progress.total > 0
											? t("searchingProgress", {
													current: scraper.progress.current,
													total: scraper.progress.total,
												})
											: t("searching")}
									</p>
								</>
							)}
						</div>
					)}

					{step === "results" && (
						<ResultsStep
							matchResults={scraper.matchResults}
							onToggle={scraper.toggleMatch}
							onToggleAll={scraper.toggleAllMatches}
							totalMatched={totalMatched}
							template={activeTemplate}
							t={t}
						/>
					)}
				</ScrollArea>

				{/* Template Selector (shown on results step) */}
				{step === "results" && (
					<div className="border-t pt-3 space-y-2">
						<Label className="text-xs font-medium">{t("outputFormat")}</Label>
						<div className="flex items-center gap-2">
							<Select
								value={templateMode === "preset" ? scraper.selectedTemplate : "__custom__"}
								onValueChange={(v) => {
									if (v === "__custom__") {
										setTemplateMode("custom");
									} else {
										setTemplateMode("preset");
										scraper.setSelectedTemplate(v);
									}
								}}
							>
								<SelectTrigger className="h-8 text-xs flex-1">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{DEFAULT_NAMING_TEMPLATES.map((tpl) => (
										<SelectItem key={tpl.id} value={tpl.template}>
											<span className="text-xs">{tpl.example}</span>
										</SelectItem>
									))}
									<SelectItem value="__custom__">
										<span className="text-xs">{t("customTemplate")}</span>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{templateMode === "custom" && (
							<Input
								value={customTemplate}
								onChange={(e) => setCustomTemplate(e.target.value)}
								placeholder="{show} - S{season}E{episode} - {episodeTitle}"
								className="h-8 text-xs"
							/>
						)}
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("cancel")}
					</Button>

					{step === "groups" && (
						<Button onClick={handleSearch} disabled={scraper.groups.length === 0}>
							<Search className="mr-2 h-3.5 w-3.5" />
							{t("startSearch")}
						</Button>
					)}

					{step === "results" && (
						<Button onClick={handleApply} disabled={selectedCount === 0}>
							<Check className="mr-2 h-3.5 w-3.5" />
							{t("apply")} ({selectedCount})
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ── Sub-components ──

function StepIndicator({ label, active, done }: { label: string; active: boolean; done: boolean }) {
	return (
		<span
			className={`inline-flex items-center gap-1 ${
				active ? "text-primary font-medium" : done ? "text-foreground" : "text-muted-foreground"
			}`}
		>
			{done && <Check className="h-3 w-3 text-green-500" />}
			{active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
			{label}
		</span>
	);
}

function GroupsStep({
	groups,
	editingGroup,
	editTitle,
	onEditTitle,
	onStartEdit,
	onSaveEdit,
	onCancelEdit,
	onSelectTmdbResult,
	t,
}: {
	groups: import("@/lib/media-scraper").ParsedGroup[];
	editingGroup: string | null;
	editTitle: string;
	onEditTitle: (v: string) => void;
	onStartEdit: (id: string) => void;
	onSaveEdit: () => void;
	onCancelEdit: () => void;
	onSelectTmdbResult: (groupId: string, tmdbId: number) => void;
	t: ReturnType<typeof useTranslations>;
}) {
	if (groups.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
				<Clapperboard className="h-8 w-8" />
				<p className="text-sm">{t("noGroups")}</p>
			</div>
		);
	}

	return (
		<div className="space-y-2 p-1">
			<p className="text-xs text-muted-foreground mb-3">{t("groupsHint")}</p>
			{groups.map((group) => (
				<div
					key={group.id}
					className="flex items-center gap-3 rounded-lg border px-3 py-2.5 bg-muted/20"
				>
					<Search className="h-4 w-4 text-muted-foreground shrink-0" />
					<div className="flex-1 min-w-0">
						{editingGroup === group.id ? (
							<div className="flex items-center gap-2">
								<Input
									value={editTitle}
									onChange={(e) => onEditTitle(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") onSaveEdit();
										if (e.key === "Escape") onCancelEdit();
									}}
									className="h-7 text-xs"
									autoFocus
								/>
								<Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onSaveEdit}>
									<Check className="h-3.5 w-3.5" />
								</Button>
								<Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onCancelEdit}>
									<X className="h-3.5 w-3.5" />
								</Button>
							</div>
						) : (
							<>
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium truncate">{group.title}</span>
									<Button
										size="sm"
										variant="ghost"
										className="h-5 w-5 p-0"
										onClick={() => onStartEdit(group.id)}
									>
										<Edit3 className="h-3 w-3" />
									</Button>
								</div>
								<p className="text-[11px] text-muted-foreground">
									{group.fileIds.length} {t("files")}
									{group.season != null && ` · ${t("season")} ${group.season}`}
								</p>
								{group.tmdbResults.length > 0 && (
									<Select
										value={group.selectedTmdbId?.toString() || ""}
										onValueChange={(v) => onSelectTmdbResult(group.id, Number(v))}
									>
										<SelectTrigger className="h-6 text-[11px] mt-1">
											<SelectValue placeholder={t("selectShow")} />
										</SelectTrigger>
										<SelectContent>
											{group.tmdbResults.map((r) => (
												<SelectItem key={r.id} value={r.id.toString()}>
													<span className="text-xs">
														{r.name || r.title}
														{r.first_air_date && ` (${r.first_air_date.slice(0, 4)})`}
													</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</>
						)}
					</div>
				</div>
			))}
		</div>
	);
}

type FilterType = "all" | "matched" | "unmatched";

function ResultsStep({
	matchResults,
	onToggle,
	onToggleAll,
	totalMatched,
	template,
	t,
}: {
	matchResults: import("@/lib/media-scraper").FileMatchResult[];
	onToggle: (fileId: string) => void;
	onToggleAll: (selected: boolean) => void;
	totalMatched: number;
	template: string;
	t: ReturnType<typeof useTranslations>;
}) {
	const [filter, setFilter] = useState<FilterType>("all");

	const filteredResults = useMemo(() => {
		if (filter === "matched") return matchResults.filter((r) => r.match);
		if (filter === "unmatched") return matchResults.filter((r) => !r.match);
		return matchResults;
	}, [matchResults, filter]);

	const getConfidenceBadge = (confidence: string) => {
		const variants: Record<
			string,
			{ variant: "default" | "secondary" | "outline" | "destructive"; label: string }
		> = {
			high: { variant: "default", label: t("confidence.high") },
			medium: { variant: "secondary", label: t("confidence.medium") },
			low: { variant: "outline", label: t("confidence.low") },
			none: { variant: "destructive", label: t("confidence.none") },
		};
		return variants[confidence] || variants.none;
	};

	return (
		<div className="space-y-1 p-1">
			<div className="flex items-center justify-between mb-3">
				<p className="text-xs text-muted-foreground">
					{t("matchedCount", { matched: totalMatched, total: matchResults.length })}
				</p>
				<div className="flex items-center gap-2">
					<Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
						<SelectTrigger className="h-6 text-[11px] w-24">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{t("filter.all")}</SelectItem>
							<SelectItem value="matched">{t("filter.matched")}</SelectItem>
							<SelectItem value="unmatched">{t("filter.unmatched")}</SelectItem>
						</SelectContent>
					</Select>
					<Button
						size="sm"
						variant="outline"
						className="h-6 text-[11px] px-2"
						onClick={() => onToggleAll(true)}
					>
						{t("selectAll")}
					</Button>
					<Button
						size="sm"
						variant="outline"
						className="h-6 text-[11px] px-2"
						onClick={() => onToggleAll(false)}
					>
						{t("deselectAll")}
					</Button>
				</div>
			</div>

			{filteredResults.map((result) => {
				const newName = result.match ? formatScrapedName(result.match, template) : null;
				const badge = getConfidenceBadge(result.confidence);

				return (
					<div
						key={result.fileId}
						className={`rounded-lg border px-3 py-2 transition-colors ${
							result.selected ? "bg-primary/5 border-primary/20" : "bg-muted/10"
						}`}
					>
						<div className="flex items-start gap-2">
							<Checkbox
								checked={result.selected}
								onCheckedChange={() => onToggle(result.fileId)}
								disabled={!result.match}
								className="mt-0.5"
							/>
							<div className="flex-1 min-w-0">
								<p className="text-xs text-muted-foreground truncate">{result.fileName}</p>
								{newName ? (
									<p className="text-xs font-medium truncate mt-0.5">
										→ {newName}
										{result.fileName.includes(".")
											? result.fileName.slice(result.fileName.lastIndexOf("."))
											: ""}
									</p>
								) : (
									<p className="text-xs text-muted-foreground mt-0.5">{t("noMatch")}</p>
								)}
							</div>
							<Badge variant={badge.variant} className="text-[10px] h-5 shrink-0">
								{badge.label}
							</Badge>
						</div>
					</div>
				);
			})}
		</div>
	);
}
