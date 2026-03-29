import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

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
				url: `${BASE_URL}/${locale}${route.path}`,
				lastModified: new Date(),
				changeFrequency: route.changeFrequency,
				priority: route.priority,
				alternates: {
					languages: Object.fromEntries(
						routing.locales.map((l) => [l, `${BASE_URL}/${l}${route.path}`]),
					),
				},
			});
		}
	}

	return entries;
}
