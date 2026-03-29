import { AlertTriangle, ArrowLeft, CheckCircle2, Info, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/reui/alert";
import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function ComponentsPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	return <ComponentsContent />;
}

function ComponentsContent() {
	const t = useTranslations("components");

	return (
		<div className="container mx-auto max-w-5xl px-4 py-16">
			<Button asChild variant="ghost" className="mb-8">
				<Link href="/">
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("title")}
				</Link>
			</Button>

			<h1 className="mb-2 text-4xl font-bold tracking-tight">{t("title")}</h1>
			<p className="mb-12 text-lg text-muted-foreground">{t("description")}</p>

			{/* Buttons */}
			<section className="mb-12">
				<h2 className="mb-6 text-2xl font-semibold">{t("sections.buttons")}</h2>
				<div className="flex flex-wrap gap-3">
					<Button>Default</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="destructive">Destructive</Button>
					<Button variant="link">Link</Button>
					<Button size="sm">Small</Button>
					<Button size="lg">Large</Button>
				</div>
			</section>

			<Separator className="mb-12" />

			{/* Badges */}
			<section className="mb-12">
				<h2 className="mb-6 text-2xl font-semibold">{t("sections.badges")}</h2>
				<div className="flex flex-wrap gap-3">
					<Badge>Default</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="outline">Outline</Badge>
					<Badge variant="info">Info</Badge>
					<Badge variant="success">Success</Badge>
					<Badge variant="warning">Warning</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge variant="info-light">Info Light</Badge>
					<Badge variant="success-light">Success Light</Badge>
					<Badge variant="warning-light">Warning Light</Badge>
				</div>
			</section>

			<Separator className="mb-12" />

			{/* Cards */}
			<section className="mb-12">
				<h2 className="mb-6 text-2xl font-semibold">{t("sections.cards")}</h2>
				<div className="grid gap-6 sm:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>{t("sampleCard.title")}</CardTitle>
							<CardDescription>{t("sampleCard.description")}</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Card content goes here. You can put any content inside a card.
							</p>
						</CardContent>
						<CardFooter>
							<Button size="sm">Action</Button>
						</CardFooter>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>{t("sampleCard.title")}</CardTitle>
							<CardDescription>{t("sampleCard.description")}</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Card content goes here. You can put any content inside a card.
							</p>
						</CardContent>
						<CardFooter className="gap-2">
							<Button size="sm" variant="outline">
								Cancel
							</Button>
							<Button size="sm">Confirm</Button>
						</CardFooter>
					</Card>
				</div>
			</section>

			<Separator className="mb-12" />

			{/* Alerts */}
			<section className="mb-12">
				<h2 className="mb-6 text-2xl font-semibold">{t("sections.alerts")}</h2>
				<div className="grid gap-4">
					<Alert variant="info">
						<Info className="h-4 w-4" />
						<AlertTitle>Info</AlertTitle>
						<AlertDescription>{t("alertMessages.info")}</AlertDescription>
					</Alert>
					<Alert variant="success">
						<CheckCircle2 className="h-4 w-4" />
						<AlertTitle>Success</AlertTitle>
						<AlertDescription>{t("alertMessages.success")}</AlertDescription>
					</Alert>
					<Alert variant="warning">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Warning</AlertTitle>
						<AlertDescription>{t("alertMessages.warning")}</AlertDescription>
					</Alert>
					<Alert variant="destructive">
						<XCircle className="h-4 w-4" />
						<AlertTitle>Destructive</AlertTitle>
						<AlertDescription>{t("alertMessages.destructive")}</AlertDescription>
					</Alert>
				</div>
			</section>

			<Separator className="mb-12" />

			{/* Forms */}
			<section className="mb-12">
				<h2 className="mb-6 text-2xl font-semibold">{t("sections.forms")}</h2>
				<Card className="max-w-md">
					<CardHeader>
						<CardTitle>Login</CardTitle>
						<CardDescription>Enter your credentials to continue.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" placeholder="you@example.com" />
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" placeholder="••••••••" />
						</div>
					</CardContent>
					<CardFooter>
						<Button className="w-full">Sign In</Button>
					</CardFooter>
				</Card>
			</section>
		</div>
	);
}
