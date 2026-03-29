import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FindReplaceConfig } from "@/lib/rename/types";

interface FindReplaceEditorProps {
	config: FindReplaceConfig;
	onChange: (c: Partial<FindReplaceConfig>) => void;
}

export function FindReplaceEditor({ config, onChange }: FindReplaceEditorProps) {
	const t = useTranslations("rename.rules.findReplace");
	return (
		<div className="space-y-1.5">
			<div className="flex items-center gap-1.5">
				<Checkbox
					checked={config.usePosition}
					onCheckedChange={(v) => onChange({ usePosition: !!v })}
					className="h-3.5 w-3.5"
				/>
				<Label className="text-[11px] text-muted-foreground">{t("usePosition")}</Label>
			</div>
			{config.usePosition ? (
				<div className="grid grid-cols-2 gap-1.5">
					<div className="space-y-0.5">
						<Label className="text-[11px] text-muted-foreground">{t("position")}</Label>
						<Input
							className="h-7 text-xs"
							type="number"
							value={config.positionStart}
							onChange={(e) => onChange({ positionStart: +e.target.value })}
						/>
					</div>
					<div className="space-y-0.5">
						<Label className="text-[11px] text-muted-foreground">{t("count")}</Label>
						<Input
							className="h-7 text-xs"
							type="number"
							value={config.positionCount}
							onChange={(e) => onChange({ positionCount: +e.target.value })}
						/>
					</div>
					<div className="col-span-2 flex items-center gap-1.5">
						<Checkbox
							checked={config.fromEnd}
							onCheckedChange={(v) => onChange({ fromEnd: !!v })}
							className="h-3.5 w-3.5"
						/>
						<Label className="text-[11px] text-muted-foreground">{t("fromEnd")}</Label>
					</div>
					<div className="col-span-2 space-y-0.5">
						<Label className="text-[11px] text-muted-foreground">{t("replace")}</Label>
						<Input
							className="h-7 text-xs"
							value={config.replace}
							onChange={(e) => onChange({ replace: e.target.value })}
						/>
					</div>
				</div>
			) : (
				<div className="space-y-1.5">
					<div className="space-y-0.5">
						<Label className="text-[11px] text-muted-foreground">{t("find")}</Label>
						<Input
							className="h-7 text-xs"
							value={config.find}
							onChange={(e) => onChange({ find: e.target.value })}
						/>
					</div>
					<div className="space-y-0.5">
						<Label className="text-[11px] text-muted-foreground">{t("replace")}</Label>
						<Input
							className="h-7 text-xs"
							value={config.replace}
							onChange={(e) => onChange({ replace: e.target.value })}
						/>
					</div>
					<div className="flex gap-3">
						<div className="flex items-center gap-1.5">
							<Checkbox
								checked={config.caseSensitive}
								onCheckedChange={(v) => onChange({ caseSensitive: !!v })}
								className="h-3.5 w-3.5"
							/>
							<Label className="text-[11px] text-muted-foreground">{t("caseSensitive")}</Label>
						</div>
						<div className="flex items-center gap-1.5">
							<Checkbox
								checked={config.matchAll}
								onCheckedChange={(v) => onChange({ matchAll: !!v })}
								className="h-3.5 w-3.5"
							/>
							<Label className="text-[11px] text-muted-foreground">{t("matchAll")}</Label>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
