import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getGuideIndexCopy } from "@/lib/guides/copy";
import { getGuideLocale } from "@/lib/guides/locales";
import type { GuideRecipe } from "@/lib/guides/recipes";

/** Server-rendered examples use the same inputs and rules as the app's recipe dialog. */
export function RecipeExample({
	recipe,
	locale,
	entry,
}: {
	recipe: GuideRecipe;
	locale: string;
	entry: "home" | "guide";
}) {
	const language = getGuideLocale(locale);
	const copy = getGuideIndexCopy(language);
	const Heading = entry === "home" ? "h3" : "h2";
	return (
		<div className="flex min-w-0 flex-col rounded-xl border bg-card p-5 text-sm" lang={language}>
			<Heading className="font-semibold leading-snug">{recipe.name[language]}</Heading>
			<dl className="my-4 space-y-3">
				{recipe.examples.map((example) => (
					<div key={example.before} className="space-y-1 rounded-lg bg-muted/50 p-3">
						<dt className="text-xs text-muted-foreground">{copy.before}</dt>
						<dd className="whitespace-pre-wrap break-all font-mono text-xs">{example.before}</dd>
						<dt className="pt-1 text-xs text-muted-foreground">{copy.after}</dt>
						<dd className="whitespace-pre-wrap break-all font-mono text-xs font-medium">
							{example.after}
						</dd>
					</div>
				))}
			</dl>
			<p className="mb-4 leading-relaxed text-muted-foreground">{recipe.note[language]}</p>
			<div className="mt-auto space-y-3">
				<Link
					href={`/app?recipe=${recipe.id}&entry=${entry}`}
					prefetch={false}
					className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2"
				>
					{copy.tryExample}
					<ArrowRight className="h-4 w-4" />
				</Link>
				<p className="text-xs leading-relaxed text-muted-foreground">{copy.reviewHint}</p>
				{entry === "home" && (
					<Link
						href={`/guides/${recipe.guideSlug}`}
						locale={language}
						hrefLang={language}
						className="inline-block underline underline-offset-4"
					>
						{copy.readGuide}
					</Link>
				)}
			</div>
		</div>
	);
}
