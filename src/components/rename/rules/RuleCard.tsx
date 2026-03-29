import { Reorder, useDragControls } from "framer-motion";
import { Copy, GripVertical, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { RenameRule } from "@/lib/rename/types";
import { CaseStyleEditor } from "./CaseStyleEditor";
import { CustomJsEditor } from "./CustomJsEditor";
import {
	RULE_BADGE_COLORS,
	RULE_BG_COLORS,
	RULE_COLORS,
	RULE_HEADER_COLORS,
	RULE_ICON_COLORS,
	RULE_ICONS,
} from "./constants";
import { FindReplaceEditor } from "./FindReplaceEditor";
import { InsertEditor } from "./InsertEditor";
import { RegexEditor } from "./RegexEditor";
import { RemoveCleanupEditor } from "./RemoveCleanupEditor";
import { SequenceEditor } from "./SequenceEditor";

interface RuleCardProps {
	rule: RenameRule;
	index: number;
	onUpdate: (u: Partial<RenameRule>) => void;
	onRemove: () => void;
	onClone: () => void;
	hasMetadata?: boolean;
}

export function RuleCard({ rule, index, onUpdate, onRemove, onClone, hasMetadata }: RuleCardProps) {
	const t = useTranslations("rename.rules");
	const dragControls = useDragControls();
	const rc = rule.ruleConfig;
	const colorClass = RULE_COLORS[rc.type];
	const bgClass = RULE_BG_COLORS[rc.type];
	const headerBgClass = RULE_HEADER_COLORS[rc.type];
	const iconColorClass = RULE_ICON_COLORS[rc.type];
	const badgeColorClass = RULE_BADGE_COLORS[rc.type];
	const IconComponent = RULE_ICONS[rc.type];

	const updateConfig = <T,>(partial: Partial<T>) => {
		onUpdate({
			ruleConfig: {
				...rc,
				config: { ...rc.config, ...partial },
			} as RenameRule["ruleConfig"],
		});
	};

	return (
		<Reorder.Item
			value={rule}
			dragListener={false}
			dragControls={dragControls}
			className="list-none"
		>
			<Card
				className={`border-l-2 ${colorClass} ${bgClass} transition-all duration-200 shadow-sm ${!rule.enabled ? "opacity-40" : "hover:shadow-md"}`}
			>
				<CardHeader
					className={`flex flex-row items-center gap-1.5 px-2.5 py-1.5 space-y-0 rounded-tr-lg ${headerBgClass}`}
				>
					<GripVertical
						className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab hover:text-muted-foreground active:cursor-grabbing transition-colors touch-none"
						onPointerDown={(e) => dragControls.start(e)}
					/>
					<span
						className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full ${badgeColorClass} text-[10px] font-bold text-white leading-none px-1`}
					>
						{index + 1}
					</span>
					<IconComponent className={`h-3.5 w-3.5 ${iconColorClass}`} />
					<span className="text-xs font-semibold flex-1">{t(`types.${rc.type}`)}</span>
					<Switch
						checked={rule.enabled}
						onCheckedChange={(v) => onUpdate({ enabled: v })}
						className="scale-75"
					/>
					<Button
						variant="ghost"
						size="icon"
						className="h-5.5 w-5.5 opacity-50 hover:opacity-100 transition-opacity"
						onClick={onClone}
					>
						<Copy className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-5.5 w-5.5 text-muted-foreground hover:text-destructive transition-colors"
						onClick={onRemove}
					>
						<Trash2 className="h-3 w-3" />
					</Button>
				</CardHeader>
				<CardContent className="px-2.5 pb-2 pt-1.5 space-y-1.5">
					{rc.type === "findReplace" && (
						<FindReplaceEditor config={rc.config} onChange={updateConfig} />
					)}
					{rc.type === "insert" && (
						<InsertEditor config={rc.config} onChange={updateConfig} hasMetadata={hasMetadata} />
					)}
					{rc.type === "sequence" && (
						<SequenceEditor config={rc.config} onChange={updateConfig} hasMetadata={hasMetadata} />
					)}
					{rc.type === "caseStyle" && (
						<CaseStyleEditor config={rc.config} onChange={updateConfig} />
					)}
					{rc.type === "regex" && <RegexEditor config={rc.config} onChange={updateConfig} />}
					{rc.type === "customJs" && (
						<CustomJsEditor ruleId={rule.id} config={rc.config} onChange={updateConfig} />
					)}
					{rc.type === "removeCleanup" && (
						<RemoveCleanupEditor config={rc.config} onChange={updateConfig} />
					)}
				</CardContent>
			</Card>
		</Reorder.Item>
	);
}
