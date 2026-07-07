import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { GUIDE_LOCALES, guides } from "@/lib/guides/content";
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
			lastModified: new Date("2026-05-22"),
			changeFrequency: "monthly",
			priority: 0.75,
			alternates: {
				languages: {
					en: `${SITE_URL}/en/guides`,
					zh: `${SITE_URL}/zh/guides`,
					"x-default": `${SITE_URL}/en/guides`,
				},
			},
		});
	}

	for (const guide of guides) {
		for (const locale of GUIDE_LOCALES) {
			entries.push({
				url: `${SITE_URL}/${locale}/guides/${guide.slug}`,
				lastModified: new Date(guide.updatedAt),
				changeFrequency: "monthly",
				priority: 0.7,
				alternates: {
					languages: {
						en: `${SITE_URL}/en/guides/${guide.slug}`,
						zh: `${SITE_URL}/zh/guides/${guide.slug}`,
						"x-default": `${SITE_URL}/en/guides/${guide.slug}`,
					},
				},
			});
		}
	}

	return entries;
}
