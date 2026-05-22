import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Article, BreadcrumbList, HowTo, WithContext } from "schema-dts";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
	getGuideBySlug,
	getGuideIndexCopy,
	getGuidePrimaryImage,
	getGuideSlugs,
	getRelatedGuides,
	isIndexableGuideLocale,
} from "@/lib/guides/content";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

type Props = {
	params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
	return routing.locales.flatMap((locale) =>
		getGuideSlugs().map((slug) => ({
			locale,
			slug,
		})),
	);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, slug } = await params;
	const guide = getGuideBySlug(slug, locale);

	if (!guide) {
		return {};
	}

	const isIndexable = isIndexableGuideLocale(locale);
	const canonicalLocale = isIndexable ? locale : "en";
	const canonical = `${BASE_URL}/${canonicalLocale}/guides/${guide.slug}`;
	const primaryImage = getGuidePrimaryImage(guide);
	const openGraphImages = primaryImage ? [{ url: `${BASE_URL}${primaryImage.src}` }] : undefined;

	return {
		title: `${guide.title} - Rename.Tools`,
		description: guide.description,
		metadataBase: new URL(BASE_URL),
		alternates: {
			canonical,
			languages: {
				en: `${BASE_URL}/en/guides/${guide.slug}`,
				zh: `${BASE_URL}/zh/guides/${guide.slug}`,
				"x-default": `${BASE_URL}/en/guides/${guide.slug}`,
			},
		},
		openGraph: {
			title: guide.title,
			description: guide.description,
			url: canonical,
			siteName: "Rename.Tools",
			locale: canonicalLocale,
			type: "article",
			publishedTime: guide.updatedAt,
			modifiedTime: guide.updatedAt,
			images: openGraphImages,
		},
		twitter: {
			card: "summary_large_image",
			title: guide.title,
			description: guide.description,
			images: primaryImage ? [`${BASE_URL}${primaryImage.src}`] : undefined,
		},
		robots: isIndexable ? undefined : { index: false, follow: true },
	};
}

