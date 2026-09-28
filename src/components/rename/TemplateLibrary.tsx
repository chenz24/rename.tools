"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { ExtensionScope, RuleConfig } from "@/lib/rename/types";

function LoadingLibrary() {
	const t = useTranslations("rename.rules");
	return (
		<DialogContent className="sm:max-w-2xl">
			<DialogHeader>
				<DialogTitle>{t("templateTitle")}</DialogTitle>
			</DialogHeader>
			<div className="h-64 animate-pulse rounded-md bg-muted" aria-busy="true" />
		</DialogContent>
	);
}

const TemplateLibraryContent = dynamic(
	() => import("./TemplateLibraryContent").then((m) => m.TemplateLibraryContent),
	{ loading: LoadingLibrary },
);

export function TemplateLibrary({
	onApply,
	trigger,
}: {
	onApply: (rules: RuleConfig[], scope?: ExtensionScope) => void;
	trigger: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			{open && <TemplateLibraryContent onApply={onApply} onClose={() => setOpen(false)} />}
		</Dialog>
	);
}
