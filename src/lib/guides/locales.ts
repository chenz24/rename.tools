import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

// Only add a locale here when every published guide has a complete translation.
export const GUIDE_LOCALES = routing.locales;
export type GuideLocale = (typeof GUIDE_LOCALES)[number];

export function isIndexableGuideLocale(locale: string): locale is GuideLocale {
	return GUIDE_LOCALES.includes(locale as GuideLocale);
}

export function getGuideLocale(locale: string): GuideLocale {
	return isIndexableGuideLocale(locale) ? locale : routing.defaultLocale;
}

export function getGuideLanguages(path: string) {
	return Object.fromEntries([
		...GUIDE_LOCALES.map((locale) => [locale, `${SITE_URL}/${locale}${path}`]),
		["x-default", `${SITE_URL}/en${path}`],
	]);
}
