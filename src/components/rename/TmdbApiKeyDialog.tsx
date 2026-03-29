"use client";

import { ExternalLink, Key, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { SaveApiKeyResult } from "@/hooks/useTmdbConfig";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (key: string) => Promise<SaveApiKeyResult>;
	isValidating: boolean;
}

export function TmdbApiKeyDialog({ open, onOpenChange, onSave, isValidating }: Props) {
	const t = useTranslations("rename.scraper.apiKey");
	const [inputKey, setInputKey] = useState("");
	const [error, setError] = useState<string | null>(null);

	const getErrorMessage = (errorType?: string) => {
		switch (errorType) {
			case "invalid":
				return t("invalid");
			case "network":
				return t("network");
			case "timeout":
				return t("timeout");
			default:
				return t("unknown");
		}
	};

	const handleSave = async () => {
		const trimmed = inputKey.trim();
		if (!trimmed) {
			setError(t("required"));
			return;
		}
		setError(null);
		const result = await onSave(trimmed);
		if (result.success) {
			setInputKey("");
			onOpenChange(false);
		} else {
			setError(getErrorMessage(result.error));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Key className="h-4 w-4" />
						{t("title")}
					</DialogTitle>
					<DialogDescription>{t("description")}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-sm">
						<p className="font-medium text-foreground">{t("howToGet")}</p>
						<ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
							<li>{t("step1")}</li>
							<li>{t("step2")}</li>
							<li>{t("step3")}</li>
						</ol>
						<a
							href="https://www.themoviedb.org/settings/api"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
						>
							{t("goToTmdb")}
							<ExternalLink className="h-3 w-3" />
						</a>
					</div>

					<div className="space-y-2">
						<Label htmlFor="tmdb-api-key">{t("label")}</Label>
						<Input
							id="tmdb-api-key"
							type="password"
							placeholder={t("placeholder")}
							value={inputKey}
							onChange={(e) => {
								setInputKey(e.target.value);
								setError(null);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSave();
							}}
						/>
						{error && <p className="text-xs text-destructive">{error}</p>}
					</div>

					<p className="text-[11px] text-muted-foreground">{t("localOnly")}</p>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("cancel")}
					</Button>
					<Button onClick={handleSave} disabled={isValidating || !inputKey.trim()}>
						{isValidating && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
						{t("save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
