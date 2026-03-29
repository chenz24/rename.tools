import { Github } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
	const t = useTranslations("header");

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
				<div className="flex items-center gap-6">
					<Link
						href="/"
						className="flex items-center gap-2 text-base font-bold tracking-tight sm:text-lg"
					>
						<Image
							src="/logo.svg"
							alt="Rename.Tools Logo"
							width={28}
							height={28}
							className="h-7 w-7 rounded-lg"
						/>
						<span className="hidden xs:inline">Rename.Tools</span>
					</Link>
					<nav className="hidden items-center gap-1 sm:flex">
						<Link
							href="/features"
							className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							{t("features")}
						</Link>
						<Link
							href="/app"
							className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							{t("app")}
						</Link>
					</nav>
				</div>
				<div className="flex items-center gap-1">
					<LocaleSwitcher />
					<ThemeToggle />
					<a
						href="https://github.com/chenz24/rename.tools"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
						aria-label="GitHub"
					>
						<Github className="h-4 w-4" />
					</a>
				</div>
			</div>
		</header>
	);
}
