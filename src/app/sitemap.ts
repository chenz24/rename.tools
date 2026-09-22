import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { GUIDE_LOCALES, guides } from "@/lib/guides/content";
import { getGuideLanguages } from "@/lib/guides/locales";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
	const routes = [
		{ path: "", priority: 1.0, changeFrequency: "weekly" as const },
		{ path: "/app", priority: 0.9, changeFrequency: "daily" as const },
		{ path: "/features", priority: 0.8, changeFrequency: "weekly" as const },
		{ path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
		{ path: "/privacy", priority: 0.5, changeFrequency: "monthly" as const },
		{ path: "/terms", priority: 0.5, changeFrequency: "monthly" as const },
		{ path: "/disclaimer", priority: 0.5, changeFrequency: "monthly" as const },
	];

	const entries: MetadataRoute.Sitemap = [];

	for (const route of routes) {
		for (const locale of routing.locales) {
			entries.push({
				url: `${SITE_URL}/${locale}${route.path}`,
				changeFrequency: route.changeFrequency,
				priority: route.priority,
				alternates: {
					languages: Object.fromEntries([
						...routing.locales.map((l) => [l, `${SITE_URL}/${l}${route.path}`] as const),
						["x-default", `${SITE_URL}/en${route.path}`] as const,
					]),
				},
			});
		}
	}

	for (const locale of GUIDE_LOCALES) {
		entries.push({
			url: `${SITE_URL}/${locale}/guides`,
			lastModified: new Date(
				Math.max(
					...guides.map((guide) =>
						new Date(guide.content[locale].updatedAt ?? guide.updatedAt).getTime(),
					),
				),
			),
			changeFrequency: "monthly",
			priority: 0.75,
			alternates: {
				languages: getGuideLanguages("/guides"),
			},
		});
	}

	for (const guide of guides) {
		for (const locale of GUIDE_LOCALES) {
			entries.push({
				url: `${SITE_URL}/${locale}/guides/${guide.slug}`,
				lastModified: new Date(guide.content[locale].updatedAt ?? guide.updatedAt),
				changeFrequency: "monthly",
				priority: 0.7,
				alternates: {
					languages: getGuideLanguages(`/guides/${guide.slug}`),
				},
			});
		}
	}

	return entries;
}
