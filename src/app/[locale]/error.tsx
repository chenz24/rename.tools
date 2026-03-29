"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslations("error");

	return (
		<div className="container mx-auto flex max-w-md flex-col items-center justify-center px-4 py-32 text-center">
			<AlertTriangle className="mb-6 h-16 w-16 text-destructive" />
			<h1 className="mb-2 text-4xl font-bold tracking-tight">{t("title")}</h1>
			<p className="mb-8 text-lg text-muted-foreground">{t("description")}</p>
			<Button onClick={reset}>{t("retry")}</Button>
		</div>
	);
}
