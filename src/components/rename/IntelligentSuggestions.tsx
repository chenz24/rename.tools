"use client";

import { Camera, Clapperboard, FileText, Lightbulb, Music, Sparkles, Video, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScenarioSuggestion } from "@/lib/intelligence/scenario";
import { analyzeScenario } from "@/lib/intelligence/scenario";
import { hasTvShowPattern } from "@/lib/media-scraper/parser";
import type { FileEntry, RuleConfig } from "@/lib/rename/types";

interface Props {
	files: FileEntry[];
	onApplySuggestion: (rules: RuleConfig[]) => void;
	onOpenScraper?: () => void;
}

const SCENARIO_ICONS: Record<string, React.ElementType> = {
	photo_collection: Camera,
	music_library: Music,
	video_series: Video,
	document_archive: FileText,
	mixed_files: Lightbulb,
};

const SCENARIO_COLORS: Record<string, string> = {
	photo_collection: "border-blue-200 bg-blue-50/50 dark:border-blue-500/30 dark:bg-blue-500/5",
	music_library: "border-purple-200 bg-purple-50/50 dark:border-purple-500/30 dark:bg-purple-500/5",
	video_series: "border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-500/5",
	document_archive:
		"border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/5",
};

const SCENARIO_ICON_COLORS: Record<string, string> = {
	photo_collection: "text-blue-600 dark:text-blue-400",
	music_library: "text-purple-600 dark:text-purple-400",
	video_series: "text-amber-600 dark:text-amber-400",
	document_archive: "text-emerald-600 dark:text-emerald-400",
};

const VIDEO_EXTS = new Set([".mp4", ".mov", ".avi", ".mkv", ".wmv", ".flv", ".webm", ".m4v"]);

export function IntelligentSuggestions({ files, onApplySuggestion, onOpenScraper }: Props) {
	const t = useTranslations("rename.intelligence");
	const [dismissed, setDismissed] = useState<Set<string>>(new Set());

	// Reset dismissed when files change significantly
	useEffect(() => {
		setDismissed(new Set());
	}, [files.length]);

	const suggestions = useMemo(() => {
		if (files.length < 2) return [];

		const fileInfos = files
			.filter((f) => f.selected)
			.map((f) => ({
				name: f.name,
				extension: f.extension,
				metadata: f.metadata,
			}));

		return analyzeScenario(fileInfos);
	}, [files]);

	// Detect if files match TV show pattern for scraper suggestion
	const showScraperSuggestion = useMemo(() => {
		if (!onOpenScraper) return false;
		const videoFiles = files.filter((f) => f.selected && VIDEO_EXTS.has(f.extension.toLowerCase()));
		if (videoFiles.length < 2) return false;
		const matchCount = videoFiles.filter((f) => hasTvShowPattern(f.name)).length;
		return matchCount / videoFiles.length >= 0.5;
	}, [files, onOpenScraper]);

	const visibleSuggestions = useMemo(
		() => suggestions.filter((s) => s.confidence >= 0.6 && !dismissed.has(s.id)),
		[suggestions, dismissed],
	);

	const handleDismiss = useCallback((id: string) => {
		setDismissed((prev) => new Set([...prev, id]));
	}, []);

	const hasScraperCard = showScraperSuggestion && !dismissed.has("scraper");

	if (visibleSuggestions.length === 0 && !hasScraperCard) return null;

	return (
		<div className="space-y-2 px-3 py-2 border-b bg-muted/10">
			{hasScraperCard && (
				<div className="flex items-center gap-2.5 rounded-lg border px-3 py-2 border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-500/5">
					<div className="flex items-center gap-2 flex-1 min-w-0">
						<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background/80 text-amber-600 dark:text-amber-400">
							<Clapperboard className="h-3.5 w-3.5" />
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-1.5">
								<Sparkles className="h-3 w-3 text-primary shrink-0" />
								<span className="text-xs font-medium truncate">{t("scenarios.video_scrape")}</span>
								<Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">
									TMDb
								</Badge>
							</div>
							<p className="text-[11px] text-muted-foreground truncate mt-0.5">
								{t("descriptions.video_scrape")}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-1 shrink-0">
						<Button
							size="sm"
							variant="default"
							className="h-6 px-2.5 text-[11px] gap-1"
							onClick={onOpenScraper}
						>
							{t("startMatch")}
						</Button>
						<button
							type="button"
							className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/60 hover:text-muted-foreground transition-colors"
							onClick={() => handleDismiss("scraper")}
						>
							<X className="h-3 w-3" />
						</button>
					</div>
				</div>
			)}
			{visibleSuggestions.map((suggestion) => (
				<SuggestionCard
					key={suggestion.id}
					suggestion={suggestion}
					onApply={() => onApplySuggestion(suggestion.suggestedRules)}
					onDismiss={() => handleDismiss(suggestion.id)}
				/>
			))}
		</div>
	);
}

function SuggestionCard({
	suggestion,
	onApply,
	onDismiss,
}: {
	suggestion: ScenarioSuggestion;
	onApply: () => void;
	onDismiss: () => void;
}) {
	const t = useTranslations("rename.intelligence");
	const Icon = SCENARIO_ICONS[suggestion.scenario] || Lightbulb;
	const colorClass = SCENARIO_COLORS[suggestion.scenario] || "";
	const iconColorClass = SCENARIO_ICON_COLORS[suggestion.scenario] || "text-primary";

	return (
		<div className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${colorClass}`}>
			<div className="flex items-center gap-2 flex-1 min-w-0">
				<div
					className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background/80 ${iconColorClass}`}
				>
					<Icon className="h-3.5 w-3.5" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-1.5">
						<Sparkles className="h-3 w-3 text-primary shrink-0" />
						<span className="text-xs font-medium truncate">
							{t(`scenarios.${suggestion.scenario}`)}
						</span>
						{suggestion.hasMetadata && (
							<Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">
								{t("metadataEnhanced")}
							</Badge>
						)}
					</div>
					<p className="text-[11px] text-muted-foreground truncate mt-0.5">
						{t(`descriptions.${suggestion.scenario}`)}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-1 shrink-0">
				<Button
					size="sm"
					variant="default"
					className="h-6 px-2.5 text-[11px] gap-1"
					onClick={onApply}
				>
					{t("apply")}
				</Button>
				<button
					type="button"
					className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/60 hover:text-muted-foreground transition-colors"
					onClick={onDismiss}
				>
					<X className="h-3 w-3" />
				</button>
			</div>
		</div>
	);
}