export default async function GuideDetailPage({ params }: Props) {
	const { locale, slug } = await params;
	setRequestLocale(locale);

	const guide = getGuideBySlug(slug, locale);
	if (!guide) {
		notFound();
	}

	const copy = getGuideIndexCopy(locale);
	const relatedGuides = getRelatedGuides(guide, locale);
	const canonicalLocale = isIndexableGuideLocale(locale) ? locale : "en";
	const url = `${BASE_URL}/${canonicalLocale}/guides/${guide.slug}`;
	const primaryImage = getGuidePrimaryImage(guide);

	const articleSchema: WithContext<Article> = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: guide.title,
		description: guide.description,
		datePublished: guide.updatedAt,
		dateModified: guide.updatedAt,
		inLanguage: guide.locale,
		mainEntityOfPage: url,
		image: primaryImage ? `${BASE_URL}${primaryImage.src}` : undefined,
		author: {
			"@type": "Organization",
			name: "Rename.Tools",
		},
		publisher: {
			"@type": "Organization",
			name: "Rename.Tools",
			logo: {
				"@type": "ImageObject",
				url: `${BASE_URL}/logo.svg`,
			},
		},
		articleBody: [
			guide.intro,
			...guide.sections.flatMap((section) => [
				section.title,
				...section.body,
				...(section.steps ?? []),
				...(section.examples ?? []).flatMap((example) => [
					`${example.before} -> ${example.after}`,
					example.note ?? "",
				]),
			]),
		]
			.filter(Boolean)
			.join("\n"),
	};

	const breadcrumbSchema: WithContext<BreadcrumbList> = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Rename.Tools",
				item: `${BASE_URL}/${canonicalLocale}`,
			},
			{
				"@type": "ListItem",
				position: 2,
				name: copy.eyebrow,
				item: `${BASE_URL}/${canonicalLocale}/guides`,
			},
			{
				"@type": "ListItem",
				position: 3,
				name: guide.title,
				item: url,
			},
		],
	};

	const howToSteps = guide.sections.flatMap((section) => section.steps ?? []);
	const howToSchema: WithContext<HowTo> | null =
		howToSteps.length > 0
			? {
					"@context": "https://schema.org",
					"@type": "HowTo",
					name: guide.title,
					description: guide.description,
					inLanguage: guide.locale,
					step: howToSteps.map((step, index) => ({
						"@type": "HowToStep",
						position: index + 1,
						text: step,
					})),
				}
			: null;

	return (
		<>
			<JsonLd data={articleSchema} />
			<JsonLd data={breadcrumbSchema} />
			{howToSchema && <JsonLd data={howToSchema} />}
			<article className="min-h-screen bg-background text-foreground">
				<header className="mx-auto max-w-5xl px-4 pt-12 pb-10 sm:px-6 sm:pt-16 md:pt-20">
					<Link
						href="/guides"
						className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
					>
						<ArrowLeft className="h-4 w-4" />
						{copy.backToGuides}
					</Link>

					<div className="mt-8 max-w-3xl">
						<p className="text-sm font-medium uppercase text-muted-foreground">
							{guide.categoryLabel}
						</p>
						<h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
							{guide.title}
						</h1>
						<p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
							{guide.intro}
						</p>
						<div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
							<span className="inline-flex items-center gap-1.5">
								<Clock3 className="h-4 w-4" />
								{guide.readingTime} {copy.minRead}
							</span>
							<span className="inline-flex items-center gap-1.5">
								<CalendarDays className="h-4 w-4" />
								{copy.updated} {guide.updatedAt}
							</span>
						</div>
					</div>
				</header>

				<div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20">
					<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
						<div className="space-y-12">
							{guide.sections.map((section) => (
								<section key={section.title} className="scroll-mt-24">
									<h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
									<div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
										{section.body.map((paragraph) => (
											<p key={paragraph}>{paragraph}</p>
										))}
									</div>

									{section.image && (
										<figure className="mt-6 overflow-hidden rounded-lg border bg-card">
											<Image
												src={section.image.src}
												alt={section.image.alt}
												width={1280}
												height={720}
												className="block w-full"
											/>
											{section.image.caption && (
												<figcaption className="border-t bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
													{section.image.caption}
												</figcaption>
											)}
										</figure>
									)}

									{section.steps && (
										<ol className="mt-6 space-y-3 rounded-lg border bg-card p-5">
											{section.steps.map((step, index) => (
												<li key={step} className="flex gap-3 text-sm leading-relaxed">
													<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
														{index + 1}
													</span>
													<span className="text-foreground">{step}</span>
												</li>
											))}
										</ol>
									)}

									{section.examples && (
										<div className="mt-6 space-y-3">
											{section.examples.map((example) => (
												<div
													key={`${example.before}-${example.after}`}
													className="rounded-lg border bg-card p-5"
												>
													<div className="grid gap-3 text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center">
														<code className="rounded-md bg-muted px-3 py-2 text-muted-foreground">
															{example.before}
														</code>
														<ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
														<code className="rounded-md bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:text-emerald-300">
															{example.after}
														</code>
													</div>
													{example.note && (
														<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
															{example.note}
														</p>
													)}
												</div>
											))}
										</div>
									)}
								</section>
							))}
						</div>

						<aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
							<div className="rounded-lg border bg-card p-5">
								<h2 className="text-sm font-semibold uppercase text-muted-foreground">
									{copy.relatedGuides}
								</h2>
								<div className="mt-4 space-y-3">
									{relatedGuides.map((relatedGuide) => (
										<Link
											key={relatedGuide.slug}
											href={`/guides/${relatedGuide.slug}`}
											className="block text-sm font-medium leading-snug transition-colors hover:text-muted-foreground"
										>
											{relatedGuide.title}
										</Link>
									))}
								</div>
							</div>
						</aside>
					</div>

					<section className="mt-16 border-t pt-10">
						<h2 className="text-2xl font-bold tracking-tight">{copy.ctaTitle}</h2>
						<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
							{copy.ctaDesc}
						</p>
						<div className="mt-6">
							<Link
								href="/app"
								className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
							>
								{copy.startRenaming}
								<ArrowRight className="h-4 w-4" />
							</Link>
						</div>
					</section>
				</div>
			</article>
		</>
	);
}
