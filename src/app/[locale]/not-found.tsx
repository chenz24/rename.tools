import { FileQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
	const t = useTranslations("notFound");

	return (
		<div className="container mx-auto flex max-w-md flex-col items-center justify-center px-4 py-32 text-center">
			<FileQuestion className="mb-6 h-16 w-16 text-muted-foreground" />
			<h1 className="mb-2 text-4xl font-bold tracking-tight">{t("title")}</h1>
			<p className="mb-8 text-lg text-muted-foreground">{t("description")}</p>
			<Button asChild>
				<Link href="/">{t("backHome")}</Link>
			</Button>
		</div>
	);
}
