"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function ConditionalShell({ children }: { children: ReactNode }) {
	const pathname = usePathname();

	// The /app route has its own full-screen layout with RenameHeader
	// so we skip the default Header/Footer wrapper
	const isAppRoute =
		pathname === "/app" || pathname.startsWith("/app/") || /^\/[a-z]{2}\/app(\/|$)/.test(pathname);

	if (isAppRoute) {
		return <>{children}</>;
	}

	return (
		<div className="relative flex min-h-screen flex-col">
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
