import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { getClientMessages } from "@/i18n/client-messages";
import { routing } from "@/i18n/routing";
import { generatePageMetadata } from "@/lib/metadata";

type Props = {
	children: ReactNode;
	params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Omit<Props, "children">) {
	const { locale } = await params;
	return generatePageMetadata({ locale, path: "/features", namespace: "metadata.features" });
}

export default async function FeaturesLayout({ children, params }: Props) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	const messages = await getMessages();
	return (
		<NextIntlClientProvider messages={getClientMessages(messages, ["features"])}>
			{children}
		</NextIntlClientProvider>
	);
}
