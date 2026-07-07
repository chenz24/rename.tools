import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

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

	const url = `${SITE_URL}/${locale}${path}`;
	const imageUrl = `${SITE_URL}/${locale}/opengraph-image`;

	const alternateLanguages = Object.fromEntries(
		routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
	);

	return {
		title: t("title"),
		description: t("description"),
		metadataBase: new URL(SITE_URL),
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
				"x-default": `${SITE_URL}/en${path}`,
			},
		},
		openGraph: {
			title: t("title"),
			description: t("description"),
			url,
			siteName: "Rename.Tools",
			locale,
			type: "website",
			images: [
				{
					url: imageUrl,
					width: 2400,
					height: 1260,
					alt: "Rename.Tools - Advanced Batch File Rename",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: t("title"),
			description: t("description"),
			images: [imageUrl],
		},
	};
}
