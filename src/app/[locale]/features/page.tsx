"use client";

import {
	ArrowLeftRight,
	ArrowRight,
	BookTemplate,
	Brain,
	Check,
	ChevronRight,
	Code2,
	Download,
	Eraser,
	Eye,
	FileText,
	Filter,
	Github,
	Globe,
	Hash,
	ListOrdered,
	Lock,
	MonitorOff,
	MousePointerClick,
	Regex,
	Shield,
	SortAsc,
	Sparkles,
	Terminal,
	TextCursorInput,
	Tv,
	Type,
	Undo2,
	Upload,
	WifiOff,
	Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";

/* ─── Category nav ─────────────────────────────────────────────── */
const CATEGORIES = [
	{ id: "rules", color: "bg-rose-500" },
	{ id: "preview", color: "bg-blue-500" },
	{ id: "automation", color: "bg-violet-500" },
	{ id: "privacy", color: "bg-emerald-500" },
] as const;

/* ─── Rule definitions ─────────────────────────────────────────── */
const RULES = [
	{
		id: "findReplace",
		icon: ArrowLeftRight,
		color: "text-blue-500",
		bgColor: "bg-blue-500/10",
		borderColor: "border-blue-500/30",
	},
	{
		id: "insert",
		icon: TextCursorInput,
		color: "text-emerald-500",
		bgColor: "bg-emerald-500/10",
		borderColor: "border-emerald-500/30",
	},
	{
		id: "sequence",
		icon: Hash,
		color: "text-amber-500",
		bgColor: "bg-amber-500/10",
		borderColor: "border-amber-500/30",
	},
	{
		id: "caseStyle",
		icon: Type,
		color: "text-violet-500",
		bgColor: "bg-violet-500/10",
		borderColor: "border-violet-500/30",
	},
	{
		id: "regex",
		icon: Regex,
		color: "text-rose-500",
		bgColor: "bg-rose-500/10",
		borderColor: "border-rose-500/30",
	},
	{
		id: "customJs",
		icon: Code2,
		color: "text-cyan-500",
		bgColor: "bg-cyan-500/10",
		borderColor: "border-cyan-500/30",
	},
	{
		id: "removeCleanup",
		icon: Eraser,
		color: "text-orange-500",
		bgColor: "bg-orange-500/10",
		borderColor: "border-orange-500/30",
	},
] as const;

/* ─── Preview features ─────────────────────────────────────────── */
const PREVIEW_FEATURES = [
	{ id: "livePreview", icon: Eye, color: "text-blue-500" },
	{ id: "conflictDetection", icon: Shield, color: "text-rose-500" },
	{ id: "filterViews", icon: Filter, color: "text-emerald-500" },
	{ id: "extensionControl", icon: FileText, color: "text-violet-500" },
	{ id: "undoRedo", icon: Undo2, color: "text-amber-500" },
	{ id: "oneClickExecute", icon: MousePointerClick, color: "text-cyan-500" },
	{ id: "advancedFilter", icon: ListOrdered, color: "text-orange-500" },
	{ id: "sorting", icon: SortAsc, color: "text-pink-500" },
] as const;

/* ─── Automation features ──────────────────────────────────────── */
const AUTOMATION_FEATURES = [
	{ id: "templateLibrary", icon: BookTemplate, color: "text-violet-500" },
	{ id: "userPresets", icon: Sparkles, color: "text-pink-500" },
	{ id: "presetManagement", icon: Download, color: "text-blue-500" },
	{ id: "intelligentSuggestions", icon: Brain, color: "text-amber-500" },
	{ id: "mediaScraper", icon: Tv, color: "text-cyan-500" },
	{ id: "metadataExtraction", icon: Zap, color: "text-emerald-500" },
	{ id: "scriptExport", icon: Terminal, color: "text-orange-500" },
] as const;

/* ─── Privacy features ─────────────────────────────────────────── */
const PRIVACY_FEATURES = [
	{ id: "localProcessing", icon: Upload, color: "text-emerald-500" },
	{ id: "noUpload", icon: MonitorOff, color: "text-blue-500" },
	{ id: "noRetention", icon: Lock, color: "text-violet-500" },
	{ id: "offlineReady", icon: WifiOff, color: "text-orange-500" },
	{ id: "openSource", icon: Github, color: "text-cyan-500" },
	{ id: "freeForever", icon: Globe, color: "text-rose-500" },
] as const;

/* ═══════════════════════════════════════════════════════════════════ */
export default function FeaturesPage() {
	const t = useTranslations("features");
	const [activeCategory, setActiveCategory] = useState<string>("rules");
	const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

	const scrollToSection = (categoryId: string) => {
		setActiveCategory(categoryId);
		sectionRefs.current[categoryId]?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		<div className="min-h-screen bg-background text-foreground">
			{/* ─── Hero ──────────────────────────────────────────── */}
			<section className="relative overflow-hidden">
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
				<div className="mx-auto max-w-5xl px-6 pt-24 pb-16">
					<h1 className="whitespace-pre-line text-4xl font-bold leading-[1.15] tracking-tight text-foreground md:text-5xl">
						{t("heroTitle")}
					</h1>
					<p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
						{t("heroDesc")}
					</p>
					<div className="mt-8">
						<Link
							href="/app"
							className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
						>
							{t("cta")}
							<span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20">
								<ArrowRight className="h-3 w-3 text-background" />
							</span>
						</Link>
					</div>
				</div>
			</section>

			{/* ─── Sticky Tabs ───────────────────────────────────── */}
			<div className="sticky top-14 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto max-w-5xl px-6">
					<nav className="flex gap-1 overflow-x-auto py-3">
						{CATEGORIES.map((cat) => (
							<button
								type="button"
								key={cat.id}
								onClick={() => scrollToSection(cat.id)}
								className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
									activeCategory === cat.id
										? "bg-muted text-foreground"
										: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
								}`}
							>
								<span className={`h-2 w-2 rounded-full ${cat.color}`} />
								{t(`category.${cat.id}`)}
							</button>
						))}
					</nav>
				</div>
			</div>

			{/* ══════════════════════════════════════════════════════ */}
			{/* SECTION 1: Rule System                                */}
			{/* ══════════════════════════════════════════════════════ */}
			<section
				ref={(el) => {
					sectionRefs.current.rules = el;
				}}
				className="mx-auto max-w-5xl scroll-mt-32 px-6 py-24"
			>
				{/* Section header */}
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
					<span className="font-medium">{t("category.rules")}</span>
					<ChevronRight className="h-4 w-4" />
				</div>
				<h2 className="mt-4 whitespace-pre-line text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
					{t("rules.title")}
				</h2>
				<p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
					{t("rules.desc")}
				</p>

				{/* Rule cards */}
				<div className="mt-14 space-y-6">
					{RULES.map((rule) => {
						const Icon = rule.icon;
						// Count capabilities dynamically
						const capKeys =
							rule.id === "sequence"
								? ["c1", "c2", "c3", "c4", "c5", "c6", "c7"]
								: rule.id === "customJs"
									? ["c1", "c2", "c3", "c4", "c5", "c6"]
									: ["c1", "c2", "c3", "c4", "c5"];

						return (
							<div
								key={rule.id}
								className={`rounded-2xl border ${rule.borderColor} bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:p-8`}
							>
								{/* Header */}
								<div className="flex items-start gap-4">
									<div className={`rounded-xl ${rule.bgColor} p-3`}>
										<Icon className={`h-6 w-6 ${rule.color}`} strokeWidth={1.5} />
									</div>
									<div className="flex-1">
										<h3 className="text-xl font-semibold text-foreground">
											{t(`${rule.id}.title`)}
										</h3>
										<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
											{t(`${rule.id}.desc`)}
										</p>
									</div>
								</div>

								{/* Body: capabilities + example side by side on desktop */}
								<div className="mt-6 grid gap-6 md:grid-cols-2">
									{/* Capabilities */}
									<div>
										<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
											{t("capabilities")}
										</p>
										<ul className="mt-3 space-y-2">
											{capKeys.map((ck) => (
												<li key={ck} className="flex items-start gap-2 text-sm text-foreground">
													<Check className={`mt-0.5 h-4 w-4 shrink-0 ${rule.color}`} />
													{t(`${rule.id}.capabilities.${ck}`)}
												</li>
											))}
										</ul>
									</div>

									{/* Example + best for */}
									<div className="flex flex-col gap-4">
										{/* Before/After */}
										<div className="rounded-lg bg-muted/50 p-4">
											<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
												{t("example")}
											</p>
											<div className="mt-3 flex flex-col gap-2 font-mono text-xs">
												<div className="flex items-start gap-2">
													<span className="shrink-0 text-muted-foreground">{t("before")}:</span>
													<span className="break-all text-rose-500">{t(`${rule.id}.before`)}</span>
												</div>
												<div className="flex items-start gap-2">
													<span className="shrink-0 text-muted-foreground">{t("after")}:</span>
													<span className="break-all text-emerald-500">
														{t(`${rule.id}.after`)}
													</span>
												</div>
											</div>
										</div>

										{/* Best for */}
										<div className="rounded-lg bg-muted/30 px-4 py-3">
											<span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
												{t("bestFor")}
											</span>
											<p className="mt-1 text-sm text-foreground">{t(`${rule.id}.bestFor`)}</p>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* ══════════════════════════════════════════════════════ */}
			{/* SECTION 2: Preview & Workflow                         */}
			{/* ══════════════════════════════════════════════════════ */}
			<section
				ref={(el) => {
					sectionRefs.current.preview = el;
				}}
				className="mx-auto max-w-5xl scroll-mt-32 px-6 py-24"
			>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
					<span className="font-medium">{t("category.preview")}</span>
					<ChevronRight className="h-4 w-4" />
				</div>
				<h2 className="mt-4 whitespace-pre-line text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
					{t("preview.title")}
				</h2>
				<p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
					{t("preview.desc")}
				</p>

				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{PREVIEW_FEATURES.map((feat) => {
						const Icon = feat.icon;
						return (
							<div
								key={feat.id}
								className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
							>
								<Icon className={`h-7 w-7 ${feat.color}`} strokeWidth={1.5} />
								<h3 className="mt-4 text-base font-semibold text-foreground">
									{t(`previewFeatures.${feat.id}.title`)}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{t(`previewFeatures.${feat.id}.desc`)}
								</p>
							</div>
						);
					})}
				</div>
			</section>

			{/* ══════════════════════════════════════════════════════ */}
			{/* SECTION 3: Templates & Automation                     */}
			{/* ══════════════════════════════════════════════════════ */}
			<section
				ref={(el) => {
					sectionRefs.current.automation = el;
				}}
				className="mx-auto max-w-5xl scroll-mt-32 px-6 py-24"
			>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-500" />
					<span className="font-medium">{t("category.automation")}</span>
					<ChevronRight className="h-4 w-4" />
				</div>
				<h2 className="mt-4 whitespace-pre-line text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
					{t("automation.title")}
				</h2>
				<p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
					{t("automation.desc")}
				</p>

				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{AUTOMATION_FEATURES.map((feat) => {
						const Icon = feat.icon;
						return (
							<div
								key={feat.id}
								className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
							>
								<Icon className={`h-7 w-7 ${feat.color}`} strokeWidth={1.5} />
								<h3 className="mt-4 text-base font-semibold text-foreground">
									{t(`automationFeatures.${feat.id}.title`)}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{t(`automationFeatures.${feat.id}.desc`)}
								</p>
							</div>
						);
					})}
				</div>
			</section>

			{/* ══════════════════════════════════════════════════════ */}
			{/* SECTION 4: Privacy & Security                         */}
			{/* ══════════════════════════════════════════════════════ */}
			<section
				ref={(el) => {
					sectionRefs.current.privacy = el;
				}}
				className="mx-auto max-w-5xl scroll-mt-32 px-6 py-24"
			>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
					<span className="font-medium">{t("category.privacy")}</span>
					<ChevronRight className="h-4 w-4" />
				</div>
				<h2 className="mt-4 whitespace-pre-line text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
					{t("privacy.title")}
				</h2>
				<p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
					{t("privacy.desc")}
				</p>

				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{PRIVACY_FEATURES.map((feat) => {
						const Icon = feat.icon;
						return (
							<div
								key={feat.id}
								className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
							>
								<Icon className={`h-7 w-7 ${feat.color}`} strokeWidth={1.5} />
								<h3 className="mt-4 text-base font-semibold text-foreground">
									{t(`privacyFeatures.${feat.id}.title`)}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{t(`privacyFeatures.${feat.id}.desc`)}
								</p>
							</div>
						);
					})}
				</div>
			</section>

			{/* ══════════════════════════════════════════════════════ */}
			{/* CTA Section                                           */}
			{/* ══════════════════════════════════════════════════════ */}
			<section className="mx-auto max-w-5xl px-6 py-24">
				<div className="rounded-3xl bg-muted/50 p-8 md:p-12">
					<h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
						{t("ctaTitle")}
					</h2>
					<p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
						{t("ctaDesc")}
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-4">
						<Link
							href="/app"
							className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
						>
							{t("ctaButton")}
							<span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20">
								<ArrowRight className="h-3 w-3 text-background" />
							</span>
						</Link>
					</div>
					<p className="mt-4 text-sm text-muted-foreground">{t("ctaSubtext")}</p>
				</div>
			</section>

			<div className="h-16" />
		</div>
	);
}
