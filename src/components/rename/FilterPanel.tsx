"use client";

import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { FilterCondition, FilterField, FilterOperator } from "@/lib/rename/types";

interface Props {
	conditions: FilterCondition[];
	logic: "AND" | "OR";
	onAddCondition: () => void;
	onUpdateCondition: (id: string, updates: Partial<FilterCondition>) => void;
	onRemoveCondition: (id: string) => void;
	onSetLogic: (logic: "AND" | "OR") => void;
	onClearAll: () => void;
}

export function FilterPanel({
	conditions,
	logic,
	onAddCondition,
	onUpdateCondition,
	onRemoveCondition,
	onSetLogic,
	onClearAll,
}: Props) {
	const t = useTranslations("rename.filter");

	const fieldOptions: { value: FilterField; label: string }[] = [
		{ value: "name", label: t("fieldName") },
		{ value: "extension", label: t("fieldExtension") },
		{ value: "size", label: t("fieldSize") },
		{ value: "modified", label: t("fieldModified") },
	];

	const textOperators: { value: FilterOperator; label: string }[] = [
		{ value: "contains", label: t("opContains") },
		{ value: "notContains", label: t("opNotContains") },
		{ value: "equals", label: t("opEquals") },
		{ value: "notEquals", label: t("opNotEquals") },
		{ value: "startsWith", label: t("opStartsWith") },
		{ value: "endsWith", label: t("opEndsWith") },
		{ value: "regex", label: t("opRegex") },
	];

	const numberOperators: { value: FilterOperator; label: string }[] = [
		{ value: "greaterThan", label: t("opGreaterThan") },
		{ value: "lessThan", label: t("opLessThan") },
		{ value: "equals", label: t("opEquals") },
	];

	const getOperatorOptions = (field: FilterField) => {
		if (field === "size" || field === "modified") {
			return numberOperators;
		}
		return textOperators;
	};

	const getPlaceholder = (field: FilterField) => {
		switch (field) {
			case "name":
				return t("placeholderName");
			case "extension":
				return t("placeholderExtension");
			case "size":
				return t("placeholderSize");
			case "modified":
				return t("placeholderModified");
			default:
				return t("valuePlaceholder");
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-sm font-medium">{t("title")}</h3>
				<div className="flex items-center gap-1">
					{conditions.length > 0 && (
						<Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 px-2 text-xs">
							{t("clearAll")}
						</Button>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={onAddCondition}
						className="h-7 px-2 gap-1 text-xs"
					>
						<Plus className="h-3.5 w-3.5" />
						{t("addCondition")}
					</Button>
				</div>
			</div>

			{conditions.length === 0 && (
				<p className="text-xs text-muted-foreground py-2">{t("noConditions")}</p>
			)}

			<div className="space-y-2">
				{conditions.map((condition, index) => (
					<div key={condition.id} className="flex items-center gap-2">
						<div className="flex items-center gap-2 flex-1 min-w-0">
							{index === 0 ? (
								<span className="text-xs text-muted-foreground w-[60px] shrink-0 text-center">
									{t("where")}
								</span>
							) : (
								<Select value={logic} onValueChange={(v) => onSetLogic(v as "AND" | "OR")}>
									<SelectTrigger size="sm" className="h-8 w-[60px] shrink-0 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="AND">{t("logicAnd")}</SelectItem>
										<SelectItem value="OR">{t("logicOr")}</SelectItem>
									</SelectContent>
								</Select>
							)}

							<Select
								value={condition.field}
								onValueChange={(v) => {
									const newField = v as FilterField;
									const operators = getOperatorOptions(newField);
									const validOperator = operators.find((op) => op.value === condition.operator)
										? condition.operator
										: operators[0].value;
									onUpdateCondition(condition.id, { field: newField, operator: validOperator });
								}}
							>
								<SelectTrigger size="sm" className="h-8 w-[100px] shrink-0 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{fieldOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={condition.operator}
								onValueChange={(v) =>
									onUpdateCondition(condition.id, { operator: v as FilterOperator })
								}
							>
								<SelectTrigger size="sm" className="h-8 w-[100px] shrink-0 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{getOperatorOptions(condition.field).map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Input
								value={condition.value}
								onChange={(e) => onUpdateCondition(condition.id, { value: e.target.value })}
								placeholder={getPlaceholder(condition.field)}
								type={condition.field === "modified" ? "date" : "text"}
								className="h-8 text-xs flex-1 min-w-[120px]"
							/>

							{(condition.field === "name" || condition.field === "extension") && (
								<div className="flex items-center gap-1 px-2 border-l">
									<Checkbox
										checked={condition.caseSensitive}
										onCheckedChange={(checked) =>
											onUpdateCondition(condition.id, { caseSensitive: !!checked })
										}
										className="h-3.5 w-3.5"
									/>
									<span className="text-xs text-muted-foreground whitespace-nowrap">
										{t("caseSensitive")}
									</span>
								</div>
							)}
						</div>

						<Button
							variant="ghost"
							size="sm"
							onClick={() => onRemoveCondition(condition.id)}
							className="h-8 w-8 p-0 shrink-0"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
