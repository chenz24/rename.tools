"use client";

import { Reorder } from "framer-motion";
import {
	BookTemplate,
	FileType,
	Layers,
	Maximize2,
	Plus,
	Save,
	Settings2,
	Trash2,
	Type,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { SavePresetDialog } from "@/components/rename/SavePresetDialog";
import { TemplateLibrary } from "@/components/rename/TemplateLibrary";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type {
	ExtensionScope,
	PresetCategory,
	RenameRule,
	RuleConfig,
	RuleType,
} from "@/lib/rename/types";
import { RULE_TYPES } from "./constants";
import { RuleCard } from "./RuleCard";

interface Props {
	rules: RenameRule[];
	extensionScope: ExtensionScope;
	onAddRule: (type: RuleType) => void;
	onAddRulesFromTemplate: (configs: RuleConfig[]) => void;
	onUpdateRule: (id: string, updates: Partial<RenameRule>) => void;
	onRemoveRule: (id: string) => void;
	onReorderRules: (newOrder: RenameRule[]) => void;
	onCloneRule: (id: string) => void;
	onSetExtensionScope: (v: ExtensionScope) => void;
	onClearRules: () => void;
	onSavePreset: (
		name: string,
		options: { description?: string; tags?: string[]; category?: PresetCategory },
	) => void;
	hasMetadata?: boolean;
}

export function RulePanel({
	rules,
	extensionScope,
	onAddRule,
	onAddRulesFromTemplate,
	onUpdateRule,
	onRemoveRule,
	onReorderRules,
	onCloneRule,
	onSetExtensionScope,
	onClearRules,
	onSavePreset,
	hasMetadata,
}: Props) {
	const t = useTranslations("rename.rules");

	return (
		<div className="flex h-full flex-col">
			{/* Panel Header */}
			<div className="panel-header border-b bg-muted/30 justify-between">
				<div className="flex items-center gap-2">
					<Layers className="h-4 w-4 text-primary" />
					<h2 className="text-foreground">{t("title")}</h2>
				</div>
				<div className="flex items-center gap-1">
					<TemplateLibrary
						onApply={onAddRulesFromTemplate}
						trigger={
							<Button size="sm" variant="outline" className="gap-1 text-xs">
								<BookTemplate className="h-3.5 w-3.5" /> {t("templateTitle")}
							</Button>
						}
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="sm"
								className="gap-1.5 text-xs brand-gradient text-white border-0 shadow-sm hover:shadow-md transition-shadow"
							>
								<Plus className="h-3.5 w-3.5" /> {t("addRule")}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							{RULE_TYPES.map((type) => (
								<DropdownMenuItem key={type} onClick={() => onAddRule(type)}>
									{t(`types.${type}`)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Extension Handling */}
			<div className="flex items-center gap-2 border-b px-3 py-1.5 bg-muted/10">
				<Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
				<Label className="text-xs">{t("extensionScope")}</Label>
				<ToggleGroup
					type="single"
					value={extensionScope}
					onValueChange={(v) => v && onSetExtensionScope(v as ExtensionScope)}
					className="ml-auto"
				>
					<ToggleGroupItem value="name" className="h-7 px-2.5 text-xs gap-1">
						<Type className="h-3.5 w-3.5" />
						{t("scopeName")}
					</ToggleGroupItem>
					<ToggleGroupItem value="extension" className="h-7 px-2.5 text-xs gap-1">
						<FileType className="h-3.5 w-3.5" />
						{t("scopeExtension")}
					</ToggleGroupItem>
					<ToggleGroupItem value="full" className="h-7 px-2.5 text-xs gap-1">
						<Maximize2 className="h-3.5 w-3.5" />
						{t("scopeFull")}
					</ToggleGroupItem>
				</ToggleGroup>
			</div>

			{/* Rules List */}
			<ScrollArea className="flex-1">
				{rules.length === 0 ? (
					<div className="flex flex-col items-center gap-3 py-10 text-center p-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<Layers className="h-6 w-6 text-muted-foreground" />
						</div>
						<p className="text-xs text-muted-foreground">{t("noRules")}</p>
					</div>
				) : (
					<Reorder.Group
						axis="y"
						values={rules}
						onReorder={onReorderRules}
						className="space-y-3 p-3"
						layoutScroll
						style={{ overflowY: "scroll" }}
					>
						{rules.map((rule, idx) => (
							<RuleCard
								key={rule.id}
								rule={rule}
								index={idx}
								hasMetadata={hasMetadata}
								onUpdate={(u) => onUpdateRule(rule.id, u)}
								onRemove={() => onRemoveRule(rule.id)}
								onClone={() => onCloneRule(rule.id)}
							/>
						))}
					</Reorder.Group>
				)}
			</ScrollArea>

			{/* Bottom Action Bar */}
			<div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-3 py-2.5">
				<Button
					variant="outline"
					size="sm"
					className="gap-1 text-xs"
					onClick={onClearRules}
					disabled={rules.length === 0}
				>
					<Trash2 className="h-3.5 w-3.5" /> {t("clear")}
				</Button>
				<SavePresetDialog
					rules={rules.filter((r) => r.enabled).map((r) => r.ruleConfig)}
					onSave={onSavePreset}
					trigger={
						<Button
							size="sm"
							variant="outline"
							className="gap-1 text-xs"
							disabled={rules.length === 0}
						>
							<Save className="h-3.5 w-3.5" /> {t("savePreset")}
						</Button>
					}
				/>
			</div>
		</div>
	);
}
