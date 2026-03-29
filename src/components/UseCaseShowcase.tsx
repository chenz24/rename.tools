"use client";

import { Camera, Code2, FileVideo, FolderArchive, Music } from "lucide-react";
import { useTranslations } from "next-intl";
import { ShowcaseTabs } from "./ShowcaseTabs";

const USE_CASES = [
	{
		id: "photos",
		icon: Camera,
		color: "text-rose-500",
		bgColor: "bg-rose-500/10",
		borderColor: "border-rose-500",
		screenshot: "/product_screenshot.png",
	},
	{
		id: "videos",
		icon: FileVideo,
		color: "text-blue-500",
		bgColor: "bg-blue-500/10",
		borderColor: "border-blue-500",
		screenshot: "/product_screenshot.png",
	},
	{
		id: "music",
		icon: Music,
		color: "text-violet-500",
		bgColor: "bg-violet-500/10",
		borderColor: "border-violet-500",
		screenshot: "/product_screenshot.png",
	},
	{
		id: "code",
		icon: Code2,
		color: "text-emerald-500",
		bgColor: "bg-emerald-500/10",
		borderColor: "border-emerald-500",
		screenshot: "/product_screenshot.png",
	},
	{
		id: "archives",
		icon: FolderArchive,
		color: "text-orange-500",
		bgColor: "bg-orange-500/10",
		borderColor: "border-orange-500",
		screenshot: "/product_screenshot.png",
	},
];

export function UseCaseShowcase() {
	const t = useTranslations("home.useCases");
	const items = USE_CASES.map((item) => ({
		...item,
		tab: t(`${item.id}.tab`),
		title: t(`${item.id}.title`),
		desc: t(`${item.id}.desc`),
	}));

	return <ShowcaseTabs badge={t("badge")} title={t("title")} desc={t("desc")} items={items} />;
}
