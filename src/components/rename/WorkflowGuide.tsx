"use client";

import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function WorkflowGuide({ step, completed }: { step: number; completed: boolean }) {
	const t = useTranslations("rename.guidance");
	const [expanded, setExpanded] = useState<boolean | null>(null);
	const isExpanded = expanded ?? !completed;
	return (
		<div className="shrink-0 border-b bg-muted/20 px-4 py-2">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<ol
					aria-label={t("workflow")}
					className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs"
				>
					{["import", "configure", "review"].map((name, index) => (
						<li
							key={name}
							aria-current={!completed && step === index ? "step" : undefined}
							className={`flex items-center gap-2 ${step === index && !completed ? "font-medium text-primary" : "text-muted-foreground"}`}
						>
							<span
								className={`flex size-5 shrink-0 items-center justify-center rounded-full ${step === index && !completed ? "bg-primary text-primary-foreground" : "bg-muted"}`}
							>
								{completed || index < step ? (
									<Check className="size-3" aria-hidden="true" />
								) : (
									index + 1
								)}
							</span>
							{t(name)}
						</li>
					))}
				</ol>
				<Button
					size="xs"
					variant="ghost"
					aria-expanded={isExpanded}
					aria-controls="workflow-help"
					onClick={() => setExpanded(!isExpanded)}
				>
					{t(isExpanded ? "hideGuide" : "showGuide")}
					{isExpanded ? <ChevronUp /> : <ChevronDown />}
				</Button>
			</div>
			<p
				id="workflow-help"
				hidden={!isExpanded}
				className="mt-2 text-xs leading-relaxed text-muted-foreground"
			>
				{t(`stepHelp${step}`)}
			</p>
		</div>
	);
}
