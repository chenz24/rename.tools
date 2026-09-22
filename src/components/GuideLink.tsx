import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const TOPICS: Record<string, { slug: string; label: string }> = {
	photos: { slug: "organize-photos-by-date-sequence", label: "photos" },
	metadataExtraction: { slug: "organize-photos-by-date-sequence", label: "photos" },
	videos: { slug: "organize-music-video-files", label: "media" },
	music: { slug: "organize-music-video-files", label: "media" },
	mediaScraper: { slug: "organize-music-video-files", label: "media" },
	regex: { slug: "regex-batch-rename", label: "regex" },
	sequence: { slug: "sequence-file-numbering", label: "sequence" },
};

export function GuideLink({ topic }: { topic: string }) {
	const locale = useLocale();
	const t = useTranslations("guideLinks");
	const guide = TOPICS[topic] ?? { slug: "batch-file-rename-basics", label: "basics" };
	const guideLocale = locale;

	return (
		<Link
			href={`/guides/${guide.slug}`}
			locale={guideLocale}
			hrefLang={guideLocale}
			className="mt-3 inline-block text-sm font-medium underline underline-offset-4 hover:text-primary"
		>
			{t(guide.label)}
		</Link>
	);
}
