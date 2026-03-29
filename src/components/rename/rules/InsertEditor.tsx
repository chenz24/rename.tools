import { useTranslations } from "next-intl";
import {
	COMMON_VARIABLES,
	METADATA_VARIABLES,
	TemplateEditor,
} from "@/components/rename/TemplateEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { InsertConfig } from "@/lib/rename/types";

interface InsertEditorProps {
	config: InsertConfig;
	onChange: (c: Partial<InsertConfig>) => void;
	hasMetadata?: boolean;
}

export function InsertEditor({ config, onChange, hasMetadata }: InsertEditorProps) {
	const t = useTranslations("rename.rules.insert");
	const tTemplate = useTranslations("rename.templateEditor");
	const variables = hasMetadata ? [...COMMON_VARIABLES, ...METADATA_VARIABLES] : COMMON_VARIABLES;
	return (
		<div className="space-y-1.5">
			<div className="space-y-0.5">
				<Label className="text-[11px] text-muted-foreground">{t("text")}</Label>
				<TemplateEditor
					value={config.text || ""}
					onChange={(text) => onChange({ text })}
					variables={variables}
					placeholder={tTemplate("placeholder")}
				/>
			</div>
			<div className="space-y-0.5">
				<Label className="text-[11px] text-muted-foreground">{t("position")}</Label>
				<Select
					value={config.position}
					onValueChange={(v) => onChange({ position: v as InsertConfig["position"] })}
				>
					<SelectTrigger className="h-7 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="start">{t("atStart")}</SelectItem>
						<SelectItem value="end">{t("atEnd")}</SelectItem>
						<SelectItem value="index">{t("atIndex")}</SelectItem>
					</SelectContent>
				</Select>
			</div>
			{config.position === "index" && (
				<div className="space-y-0.5">
					<Label className="text-[11px] text-muted-foreground">{t("index")}</Label>
					<Input
						className="h-7 text-xs"
						type="number"
						value={config.index}
						onChange={(e) => onChange({ index: +e.target.value })}
					/>
				</div>
			)}
		</div>
	);
}
