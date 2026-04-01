"use client";

import { Coffee, Film, Moon, Settings, Sun } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTmdbConfig } from "@/hooks/useTmdbConfig";
import { usePathname, useRouter } from "@/i18n/navigation";

export function RenameHeader() {
	const t = useTranslations("rename.app");
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [apiKeyInput, setApiKeyInput] = useState("");
	const [apiKeyError, setApiKeyError] = useState<string | null>(null);
	const tmdbConfig = useTmdbConfig();

	const switchLocale = (newLocale: string) => {
		router.replace(pathname, { locale: newLocale });
	};

	const handleSaveApiKey = async () => {
		if (!apiKeyInput.trim()) return;
		const result = await tmdbConfig.saveApiKey(apiKeyInput.trim());
		if (result.success) {
			setApiKeyError(null);
			setApiKeyInput("");
		} else {
			setApiKeyError(result.error || "unknown");
		}
	};

	const handleClearApiKey = () => {
		tmdbConfig.clearApiKey();
		setApiKeyInput("");
		setApiKeyError(null);
	};

	return (
		<>
			<header className="flex h-12 items-center justify-between border-b border-slate-700/50 bg-slate-900/95 px-4 text-slate-100 backdrop-blur-sm dark:bg-slate-950/95">
				{/* Left: Logo */}
				<div className="flex items-center gap-2.5">
					<Image
						src="/logo.svg"
						alt="Rename.Tools Logo"
						width={28}
						height={28}
						className="h-7 w-7 rounded-lg"
					/>
					<h1 className="text-base font-semibold tracking-tight text-white">
						<span className="text-slate-200">rename</span>
						<span className="text-blue-300">.tools</span>
					</h1>
				</div>

				{/* Center: Tauri drag region */}
				<div className="flex-1" data-tauri-drag-region />

				{/* Right: Controls */}
				<div className="flex items-center gap-0.5">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								asChild
								className="h-8 w-8 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
								aria-label="Support us on Ko-fi"
							>
								<a href="https://ko-fi.com/bryanchen0621" target="_blank" rel="noopener noreferrer">
									<Coffee />
								</a>
							</Button>
						</TooltipTrigger>
						<TooltipContent>{t("kofiTooltip")}</TooltipContent>
					</Tooltip>
					{/* Theme Toggle */}
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						aria-label={t("theme")}
					>
						<Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
					</Button>

					{/* Settings */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
								aria-label={t("settings")}
							>
								<Settings className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuItem onClick={() => setSettingsOpen(true)}>
								{t("preferences")}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => switchLocale("en")} disabled={locale === "en"}>
								English
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => switchLocale("zh")} disabled={locale === "zh"}>
								中文
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => switchLocale("ja")} disabled={locale === "ja"}>
								日本語
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => switchLocale("es")} disabled={locale === "es"}>
								Español
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => switchLocale("fr")} disabled={locale === "fr"}>
								Français
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => switchLocale("ko")} disabled={locale === "ko"}>
								한국어
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>

			{/* Settings Dialog (placeholder for future preferences) */}
			<Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5 text-muted-foreground" />
							{t("preferences")}
						</DialogTitle>
						<DialogDescription>{t("preferencesDesc")}</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						{/* TMDB API Key Section */}
						<div className="space-y-3">
							<div className="flex items-center gap-2 text-sm font-medium text-foreground">
								<Film className="h-4 w-4 text-violet-500" />
								<span>{t("tmdb.title")}</span>
								{tmdbConfig.isConfigured && (
									<span className="ml-auto text-xs text-emerald-500">{t("tmdb.configured")}</span>
								)}
							</div>
							<p className="text-xs text-muted-foreground">{t("tmdb.description")}</p>

							{tmdbConfig.isConfigured ? (
								<div className="flex items-center gap-2">
									<code className="flex-1 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
										{tmdbConfig.apiKey?.slice(0, 8)}****
									</code>
									<Button
										variant="outline"
										size="sm"
										className="h-7 text-xs"
										onClick={handleClearApiKey}
									>
										{t("tmdb.clear")}
									</Button>
								</div>
							) : (
								<div className="space-y-2">
									<div className="flex gap-2">
										<input
											type="password"
											value={apiKeyInput}
											onChange={(e) => {
												setApiKeyInput(e.target.value);
												setApiKeyError(null);
											}}
											placeholder={t("tmdb.placeholder")}
											className="flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
										/>
										<Button
											size="sm"
											className="h-7 bg-violet-600 hover:bg-violet-700"
											onClick={handleSaveApiKey}
											disabled={!apiKeyInput.trim() || tmdbConfig.isValidating}
										>
											{tmdbConfig.isValidating ? t("tmdb.validating") : t("tmdb.save")}
										</Button>
									</div>
									{apiKeyError && (
										<p className="text-xs text-red-500">
											{apiKeyError === "invalid" && t("tmdb.errorInvalid")}
											{apiKeyError === "network" && t("tmdb.errorNetwork")}
											{apiKeyError === "timeout" && t("tmdb.errorTimeout")}
											{apiKeyError === "unknown" && t("tmdb.errorUnknown")}
										</p>
									)}
								</div>
							)}
						</div>

						<div className="border-t border-border/50" />

						<div className="text-sm text-muted-foreground">{t("preferencesPlaceholder")}</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
