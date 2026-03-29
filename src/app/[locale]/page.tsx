import {
	ArrowRight,
	ChevronRight,
	Code2,
	Eye,
	FileSearch,
	FilesIcon,
	Filter,
	Github,
	Globe,
	Hash,
	LetterText,
	Lock,
	MonitorOff,
	MousePointerClick,
	Regex,
	Replace,
	ScanEye,
	Shield,
	Sparkles,
	Star,
	Terminal,
	Trash2,
	Undo2,
	Upload,
	Zap,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { FAQPage, WebApplication, WithContext } from "schema-dts";
import { UseCaseDemo } from "@/components/home/UseCaseDemo";
import { JsonLd } from "@/components/JsonLd";
import { RulesShowcase } from "@/components/RulesShowcase";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "@/i18n/navigation";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	return <LandingContent locale={locale} />;
}

/* ─── Icon item used in metric/feature grids ──────────────────────── */
function IconItem({
	icon: Icon,
	color,
	title,
	desc,
}: {
	icon: React.ElementType;
	color: string;
	title: string;
	desc: string;
}) {
	return (
		<div className="flex flex-col gap-3">
			<Icon className={`h-8 w-8 ${color}`} strokeWidth={1.5} />
			<h3 className="text-base font-semibold text-foreground">{title}</h3>
			<p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════════ */
function LandingContent({ locale }: { locale: string }) {
	const t = useTranslations("home");

	const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

	const webAppSchema: WithContext<WebApplication> = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: "Rename.Tools",
		description: t("heroDescription"),
		url: `${BASE_URL}/${locale}`,
		applicationCategory: "UtilitiesApplication",
		operatingSystem: "Web Browser",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		featureList: [
			"Batch file renaming",
			"Regular expression support",
			"Sequential numbering",
			"Case conversion",
			"Live preview",
			"Local processing",
			"No file upload required",
		],
	};

	const faqSchema: WithContext<FAQPage> = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: [1, 2, 3, 4, 5, 6].map((i) => ({
			"@type": "Question",
			name: t(`faq${i}Q`),
			acceptedAnswer: {
				"@type": "Answer",
				text: t(`faq${i}A`),
			},
		})),
	};

	return (
		<>
			<JsonLd data={webAppSchema} />
			<JsonLd data={faqSchema} />
			<div className="min-h-screen bg-background text-foreground">
				{/* ─── Hero ──────────────────────────────────────────── */}
				<section className="relative overflow-hidden">
					{/* subtle gradient glow on edges like userjot */}
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />

					<div className="mx-auto max-w-5xl px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-14 md:pt-24 md:pb-16">
						{/* logo */}
						<div className="mb-6 flex items-center gap-2">
							<Image
								src="/logo.svg"
								alt="Rename.Tools Logo"
								width={40}
								height={40}
								className="h-10 w-10"
							/>
							<span className="text-lg font-semibold text-foreground">Rename.Tools</span>
						</div>

						{/* headline */}
						<h1 className="whitespace-pre-line text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.5rem]">
							{t("heroTitle")}
						</h1>

						{/* subtitle - key features */}
						<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-base sm:mt-6 sm:text-lg">
							<span className="font-semibold text-foreground">{t("heroFeature1")}</span>
							<span className="text-muted-foreground">•</span>
							<span className="font-semibold text-foreground">{t("heroFeature2")}</span>
							<span className="text-muted-foreground">•</span>
							<span className="font-semibold text-foreground">{t("heroFeature3")}</span>
						</div>

						{/* description */}
						<p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
							{t("heroDescription")}
						</p>

						{/* CTA row */}
						<div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
							<Link
								href="/app"
								className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:w-auto"
							>
								{t("cta")}
								<span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20">
									<ArrowRight className="h-3 w-3 text-background" />
								</span>
							</Link>
							<a
								href="https://github.com/chenz24/rename.tools"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
							>
								<Github className="h-4 w-4" />
								{t("viewOnGithub")}
							</a>
						</div>

						{/* Social proof */}
						<div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
								<span className="font-medium text-foreground">{t("githubStars")}</span>
								<span>{t("onGithub")}</span>
							</div>
							<span className="text-muted-foreground">•</span>
							<p className="text-sm text-muted-foreground">{t("ctaSubtext")}</p>
						</div>
					</div>
				</section>

				{/* ─── Metrics Grid (Trust) ────────────────────────── */}
				<section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20">
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
						<IconItem
							icon={Shield}
							color="text-rose-500"
							title={t("trustLocal")}
							desc={t("trustLocalDesc")}
						/>
						<IconItem
							icon={Lock}
							color="text-blue-500"
							title={t("trustPrivacy")}
							desc={t("trustPrivacyDesc")}
						/>
						<IconItem
							icon={Zap}
							color="text-violet-500"
							title={t("trustSpeed")}
							desc={t("trustSpeedDesc")}
						/>
						<IconItem
							icon={Globe}
							color="text-emerald-500"
							title={t("trustOpen")}
							desc={t("trustOpenDesc")}
						/>
					</div>
				</section>

				{/* ─── Divider ─────────────────────────────────────── */}
				<div className="mx-auto max-w-5xl px-4 sm:px-6">
					<hr className="border-border" />
				</div>

				{/* ─── Feature Showcase 1: Rule Chains ─────────────── */}
				<section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
					{/* pill badge */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
						<span className="font-medium">{t("featureBadge")}</span>
						<ChevronRight className="h-4 w-4" />
					</div>

					{/* heading */}
					<h2 className="mt-4 whitespace-pre-line text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
						{t("featureTitle")}
					</h2>

					{/* description */}
					<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
						{t("featureDesc")}
					</p>

					{/* sub-features grid */}
					<div className="mt-12 grid grid-cols-1 gap-8 sm:mt-16 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
						<IconItem
							icon={Replace}
							color="text-rose-500"
							title={t("feat1Title")}
							desc={t("feat1Desc")}
						/>
						<IconItem
							icon={Regex}
							color="text-blue-500"
							title={t("feat2Title")}
							desc={t("feat2Desc")}
						/>
						<IconItem
							icon={Hash}
							color="text-violet-500"
							title={t("feat3Title")}
							desc={t("feat3Desc")}
						/>
						<IconItem
							icon={LetterText}
							color="text-emerald-500"
							title={t("feat4Title")}
							desc={t("feat4Desc")}
						/>
						<IconItem
							icon={Code2}
							color="text-orange-500"
							title={t("feat5Title")}
							desc={t("feat5Desc")}
						/>
						<IconItem
							icon={Sparkles}
							color="text-pink-500"
							title={t("feat6Title")}
							desc={t("feat6Desc")}
						/>
						<IconItem
							icon={ScanEye}
							color="text-cyan-500"
							title={t("feat7Title")}
							desc={t("feat7Desc")}
						/>
						<IconItem
							icon={FilesIcon}
							color="text-amber-500"
							title={t("feat8Title")}
							desc={t("feat8Desc")}
						/>
					</div>

					{/* product screenshot in gray container */}
					<div className="mt-12 overflow-hidden rounded-2xl bg-muted/50 p-1.5 shadow-sm ring-1 ring-border/50 sm:mt-16 sm:rounded-3xl sm:p-2">
						<div className="overflow-hidden rounded-xl sm:rounded-2xl">
							{/* Light mode screenshot */}
							<Image
								src="/screenshots/product_screenshot.png"
								alt="Rename.Tools Rule Chain Interface"
								width={1200}
								height={750}
								className="w-full block dark:hidden"
								priority
							/>
							{/* Dark mode screenshot */}
							<Image
								src="/screenshots/product_screenshot_dark.png"
								alt="Rename.Tools Rule Chain Interface"
								width={1200}
								height={750}
								className="w-full hidden dark:block"
								priority
							/>
						</div>
					</div>
				</section>

				{/* ─── Feature Showcase 2: Live Preview ────────────── */}
				<section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
					{/* pill badge */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
						<span className="font-medium">{t("previewBadge")}</span>
						<ChevronRight className="h-4 w-4" />
					</div>

					{/* heading */}
					<h2 className="mt-4 whitespace-pre-line text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
						{t("previewTitle")}
					</h2>

					{/* description */}
					<p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
						{t("previewDesc")}
					</p>

					{/* sub-features grid */}
					<div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
						<IconItem
							icon={Eye}
							color="text-blue-500"
							title={t("prev1Title")}
							desc={t("prev1Desc")}
						/>
						<IconItem
							icon={FileSearch}
							color="text-orange-500"
							title={t("prev2Title")}
							desc={t("prev2Desc")}
						/>
						<IconItem
							icon={Filter}
							color="text-emerald-500"
							title={t("prev3Title")}
							desc={t("prev3Desc")}
						/>
						<IconItem
							icon={MousePointerClick}
							color="text-rose-500"
							title={t("prev4Title")}
							desc={t("prev4Desc")}
						/>
						<IconItem
							icon={Undo2}
							color="text-violet-500"
							title={t("prev5Title")}
							desc={t("prev5Desc")}
						/>
					</div>
				</section>

				{/* ─── Feature Showcase 3: Privacy ─────────────────── */}
				<section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
					{/* pill badge */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
						<span className="font-medium">{t("privacyBadge")}</span>
						<ChevronRight className="h-4 w-4" />
					</div>

					{/* heading */}
					<h2 className="mt-4 whitespace-pre-line text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
						{t("privacyTitle")}
					</h2>

					{/* description */}
					<p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
						{t("privacyDesc")}
					</p>

					{/* sub-features grid */}
					<div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
						<IconItem
							icon={Upload}
							color="text-emerald-500"
							title={t("priv1Title")}
							desc={t("priv1Desc")}
						/>
						<IconItem
							icon={MonitorOff}
							color="text-blue-500"
							title={t("priv2Title")}
							desc={t("priv2Desc")}
						/>
						<IconItem
							icon={Trash2}
							color="text-violet-500"
							title={t("priv3Title")}
							desc={t("priv3Desc")}
						/>
						<IconItem
							icon={Terminal}
							color="text-orange-500"
							title={t("priv4Title")}
							desc={t("priv4Desc")}
						/>
					</div>

					{/* blockquote */}
					<div className="mt-10 border-l-4 border-blue-500 pl-4 sm:mt-12 sm:pl-6">
						<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
							{t("privacyQuote")}
						</p>
					</div>
				</section>

				{/* ─── Use Case Showcase ──────────────────────────── */}
				<UseCaseDemo />
				<RulesShowcase />

				{/* ─── Divider ─────────────────────────────────────── */}
				<div className="mx-auto max-w-5xl px-4 sm:px-6">
					<hr className="border-border" />
				</div>

				{/* ─── Steps ───────────────────────────────────────── */}
				<section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
						{t("stepsTitle")}
					</h2>

					<div className="mt-12 grid grid-cols-1 gap-10 sm:mt-16 sm:gap-12 md:grid-cols-3">
						{[
							{
								num: "1",
								color: "bg-blue-500",
								title: t("step1Title"),
								desc: t("step1Desc"),
							},
							{
								num: "2",
								color: "bg-violet-500",
								title: t("step2Title"),
								desc: t("step2Desc"),
							},
							{
								num: "3",
								color: "bg-emerald-500",
								title: t("step3Title"),
								desc: t("step3Desc"),
							},
						].map((step) => (
							<div key={step.num} className="flex flex-col gap-3 sm:gap-4">
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-full ${step.color} text-base font-bold text-white sm:h-12 sm:w-12 sm:text-lg`}
								>
									{step.num}
								</div>
								<h3 className="text-lg font-semibold text-foreground sm:text-xl">{step.title}</h3>
								<p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
							</div>
						))}
					</div>
				</section>

				{/* ─── Divider ─────────────────────────────────────── */}
				<div className="mx-auto max-w-5xl px-4 sm:px-6">
					<hr className="border-border" />
				</div>

				{/* ─── CTA ─────────────────────────────────────────── */}
				<section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
						{t("ctaTitle")}
					</h2>

					<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
						{t("ctaDesc")}
					</p>

					<div className="mt-6 sm:mt-8">
						<Link
							href="/app"
							className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:w-auto"
						>
							{t("ctaButton")}
							<span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20">
								<ArrowRight className="h-3 w-3 text-background" />
							</span>
						</Link>
					</div>

					<p className="mt-4 text-sm text-muted-foreground">{t("ctaSubtext")}</p>
				</section>

				{/* ─── Divider ─────────────────────────────────────── */}
				<div className="mx-auto max-w-5xl px-4 sm:px-6">
					<hr className="border-border" />
				</div>

				{/* ─── FAQ ─────────────────────────────────────────── */}
				<section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
					<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
						{t("faqTitle")}
					</h2>

					<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
						{t("faqSubtitle")}
					</p>

					<div className="mt-12">
						<Accordion type="single" collapsible className="w-full">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<AccordionItem key={i} value={`faq-${i}`}>
									<AccordionTrigger className="text-base font-medium text-foreground">
										{t(`faq${i}Q`)}
									</AccordionTrigger>
									<AccordionContent className="text-sm leading-relaxed text-muted-foreground">
										{t(`faq${i}A`)}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
				</section>

				{/* ─── bottom spacer ───────────────────────────────── */}
				<div className="h-16" />
			</div>
		</>
	);
}
