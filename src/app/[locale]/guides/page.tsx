import { ArrowRight, BookOpen, CalendarDays, Clock3, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
	getAllGuides,
	getGuideIndexCopy,
	getGuidePrimaryImage,
	isIndexableGuideLocale,
} from "@/lib/guides/content";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

type Props = {
	params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params;
	const copy = getGuideIndexCopy(locale);
	const isIndexable = isIndexableGuideLocale(locale);
	const canonicalLocale = isIndexable ? locale : "en";
	const canonical = `${BASE_URL}/${canonicalLocale}/guides`;

	return {
		title: copy.title,
		description: copy.description,
		metadataBase: new URL(BASE_URL),
		alternates: {
			canonical,
			languages: {
				en: `${BASE_URL}/en/guides`,
				zh: `${BASE_URL}/zh/guides`,
				"x-default": `${BASE_URL}/en/guides`,
			},
		},
		openGraph: {
			title: copy.title,
			description: copy.description,
			url: canonical,
			siteName: "Rename.Tools",
			locale: canonicalLocale,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: copy.title,
			description: copy.description,
		},
		robots: isIndexable ? undefined : { index: false, follow: true },
	};
}

export default async function GuidesPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	const copy = getGuideIndexCopy(locale);
	const guides = getAllGuides(locale);
	const featuredGuides = guides.slice(0, 3);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<section className="mx-auto max-w-5xl px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-14 md:pt-24">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
					<span className="font-medium">{copy.eyebrow}</span>
				</div>

				<div className="mt-5 max-w-3xl">
					<h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
						{copy.heading}
					</h1>
					<p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
						{copy.intro}
					</p>
				</div>
			</section>

			<section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
				<div className="mb-6 flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-amber-500" />
					<h2 className="text-xl font-semibold tracking-tight">{copy.featured}</h2>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					{featuredGuides.map((guide) => {
						const primaryImage = getGuidePrimaryImage(guide);
						return (
							<Link
								key={guide.slug}
								href={`/guides/${guide.slug}`}
								className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-colors hover:border-foreground/30"
							>
								{primaryImage && (
									<Image
										src={primaryImage.src}
										alt={primaryImage.alt}
										width={1280}
										height={720}
										className="aspect-video w-full object-cover"
									/>
								)}
								<div className="p-5">
									<p className="text-xs font-medium uppercase text-muted-foreground">
										{guide.categoryLabel}
									</p>
									<h3 className="mt-3 text-lg font-semibold leading-snug group-hover:underline">
										{guide.title}
									</h3>
									<p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
										{guide.description}
									</p>
									<div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
										<span className="inline-flex items-center gap-1">
											<Clock3 className="h-3.5 w-3.5" />
											{guide.readingTime} {copy.minRead}
										</span>
										<span className="inline-flex items-center gap-1">
											<CalendarDays className="h-3.5 w-3.5" />
											{guide.updatedAt}
										</span>
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			</section>

			<section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
				<div className="mb-6 flex items-center gap-2">
					<BookOpen className="h-5 w-5 text-blue-500" />
					<h2 className="text-xl font-semibold tracking-tight">{copy.allGuides}</h2>
				</div>

				<div className="divide-y rounded-lg border bg-card">
					{guides.map((guide) => (
						<Link
							key={guide.slug}
							href={`/guides/${guide.slug}`}
							className="group grid gap-4 p-5 transition-colors hover:bg-muted/40 sm:grid-cols-[1fr_auto]"
						>
							<div>
								<p className="text-xs font-medium uppercase text-muted-foreground">
									{guide.categoryLabel}
								</p>
								<h3 className="mt-2 text-lg font-semibold group-hover:underline">{guide.title}</h3>
								<p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
									{guide.description}
								</p>
							</div>
							<div className="flex items-center gap-2 text-sm font-medium text-foreground">
								{copy.readGuide}
								<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
							</div>
						</Link>
					))}
				</div>
			</section>

			<section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
				<div className="border-t pt-10">
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
				</div>
			</section>
		</div>
	);
}
