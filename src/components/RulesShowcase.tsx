"use client";

import { Code2, Hash, LetterText, Regex, Replace, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { ShowcaseTabs } from "./ShowcaseTabs";

const RULE_ITEMS = [
	{
		id: "findReplace",
		icon: Replace,
		color: "text-rose-500",
		bgColor: "bg-rose-500/10",
		borderColor: "border-rose-500",
		screenshot: "/screenshots/screenshot_find_replace.png",
	},
	{
		id: "regex",
		icon: Regex,
		color: "text-blue-500",
		bgColor: "bg-blue-500/10",
		borderColor: "border-blue-500",
		screenshot: "/screenshots/screenshot_regex.png",
	},
	{
		id: "sequence",
		icon: Hash,
		color: "text-violet-500",
		bgColor: "bg-violet-500/10",
		borderColor: "border-violet-500",
		screenshot: "/screenshots/screenshot_sequence.png",
	},
	{
		id: "caseStyle",
		icon: LetterText,
		color: "text-emerald-500",
		bgColor: "bg-emerald-500/10",
		borderColor: "border-emerald-500",
		screenshot: "/screenshots/screenshot_case_style.png",
	},
	{
		id: "customJs",
		icon: Code2,
		color: "text-orange-500",
		bgColor: "bg-orange-500/10",
		borderColor: "border-orange-500",
		screenshot: "/product_screenshot.png",
	},
	{
		id: "templates",
		icon: Sparkles,
		color: "text-pink-500",
		bgColor: "bg-pink-500/10",
		borderColor: "border-pink-500",
		screenshot: "/product_screenshot.png",
	},
];

export function RulesShowcase() {
	const t = useTranslations("home.rulesShowcase");
	const items = RULE_ITEMS.map((item) => ({
		...item,
		tab: t(`${item.id}.tab`),
		title: t(`${item.id}.title`),
		desc: t(`${item.id}.desc`),
	}));

	return <ShowcaseTabs badge={t("badge")} title={t("title")} desc={t("desc")} items={items} />;
}
