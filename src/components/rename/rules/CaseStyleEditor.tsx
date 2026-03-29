import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { CaseStyleConfig } from "@/lib/rename/types";

interface CaseStyleEditorProps {
	config: CaseStyleConfig;
	onChange: (c: Partial<CaseStyleConfig>) => void;
}

export function CaseStyleEditor({ config, onChange }: CaseStyleEditorProps) {
	const t = useTranslations("rename.rules.caseStyle");
	const isDeveloperMode = ["camelCase", "PascalCase", "kebab-case", "snake_case"].includes(
		config.mode,
	);

	return (
		<div className="space-y-1.5">
			<div className="space-y-0.5">
				<Label className="text-[11px] text-muted-foreground">{t("mode")}</Label>
				<Select
					value={config.mode}
					onValueChange={(v) => onChange({ mode: v as CaseStyleConfig["mode"] })}
				>
					<SelectTrigger className="h-7 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">—</SelectItem>
						<SelectGroup>
							<SelectLabel>{t("general")}</SelectLabel>
							<SelectItem value="uppercase">{t("uppercase")}</SelectItem>
							<SelectItem value="lowercase">{t("lowercase")}</SelectItem>
							<SelectItem value="titlecase">{t("titlecase")}</SelectItem>
							<SelectItem value="sentencecase">{t("sentencecase")}</SelectItem>
						</SelectGroup>
						<SelectGroup>
							<SelectLabel>{t("developer")}</SelectLabel>
							<SelectItem value="camelCase">{t("camelCase")}</SelectItem>
							<SelectItem value="PascalCase">{t("PascalCase")}</SelectItem>
							<SelectItem value="kebab-case">{t("kebab-case")}</SelectItem>
							<SelectItem value="snake_case">{t("snake_case")}</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			{!isDeveloperMode && (
				<div className="space-y-0.5">
					<Label className="text-[11px] text-muted-foreground">{t("style")}</Label>
					<Select
						value={config.style}
						onValueChange={(v) => onChange({ style: v as CaseStyleConfig["style"] })}
					>
						<SelectTrigger className="h-7 text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">{t("none")}</SelectItem>
							<SelectItem value="spaceToDash">{t("spaceToDash")}</SelectItem>
							<SelectItem value="spaceToUnderscore">{t("spaceToUnderscore")}</SelectItem>
							<SelectItem value="dashToSpace">{t("dashToSpace")}</SelectItem>
							<SelectItem value="underscoreToSpace">{t("underscoreToSpace")}</SelectItem>
						</SelectContent>
					</Select>
				</div>
			)}
		</div>
	);
}
