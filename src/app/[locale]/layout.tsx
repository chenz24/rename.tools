import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { ConditionalShell } from "@/components/ConditionalShell";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { RecoveryReady } from "@/components/RecoveryReady";
import { RegisterServiceWorker } from "@/components/ServiceWorkerRegistration";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UmamiAnalytics } from "@/components/UmamiAnalytics";
import { Toaster } from "@/components/ui/sonner";
import { getClientMessages } from "@/i18n/client-messages";
import { routing } from "@/i18n/routing";
import { developmentServiceWorkerCleanup } from "@/lib/development-service-worker-cleanup";
import { generatePageMetadata } from "@/lib/metadata";
import { pageRecoveryBootstrap } from "@/lib/page-recovery";
import "../globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	preload: false,
});

type Props = {
	children: ReactNode;
	params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">) {
	const { locale } = await params;
	return generatePageMetadata({ locale });
}

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);
	const messages = await getMessages();

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Local bootstrap with escaped static translations; runs independently of application chunks.
					dangerouslySetInnerHTML={{ __html: pageRecoveryBootstrap(locale) }}
				/>
				{process.env.NODE_ENV === "development" && (
					<script
						// biome-ignore lint/security/noDangerouslySetInnerHtml: Fixed local bootstrap with no interpolated data; must run even if React cannot hydrate.
						dangerouslySetInnerHTML={{ __html: developmentServiceWorkerCleanup }}
					/>
				)}
				<link rel="icon" href="/logo.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/logo.svg" />
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<GoogleAnalytics />
				<UmamiAnalytics />
				<RegisterServiceWorker />
				<RecoveryReady />
				<NextIntlClientProvider locale={locale} messages={getClientMessages(messages)}>
					<ThemeProvider>
						<ConditionalShell>{children}</ConditionalShell>
						<Toaster />
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
