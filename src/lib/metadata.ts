import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

type GeneratePageMetadataParams = {
	locale: string;
	path?: string;
	namespace?: string;
};

export async function generatePageMetadata({
	locale,
	path = "",
	namespace = "metadata",
}: GeneratePageMetadataParams): Promise<Metadata> {
	const t = await getTranslations({ locale, namespace });

	const url = `${BASE_URL}/${locale}${path}`;

	const alternateLanguages = Object.fromEntries(
		routing.locales.map((l) => [l, `${BASE_URL}/${l}${path}`]),
	);

	return {
		title: t("title"),
		description: t("description"),
		metadataBase: new URL(BASE_URL),
		keywords: [
			"batch file rename",
			"file renaming tool",
			"regex rename",
			"bulk rename",
			"browser file rename",
			"local file processing",
			"privacy-first rename",
			"file name editor",
		],
		alternates: {
			canonical: url,
			languages: {
				...alternateLanguages,
				"x-default": `${BASE_URL}/en${path}`,
			},
		},
		openGraph: {
			title: t("title"),
			description: t("description"),
			url,
			siteName: "Rename.Tools",
			locale,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: t("title"),
			description: t("description"),
		},
	};
}
