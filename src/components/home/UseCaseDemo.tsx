"use client";

import {
	ArrowRight,
	Camera,
	ChevronRight,
	Code2,
	FileVideo,
	FolderArchive,
	Hash,
	LetterText,
	Music,
	Regex,
	Replace,
	Scissors,
	TextCursorInput,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { type ElementType, useState } from "react";

/* ─── Types ────────────────────────────────────────────────────── */

type RuleStep = {
	type: "findReplace" | "regex" | "sequence" | "caseStyle" | "insert" | "removeCleanup";
	config: string;
};

type FileExample = {
	before: string;
	after: string;
};

type UseCaseScenario = {
	id: string;
	icon: ElementType;
	color: string;
	bgColor: string;
	borderColor: string;
	rules: RuleStep[];
	files: FileExample[];
};

/* ─── Rule type metadata ───────────────────────────────────────── */

const RULE_META: Record<string, { icon: ElementType; color: string; bg: string }> = {
	findReplace: { icon: Replace, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
	regex: { icon: Regex, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
	sequence: { icon: Hash, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
	caseStyle: {
		icon: LetterText,
		color: "text-emerald-600 dark:text-emerald-400",
		bg: "bg-emerald-500/10",
	},
	insert: {
		icon: TextCursorInput,
		color: "text-orange-600 dark:text-orange-400",
		bg: "bg-orange-500/10",
	},
	removeCleanup: {
		icon: Scissors,
		color: "text-amber-600 dark:text-amber-400",
		bg: "bg-amber-500/10",
	},
};

/* ─── Scenario data ────────────────────────────────────────────── */

const SCENARIOS: UseCaseScenario[] = [
	{
		id: "photos",
		icon: Camera,
		color: "text-rose-500",
		bgColor: "bg-rose-500/10",
		borderColor: "border-rose-500",
		rules: [
			{ type: "findReplace", config: '"IMG_" → ""' },
			{ type: "insert", config: '"{date}_" at start' },
			{ type: "sequence", config: "001, 002, 003…" },
		],
		files: [
			{ before: "IMG_0421.jpg", after: "2024-03-15_001.jpg" },
			{ before: "IMG_0422.jpg", after: "2024-03-15_002.jpg" },
			{ before: "IMG_0423.jpg", after: "2024-03-15_003.jpg" },
			{ before: "IMG_0424.jpg", after: "2024-03-15_004.jpg" },
		],
	},
	{
		id: "videos",
		icon: FileVideo,
		color: "text-blue-500",
		bgColor: "bg-blue-500/10",
		borderColor: "border-blue-500",
		rules: [
			{ type: "regex", config: "(.+)\\.s(\\d+)e(\\d+).* → $1 S$2E$3" },
			{ type: "findReplace", config: '"." → " "' },
			{ type: "caseStyle", config: "Title Case" },
		],
		files: [
			{ before: "breaking.bad.s01e01.720p.mkv", after: "Breaking Bad S01E01.mkv" },
			{ before: "breaking.bad.s01e02.720p.mkv", after: "Breaking Bad S01E02.mkv" },
			{ before: "breaking.bad.s01e03.720p.mkv", after: "Breaking Bad S01E03.mkv" },
			{ before: "breaking.bad.s01e04.720p.mkv", after: "Breaking Bad S01E04.mkv" },
		],
	},
	{
		id: "music",
		icon: Music,
		color: "text-violet-500",
		bgColor: "bg-violet-500/10",
		borderColor: "border-violet-500",
		rules: [
			{ type: "caseStyle", config: "Title Case" },
			{ type: "insert", config: '"{artist} - " at start' },
			{ type: "sequence", config: "01. 02. 03.…" },
		],
		files: [
			{ before: "love story.mp3", after: "01. Taylor Swift - Love Story.mp3" },
			{ before: "shake it off.mp3", after: "02. Taylor Swift - Shake It Off.mp3" },
			{ before: "blank space.mp3", after: "03. Taylor Swift - Blank Space.mp3" },
			{ before: "bad blood.mp3", after: "04. Taylor Swift - Bad Blood.mp3" },
		],
	},
	{
		id: "code",
		icon: Code2,
		color: "text-emerald-500",
		bgColor: "bg-emerald-500/10",
		borderColor: "border-emerald-500",
		rules: [{ type: "caseStyle", config: "kebab-case" }],
		files: [
			{ before: "MyComponent.tsx", after: "my-component.tsx" },
			{ before: "UserProfile.tsx", after: "user-profile.tsx" },
			{ before: "NavBar.tsx", after: "nav-bar.tsx" },
			{ before: "DataTable.tsx", after: "data-table.tsx" },
		],
	},
	{
		id: "archives",
		icon: FolderArchive,
		color: "text-orange-500",
		bgColor: "bg-orange-500/10",
		borderColor: "border-orange-500",
		rules: [
			{ type: "removeCleanup", config: "(...) [...]" },
			{ type: "findReplace", config: '"final" → ""' },
			{ type: "insert", config: '"{date}_" at start' },
		],
		files: [
			{ before: "report (final v3).pdf", after: "2024-03-15_report.pdf" },
			{ before: "budget [2024].xlsx", after: "2024-03-15_budget.xlsx" },
			{ before: "meeting notes (draft).docx", after: "2024-03-15_meeting-notes.docx" },
			{ before: "project plan (v2).pptx", after: "2024-03-15_project-plan.pptx" },
		],
	},
];

/* ─── Component ────────────────────────────────────────────────── */

export function UseCaseDemo() {
	const t = useTranslations("home.useCases");
	const [active, setActive] = useState(SCENARIOS[0]);

	return (
		<section className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
			{/* decorative blobs */}
			<div className="pointer-events-none absolute -right-24 top-12 h-56 w-56 rounded-full bg-violet-500/6 blur-3xl" />
			<div className="pointer-events-none absolute -left-20 bottom-8 h-48 w-48 rounded-full bg-rose-500/6 blur-3xl" />

			{/* badge */}
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-500" />
				<span className="font-medium">{t("badge")}</span>
				<ChevronRight className="h-4 w-4" />
			</div>

			{/* heading */}
			<h2 className="mt-4 whitespace-pre-line text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
				{t("title")}
			</h2>
			<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
				{t("desc")}
			</p>

			{/* main layout */}
			<div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 sm:gap-8 lg:grid-cols-12">
				{/* tab list */}
				<div className="flex flex-col gap-2 rounded-xl bg-muted/30 p-3 ring-1 ring-border/40 sm:rounded-2xl sm:p-4 lg:col-span-4">
					{SCENARIOS.map((scenario) => {
						const Icon = scenario.icon;
						const isActive = active.id === scenario.id;

						return (
							<button
								type="button"
								key={scenario.id}
								onClick={() => setActive(scenario)}
								className={`group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all duration-200 sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3 ${
									isActive
										? `${scenario.bgColor} border-l-2 ${scenario.borderColor} ring-1 ring-border shadow-xs`
										: "border-l-2 border-transparent hover:bg-muted/50"
								}`}
							>
								<Icon
									className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${
										isActive ? scenario.color : "text-muted-foreground group-hover:text-foreground"
									}`}
									strokeWidth={1.5}
								/>
								<span
									className={`flex-1 text-xs font-medium sm:text-sm ${
										isActive
											? "text-foreground"
											: "text-muted-foreground group-hover:text-foreground"
									}`}
								>
									{t(`${scenario.id}.tab`)}
								</span>
								<ChevronRight
									className={`h-4 w-4 transition-all duration-200 ${
										isActive
											? `${scenario.color} opacity-100`
											: "translate-x-1 text-muted-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
									}`}
								/>
							</button>
						);
					})}
				</div>

				{/* right panel: rules + preview */}
				<div className="flex flex-col gap-4 sm:gap-5 lg:col-span-8">
					{/* scenario title & desc */}
					<div>
						<h3 className="text-lg font-semibold text-foreground sm:text-xl">
							{t(`${active.id}.title`)}
						</h3>
						<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:mt-2">
							{t(`${active.id}.desc`)}
						</p>
					</div>

					{/* rule chain */}
					<div className="rounded-xl border border-border/60 bg-muted/20 p-3 sm:rounded-2xl sm:p-4">
						<div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
							<span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
							{t("ruleChainLabel")}
						</div>
						<div className="flex flex-col gap-2">
							{active.rules.map((rule, i) => {
								const meta = RULE_META[rule.type];
								const RuleIcon = meta.icon;
								return (
									<div
										key={`${active.id}-rule-${i}`}
										className="flex items-center gap-2.5 rounded-lg bg-background/60 px-3 py-2 ring-1 ring-border/40 sm:gap-3 sm:px-4 sm:py-2.5"
									>
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground sm:h-6 sm:w-6 sm:text-xs">
											{i + 1}
										</span>
										<span
											className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium sm:text-xs ${meta.bg} ${meta.color}`}
										>
											<RuleIcon className="h-3 w-3" strokeWidth={2} />
											{t(`ruleType.${rule.type}`)}
										</span>
										<span className="truncate text-xs text-muted-foreground sm:text-sm">
											{rule.config}
										</span>
									</div>
								);
							})}
						</div>
					</div>

					{/* file preview table */}
					<div className="overflow-hidden rounded-xl border border-border/60 sm:rounded-2xl">
						{/* table header */}
						<div className="flex items-center gap-3 border-b border-border/60 bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground sm:text-sm">
							<span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
							{t("previewLabel")}
						</div>
						{/* header row */}
						<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border/40 bg-muted/10 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
							<span>{t("originalLabel")}</span>
							<span className="w-6" />
							<span>{t("newNameLabel")}</span>
						</div>
						{/* file rows */}
						{active.files.map((file, i) => (
							<div
								key={`${active.id}-file-${i}`}
								className={`grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2 sm:py-2.5 ${
									i < active.files.length - 1 ? "border-b border-border/30" : ""
								}`}
							>
								<span className="truncate font-mono text-xs text-muted-foreground sm:text-sm">
									{file.before}
								</span>
								<ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/50 sm:h-3.5 sm:w-3.5" />
								<span className="truncate font-mono text-xs font-medium text-foreground sm:text-sm">
									{file.after}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
