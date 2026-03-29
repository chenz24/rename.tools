import { ArrowLeft, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { generatePageMetadata } from "@/lib/metadata";

type Props = {
	params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
	const { locale } = await params;
	return generatePageMetadata({ locale, path: "/terms", namespace: "metadata.terms" });
}

export default async function TermsPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	return <TermsContent />;
}

function TermsContent() {
	const t = useTranslations("legal");

	const sections = [
		{ title: "termsAcceptance", desc: "termsAcceptanceDesc" },
		{ title: "termsService", desc: "termsServiceDesc" },
		{ title: "termsUserConduct", desc: "termsUserConductDesc" },
		{ title: "termsIntellectual", desc: "termsIntellectualDesc" },
		{ title: "termsDisclaimer", desc: "termsDisclaimerDesc" },
		{ title: "termsLiability", desc: "termsLiabilityDesc" },
		{ title: "termsChanges", desc: "termsChangesDesc" },
		{ title: "termsTermination", desc: "termsTerminationDesc" },
		{ title: "termsGoverning", desc: "termsGoverningDesc" },
		{ title: "termsContact", desc: "termsContactDesc" },
	];

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-3xl px-6 py-16">
				<Link
					href="/"
					className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					{t("backToHome")}
				</Link>

				<div className="mb-8 flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
						<FileText className="h-6 w-6 text-blue-500" />
					</div>
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-foreground">{t("termsTitle")}</h1>
						<p className="mt-1 text-sm text-muted-foreground">{t("lastUpdated")}: 2024-01-01</p>
					</div>
				</div>

				<div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/50">
					<p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
						{t("termsIntro")}
					</p>
				</div>

				<div className="space-y-8 text-muted-foreground">
					{sections.map(({ title, desc }) => (
						<section key={title} className="group">
							<h2 className="mb-3 text-lg font-semibold text-foreground">{t(title)}</h2>
							<p className="leading-relaxed">{t(desc)}</p>
						</section>
					))}
				</div>
			</div>
		</div>
	);
}
