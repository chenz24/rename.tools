import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { RemoveCleanupConfig } from "@/lib/rename/types";

interface RemoveCleanupEditorProps {
	config: RemoveCleanupConfig;
	onChange: (c: Partial<RemoveCleanupConfig>) => void;
}

export function RemoveCleanupEditor({ config, onChange }: RemoveCleanupEditorProps) {
	const t = useTranslations("rename.rules.removeCleanup");
	return (
		<div className="space-y-1.5">
			<div className="space-y-0.5">
				<Label className="text-[11px] text-muted-foreground">{t("mode")}</Label>
				<Select
					value={config.mode}
					onValueChange={(v) => onChange({ mode: v as RemoveCleanupConfig["mode"] })}
				>
					<SelectTrigger className="h-7 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="chars">{t("chars")}</SelectItem>
						<SelectItem value="range">{t("range")}</SelectItem>
						<SelectItem value="cleanup">{t("cleanup")}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{config.mode === "chars" && (
				<div className="space-y-1.5">
					<div className="space-y-0.5">
						<Label className="text-[11px] text-muted-foreground">{t("direction")}</Label>
						<Select
							value={config.direction}
							onValueChange={(v) => onChange({ direction: v as RemoveCleanupConfig["direction"] })}
						>
							<SelectTrigger className="h-7 text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="start">{t("fromStart")}</SelectItem>
								<SelectItem value="end">{t("fromEnd")}</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-0.5">
						<Label className="text-[11px] text-muted-foreground">{t("count")}</Label>
						<Input
							className="h-7 text-xs"
							type="number"
							min="0"
							value={config.count}
							onChange={(e) => onChange({ count: +e.target.value })}
						/>
					</div>
				</div>
			)}

			{config.mode === "range" && (
				<div className="grid grid-cols-2 gap-1.5">
					<div className="space-y-0.5">
						<Label className="text-[11px] text-muted-foreground">{t("rangeStart")}</Label>
						<Input
							className="h-7 text-xs"
							type="number"
							min="0"
							value={config.rangeStart}
							onChange={(e) => onChange({ rangeStart: +e.target.value })}
						/>
					</div>
					<div className="space-y-0.5">
						<Label className="text-[11px] text-muted-foreground">{t("rangeEnd")}</Label>
						<Input
							className="h-7 text-xs"
							type="number"
							min="0"
							value={config.rangeEnd}
							onChange={(e) => onChange({ rangeEnd: +e.target.value })}
						/>
					</div>
				</div>
			)}

			{config.mode === "cleanup" && (
				<div className="space-y-1.5">
					<Label className="text-[11px] text-muted-foreground">{t("cleanup")}</Label>
					<div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
						<div className="flex items-center gap-1.5">
							<Checkbox
								checked={config.removeDigits}
								onCheckedChange={(v) => onChange({ removeDigits: !!v })}
								className="h-3.5 w-3.5"
							/>
							<Label className="text-[11px] text-muted-foreground">{t("removeDigits")}</Label>
						</div>
						<div className="flex items-center gap-1.5">
							<Checkbox
								checked={config.removeSymbols}
								onCheckedChange={(v) => onChange({ removeSymbols: !!v })}
								className="h-3.5 w-3.5"
							/>
							<Label className="text-[11px] text-muted-foreground">{t("removeSymbols")}</Label>
						</div>
						<div className="flex items-center gap-1.5">
							<Checkbox
								checked={config.removeSpaces}
								onCheckedChange={(v) => onChange({ removeSpaces: !!v })}
								className="h-3.5 w-3.5"
							/>
							<Label className="text-[11px] text-muted-foreground">{t("removeSpaces")}</Label>
						</div>
						<div className="flex items-center gap-1.5">
							<Checkbox
								checked={config.removeChinese}
								onCheckedChange={(v) => onChange({ removeChinese: !!v })}
								className="h-3.5 w-3.5"
							/>
							<Label className="text-[11px] text-muted-foreground">{t("removeChinese")}</Label>
						</div>
						<div className="flex items-center gap-1.5">
							<Checkbox
								checked={config.removeEnglish}
								onCheckedChange={(v) => onChange({ removeEnglish: !!v })}
								className="h-3.5 w-3.5"
							/>
							<Label className="text-[11px] text-muted-foreground">{t("removeEnglish")}</Label>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
