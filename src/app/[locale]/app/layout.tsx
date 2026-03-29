import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { routing } from "@/i18n/routing";
import { generatePageMetadata } from "@/lib/metadata";

type Props = {
	children: ReactNode;
	params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Omit<Props, "children">) {
	const { locale } = await params;
	return generatePageMetadata({ locale, path: "/app", namespace: "metadata.app" });
}

export default async function AppLayout({ children, params }: Props) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	// The /app route uses its own full-screen layout (RenameHeader inside the page)
	// so we skip the default Header/Footer wrapper
	return <>{children}</>;
}
