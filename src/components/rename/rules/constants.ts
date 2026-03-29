import { ArrowLeftRight, Code2, Eraser, Hash, Regex, TextCursorInput, Type } from "lucide-react";
import type { RuleType } from "@/lib/rename/types";

export const RULE_TYPES: RuleType[] = [
	"findReplace",
	"insert",
	"sequence",
	"caseStyle",
	"regex",
	"customJs",
	"removeCleanup",
];

export const RULE_COLORS: Record<RuleType, string> = {
	findReplace: "border-l-blue-500",
	insert: "border-l-emerald-500",
	sequence: "border-l-amber-500",
	caseStyle: "border-l-violet-500",
	regex: "border-l-rose-500",
	customJs: "border-l-cyan-500",
	removeCleanup: "border-l-orange-500",
};

export const RULE_ICONS: Record<RuleType, React.ElementType> = {
	findReplace: ArrowLeftRight,
	insert: TextCursorInput,
	sequence: Hash,
	caseStyle: Type,
	regex: Regex,
	customJs: Code2,
	removeCleanup: Eraser,
};

export const RULE_BG_COLORS: Record<RuleType, string> = {
	findReplace: "bg-blue-50/60 dark:bg-blue-500/5",
	insert: "bg-emerald-50/60 dark:bg-emerald-500/5",
	sequence: "bg-amber-50/60 dark:bg-amber-500/5",
	caseStyle: "bg-violet-50/60 dark:bg-violet-500/5",
	regex: "bg-rose-50/60 dark:bg-rose-500/5",
	customJs: "bg-cyan-50/60 dark:bg-cyan-500/5",
	removeCleanup: "bg-orange-50/60 dark:bg-orange-500/5",
};

export const RULE_HEADER_COLORS: Record<RuleType, string> = {
	findReplace: "bg-blue-100/60 dark:bg-blue-500/10",
	insert: "bg-emerald-100/60 dark:bg-emerald-500/10",
	sequence: "bg-amber-100/60 dark:bg-amber-500/10",
	caseStyle: "bg-violet-100/60 dark:bg-violet-500/10",
	regex: "bg-rose-100/60 dark:bg-rose-500/10",
	customJs: "bg-cyan-100/60 dark:bg-cyan-500/10",
	removeCleanup: "bg-orange-100/60 dark:bg-orange-500/10",
};

export const RULE_ICON_COLORS: Record<RuleType, string> = {
	findReplace: "text-blue-600 dark:text-blue-400",
	insert: "text-emerald-600 dark:text-emerald-400",
	sequence: "text-amber-600 dark:text-amber-400",
	caseStyle: "text-violet-600 dark:text-violet-400",
	regex: "text-rose-600 dark:text-rose-400",
	customJs: "text-cyan-600 dark:text-cyan-400",
	removeCleanup: "text-orange-600 dark:text-orange-400",
};

export const RULE_BADGE_COLORS: Record<RuleType, string> = {
	findReplace: "bg-blue-500",
	insert: "bg-emerald-500",
	sequence: "bg-amber-500",
	caseStyle: "bg-violet-500",
	regex: "bg-rose-500",
	customJs: "bg-cyan-500",
	removeCleanup: "bg-orange-500",
};
