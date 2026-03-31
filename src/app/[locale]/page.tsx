import {
	ArrowRight,
	ChevronRight,
	Eye,
	Github,
	Globe,
	Layers,
	ScanEye,
	Shield,
	Star,
	Undo2,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { FAQPage, WebApplication, WithContext } from "schema-dts";
import { UseCaseDemo } from "@/components/home/UseCaseDemo";
import { JsonLd } from "@/components/JsonLd";
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
		mainEntity: [1, 2, 3, 4, 5].map((i) => ({
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
					<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/4 to-transparent" />

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

				{/* ─── Highlights ─────────────────────────── */}
				<section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
					{/* pill badge */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
						<span className="font-medium">{t("highlightBadge")}</span>
						<ChevronRight className="h-4 w-4" />
					</div>

					{/* heading */}
					<h2 className="mt-4 whitespace-pre-line text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
						{t("highlightTitle")}
					</h2>

					{/* description */}
					<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
						{t("highlightDesc")}
					</p>

					{/* 2×3 grid */}
					<div className="mt-12 grid grid-cols-1 gap-8 sm:mt-16 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
						<IconItem
							icon={Layers}
							color="text-rose-500"
							title={t("hl1Title")}
							desc={t("hl1Desc")}
						/>
						<IconItem icon={Eye} color="text-blue-500" title={t("hl2Title")} desc={t("hl2Desc")} />
						<IconItem
							icon={ScanEye}
							color="text-orange-500"
							title={t("hl3Title")}
							desc={t("hl3Desc")}
						/>
						<IconItem
							icon={Shield}
							color="text-emerald-500"
							title={t("hl4Title")}
							desc={t("hl4Desc")}
						/>
						<IconItem
							icon={Undo2}
							color="text-violet-500"
							title={t("hl5Title")}
							desc={t("hl5Desc")}
						/>
						<IconItem
							icon={Globe}
							color="text-cyan-500"
							title={t("hl6Title")}
							desc={t("hl6Desc")}
						/>
					</div>

					{/* product screenshot */}
					<div className="mt-12 overflow-hidden rounded-2xl bg-muted/50 p-1.5 shadow-sm ring-1 ring-border/50 sm:mt-16 sm:rounded-3xl sm:p-2">
						<div className="overflow-hidden rounded-xl sm:rounded-2xl">
							<Image
								src="/screenshots/product_screenshot.png"
								alt="Rename.Tools Rule Chain Interface"
								width={1200}
								height={750}
								className="w-full block dark:hidden"
								priority
							/>
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

				{/* ─── Use Case Showcase ──────────────────── */}
				<UseCaseDemo />

				{/* ─── Divider ───────────────────────────────── */}
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
							{[1, 2, 3, 4, 5].map((i) => (
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
