import { Geist, Geist_Mono, Noto_Sans_SC } from "next/font/google";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { RegisterServiceWorker } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const notoSansSC = Noto_Sans_SC({
	variable: "--font-noto-sans-sc",
	subsets: ["latin"],
	weight: ["400", "500", "700"],
});

export default async function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const headersList = await headers();
	const pathname = headersList.get("x-pathname") || "";
	const locale = pathname.split("/")[1] || "en";

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<link rel="icon" href="/logo.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/logo.svg" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable} antialiased`}
			>
				<GoogleAnalytics />
				<RegisterServiceWorker />
				{children}
			</body>
		</html>
	);
}
