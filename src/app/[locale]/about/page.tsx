import { ArrowLeft, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Alert, AlertDescription } from "@/components/reui/alert";
import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { generatePageMetadata } from "@/lib/metadata";

type Props = {
	params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
	const { locale } = await params;
	return generatePageMetadata({ locale, path: "/about", namespace: "metadata.about" });
}

export default async function AboutPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	return <AboutContent />;
}

function AboutContent() {
	const t = useTranslations("about");

	const techItems = [
		{ key: "framework", variant: "default" as const },
		{ key: "styling", variant: "secondary" as const },
		{ key: "components", variant: "default" as const },
		{ key: "i18n", variant: "secondary" as const },
		{ key: "linting", variant: "default" as const },
		{ key: "theme", variant: "secondary" as const },
	];

	return (
		<div className="container mx-auto max-w-3xl px-4 py-16">
			<Button asChild variant="ghost" className="mb-8">
				<Link href="/">
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("backHome")}
				</Link>
			</Button>

			<h1 className="mb-4 text-4xl font-bold tracking-tight">{t("title")}</h1>
			<p className="mb-8 text-lg text-muted-foreground">{t("description")}</p>

			<Alert variant="info" className="mb-8">
				<Info className="h-4 w-4" />
				<AlertDescription>{t("description")}</AlertDescription>
			</Alert>

			<Card>
				<CardHeader>
					<CardTitle>{t("techStack")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-3">
						{techItems.map(({ key, variant }) => (
							<Badge key={key} variant={variant} className="text-sm">
								{t(`items.${key}`)}
							</Badge>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
