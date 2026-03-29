import { Github, Heart, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
	const t = useTranslations("footer");
	const year = new Date().getFullYear();

	return (
		<footer className="border-t bg-muted/30">
			<div className="mx-auto max-w-5xl px-6 py-12">
				{/* Main Footer Content */}
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
					{/* Brand Column */}
					<div className="md:col-span-2">
						<Link
							href="/"
							className="inline-flex items-center gap-2 text-lg font-semibold text-foreground"
						>
							<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background text-sm font-bold">
								R
							</span>
							Rename.Tools
						</Link>
						<p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
							{t("tagline")}
						</p>
						{/* Privacy Badge */}
						<div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
							<Shield className="h-3.5 w-3.5" />
							{t("privacyBadge")}
						</div>
					</div>

					{/* Legal Links */}
					<div>
						<h4 className="mb-4 text-sm font-semibold text-foreground">{t("legalTitle")}</h4>
						<ul className="space-y-2.5 text-sm">
							<li>
								<Link
									href="/terms"
									className="text-muted-foreground transition-colors hover:text-foreground"
								>
									{t("terms")}
								</Link>
							</li>
							<li>
								<Link
									href="/privacy"
									className="text-muted-foreground transition-colors hover:text-foreground"
								>
									{t("privacyPolicy")}
								</Link>
							</li>
							<li>
								<Link
									href="/disclaimer"
									className="text-muted-foreground transition-colors hover:text-foreground"
								>
									{t("disclaimer")}
								</Link>
							</li>
						</ul>
					</div>

					{/* Resources */}
					<div>
						<h4 className="mb-4 text-sm font-semibold text-foreground">{t("resourcesTitle")}</h4>
						<ul className="space-y-2.5 text-sm">
							<li>
								<Link
									href="/features"
									className="text-muted-foreground transition-colors hover:text-foreground"
								>
									{t("features")}
								</Link>
							</li>
							<li>
								<a
									href="https://github.com/chenz24/rename.tools"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
								>
									<Github className="h-4 w-4" />
									GitHub
								</a>
							</li>
							<li>
								<a
									href="https://github.com/chenz24/rename.tools/issues"
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground transition-colors hover:text-foreground"
								>
									{t("reportIssue")}
								</a>
							</li>
							<li>
								<a
									href="https://github.com/chenz24/rename.tools/releases"
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground transition-colors hover:text-foreground"
								>
									{t("changelog")}
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Divider */}
				<div className="mt-10 border-t border-border" />

				{/* Bottom Bar */}
				<div className="mt-6 flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
					<p>
						&copy; {year} Rename.Tools. {t("allRightsReserved")}
					</p>
					<p className="inline-flex items-center gap-1">
						{t("madeWith")} <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />{" "}
						{t("madeIn")}
					</p>
				</div>
			</div>
		</footer>
	);
}
