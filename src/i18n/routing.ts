import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["en", "zh", "ja", "ko", "es", "fr", "de"],
	defaultLocale: "en",
});
