import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { generatePageMetadata } from "@/lib/metadata";

type Props = {
	params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
	const { locale } = await params;
	return generatePageMetadata({ locale, path: "/disclaimer", namespace: "metadata.disclaimer" });
}

export default async function DisclaimerPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	return <DisclaimerContent />;
}

function DisclaimerContent() {
	const t = useTranslations("legal");

	const sections = [
		{ title: "disclaimerGeneral", desc: "disclaimerGeneralDesc" },
		{ title: "disclaimerRisk", desc: "disclaimerRiskDesc" },
		{ title: "disclaimerBackup", desc: "disclaimerBackupDesc" },
		{ title: "disclaimerNoWarranty", desc: "disclaimerNoWarrantyDesc" },
		{ title: "disclaimerLiability", desc: "disclaimerLiabilityDesc" },
		{ title: "disclaimerOpenSource", desc: "disclaimerOpenSourceDesc" },
		{ title: "disclaimerThirdParty", desc: "disclaimerThirdPartyDesc" },
		{ title: "disclaimerJurisdiction", desc: "disclaimerJurisdictionDesc" },
		{ title: "disclaimerAcknowledgment", desc: "disclaimerAcknowledgmentDesc" },
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
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
						<AlertTriangle className="h-6 w-6 text-amber-500" />
					</div>
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-foreground">
							{t("disclaimerTitle")}
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">{t("lastUpdated")}: 2024-01-01</p>
					</div>
				</div>

				<div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50">
					<p className="text-sm leading-relaxed text-amber-800 dark:text-amber-200">
						{t("disclaimerIntro")}
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
