import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RegexConfig } from "@/lib/rename/types";

interface RegexEditorProps {
	config: RegexConfig;
	onChange: (c: Partial<RegexConfig>) => void;
}

export function RegexEditor({ config, onChange }: RegexEditorProps) {
	const t = useTranslations("rename.rules.regex");
	return (
		<div className="space-y-1.5">
			<div className="space-y-0.5">
				<Label className="text-[11px] text-muted-foreground">{t("pattern")}</Label>
				<Input
					className="h-7 text-xs font-mono"
					value={config.pattern}
					onChange={(e) => onChange({ pattern: e.target.value })}
				/>
			</div>
			<div className="space-y-0.5">
				<Label className="text-[11px] text-muted-foreground">{t("replacement")}</Label>
				<Input
					className="h-7 text-xs font-mono"
					value={config.replacement}
					onChange={(e) => onChange({ replacement: e.target.value })}
				/>
			</div>
			<div className="space-y-0.5">
				<Label className="text-[11px] text-muted-foreground">
					{t("flags")} <span className="opacity-60">({t("flagsHint")})</span>
				</Label>
				<Input
					className="h-7 text-xs font-mono w-20"
					value={config.flags}
					onChange={(e) => onChange({ flags: e.target.value })}
				/>
			</div>
		</div>
	);
}
