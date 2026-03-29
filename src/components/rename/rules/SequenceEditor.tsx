import { useTranslations } from "next-intl";
import {
	COMMON_VARIABLES,
	METADATA_VARIABLES,
	TemplateEditor,
} from "@/components/rename/TemplateEditor";
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
import type { SequenceConfig } from "@/lib/rename/types";

interface SequenceEditorProps {
	config: SequenceConfig;
	onChange: (c: Partial<SequenceConfig>) => void;
	hasMetadata?: boolean;
}

export function SequenceEditor({ config, onChange, hasMetadata }: SequenceEditorProps) {
	const t = useTranslations("rename.rules.sequence");
	const variables = hasMetadata ? [...COMMON_VARIABLES, ...METADATA_VARIABLES] : COMMON_VARIABLES;
	return (
		<div className="space-y-1.5">
			{/* Sequence type */}
			<div className="space-y-0.5">
				<Label className="text-[11px] text-muted-foreground">{t("seqType")}</Label>
				<Select
					value={config.seqType || "numeric"}
					onValueChange={(v) => onChange({ seqType: v as SequenceConfig["seqType"] })}
				>
					<SelectTrigger className="h-7 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="numeric">{t("numeric")}</SelectItem>
						<SelectItem value="alpha">{t("alpha")}</SelectItem>
						<SelectItem value="roman">{t("roman")}</SelectItem>
					</SelectContent>
				</Select>
			</div>
			{/* Start / Step / Padding */}
			<div className="grid grid-cols-3 gap-x-1.5">
				<div className="space-y-0.5">
					<Label className="text-[11px] text-muted-foreground">{t("start")}</Label>
					<Input
						className="h-7 text-xs"
						type="number"
						value={config.start}
						onChange={(e) => onChange({ start: +e.target.value })}
					/>
				</div>
				<div className="space-y-0.5">
					<Label className="text-[11px] text-muted-foreground">{t("step")}</Label>
					<Input
						className="h-7 text-xs"
						type="number"
						value={config.step}
						onChange={(e) => onChange({ step: +e.target.value })}
					/>
				</div>
				<div className="space-y-0.5">
					<Label className="text-[11px] text-muted-foreground">{t("padding")}</Label>
					<Input
						className="h-7 text-xs"
						type="number"
						value={config.padding}
						onChange={(e) => onChange({ padding: +e.target.value })}
						disabled={(config.seqType || "numeric") !== "numeric"}
					/>
				</div>
			</div>
			{/* Position (only when no template) */}
			{!config.template && (
				<div className="space-y-0.5">
					<Label className="text-[11px] text-muted-foreground">{t("position")}</Label>
					<Select
						value={config.position}
						onValueChange={(v) => onChange({ position: v as SequenceConfig["position"] })}
					>
						<SelectTrigger className="h-7 text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="start">{t("atStart")}</SelectItem>
							<SelectItem value="end">{t("atEnd")}</SelectItem>
							<SelectItem value="replaceAll">{t("replaceAll")}</SelectItem>
						</SelectContent>
					</Select>
				</div>
			)}
			{/* Template */}
			<div className="space-y-0.5">
				<Label className="text-[11px] text-muted-foreground">{t("template")}</Label>
				<TemplateEditor
					value={config.template || ""}
					onChange={(template) => onChange({ template })}
					variables={variables}
					placeholder={t("templatePlaceholder")}
				/>
			</div>

			{/* Scope */}
			<div className="space-y-0.5">
				<Label className="text-[11px] text-muted-foreground">{t("scope")}</Label>
				<Select
					value={config.scope || "global"}
					onValueChange={(v) => onChange({ scope: v as SequenceConfig["scope"] })}
				>
					<SelectTrigger className="h-7 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="global">{t("scopeGlobal")}</SelectItem>
						<SelectItem value="perFolder">{t("scopePerFolder")}</SelectItem>
						<SelectItem value="perExtension">{t("scopePerExtension")}</SelectItem>
						<SelectItem value="perCategory">{t("scopePerCategory")}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Sort before numbering */}
			<div className="space-y-1">
				<div className="flex items-center gap-1.5">
					<Checkbox
						checked={config.sortBeforeNumbering ?? false}
						onCheckedChange={(v) => onChange({ sortBeforeNumbering: !!v })}
						className="h-3.5 w-3.5"
					/>
					<Label className="text-[11px] text-muted-foreground">{t("sortBeforeNumbering")}</Label>
				</div>
				{config.sortBeforeNumbering && (
					<div className="grid grid-cols-2 gap-x-1.5">
						<div className="space-y-0.5">
							<Label className="text-[11px] text-muted-foreground">{t("sortBy")}</Label>
							<Select
								value={config.sortBy || "name"}
								onValueChange={(v) => onChange({ sortBy: v as SequenceConfig["sortBy"] })}
							>
								<SelectTrigger className="h-7 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="name">{t("sortByName")}</SelectItem>
									<SelectItem value="size">{t("sortBySize")}</SelectItem>
									<SelectItem value="modified">{t("sortByModified")}</SelectItem>
									<SelectItem value="extension">{t("sortByExtension")}</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-0.5">
							<Label className="text-[11px] text-muted-foreground">{t("sortOrder")}</Label>
							<Select
								value={config.sortOrder || "asc"}
								onValueChange={(v) => onChange({ sortOrder: v as SequenceConfig["sortOrder"] })}
							>
								<SelectTrigger className="h-7 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="asc">{t("sortAsc")}</SelectItem>
									<SelectItem value="desc">{t("sortDesc")}</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{(config.sortBy || "name") === "name" && (
							<div className="col-span-2 flex items-center gap-1.5 mt-0.5">
								<Checkbox
									checked={config.naturalSort ?? true}
									onCheckedChange={(v) => onChange({ naturalSort: !!v })}
									className="h-3.5 w-3.5"
								/>
								<Label className="text-[11px] text-muted-foreground">{t("naturalSort")}</Label>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Preserve original numbers */}
			<div className="space-y-1">
				<div className="flex items-center gap-1.5">
					<Checkbox
						checked={config.preserveOriginal ?? false}
						onCheckedChange={(v) => onChange({ preserveOriginal: !!v })}
						className="h-3.5 w-3.5"
					/>
					<Label className="text-[11px] text-muted-foreground">{t("preserveOriginal")}</Label>
				</div>
				{config.preserveOriginal && (
					<div className="space-y-0.5">
						<Label className="text-[11px] text-muted-foreground">{t("preservePattern")}</Label>
						<Input
							className="h-7 text-xs font-mono"
							value={config.preservePattern || "(\\d+)"}
							onChange={(e) => onChange({ preservePattern: e.target.value })}
							placeholder="(\\d+)"
						/>
						<p className="text-[10px] text-muted-foreground/70 leading-tight">
							{t("preservePatternHint")}
						</p>
					</div>
				)}
			</div>

			{/* Hierarchical numbering */}
			{(config.scope || "global") !== "global" && (
				<div className="space-y-1">
					<div className="flex items-center gap-1.5">
						<Checkbox
							checked={config.hierarchical ?? false}
							onCheckedChange={(v) => onChange({ hierarchical: !!v })}
							className="h-3.5 w-3.5"
						/>
						<Label className="text-[11px] text-muted-foreground">{t("hierarchical")}</Label>
					</div>
					{config.hierarchical && (
						<div className="space-y-0.5">
							<Label className="text-[11px] text-muted-foreground">{t("hierarchySeparator")}</Label>
							<Select
								value={config.hierarchySeparator || "."}
								onValueChange={(v) =>
									onChange({ hierarchySeparator: v as SequenceConfig["hierarchySeparator"] })
								}
							>
								<SelectTrigger className="h-7 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value=".">. (dot)</SelectItem>
									<SelectItem value="-">- (dash)</SelectItem>
									<SelectItem value="_">_ (underscore)</SelectItem>
								</SelectContent>
							</Select>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
