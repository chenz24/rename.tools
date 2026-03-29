import { ArrowLeft, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { generatePageMetadata } from "@/lib/metadata";

type Props = {
	params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
	const { locale } = await params;
	return generatePageMetadata({ locale, path: "/privacy", namespace: "metadata.privacy" });
}

export default async function PrivacyPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	return <PrivacyContent />;
}

function PrivacyContent() {
	const t = useTranslations("legal");

	const sections = [
		{ title: "privacyLocalTitle", desc: "privacyLocalDesc" },
		{ title: "privacyNoCollection", desc: "privacyNoCollectionDesc" },
		{ title: "privacyNoStorage", desc: "privacyNoStorageDesc" },
		{ title: "privacyCookies", desc: "privacyCookiesDesc" },
		{ title: "privacyThirdParty", desc: "privacyThirdPartyDesc" },
		{ title: "privacySecurity", desc: "privacySecurityDesc" },
		{ title: "privacyChildren", desc: "privacyChildrenDesc" },
		{ title: "privacyChanges", desc: "privacyChangesDesc" },
		{ title: "privacyRights", desc: "privacyRightsDesc" },
		{ title: "privacyContact", desc: "privacyContactDesc" },
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
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
						<Shield className="h-6 w-6 text-emerald-500" />
					</div>
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-foreground">
							{t("privacyTitle")}
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">{t("lastUpdated")}: 2024-01-01</p>
					</div>
				</div>

				<div className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/50">
					<p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
						{t("privacyIntro")}
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
