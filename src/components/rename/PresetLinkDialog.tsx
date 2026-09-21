"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { usePresetsStore } from "@/hooks/usePresetsStore";
import { useRenameStore } from "@/hooks/useRenameStore";
import { type GuideRecipe, getGuideRecipe } from "@/lib/guides/recipes";
import { decodeSharedPreset, type SharedPreset } from "@/lib/rename/shared-presets";
import { taskMode, trackTaskEvent } from "@/lib/task-analytics";

export function PresetLinkDialog() {
	const params = useSearchParams();
	const locale = useLocale() === "zh" ? "zh" : "en";
	const recipeId = params.get("recipe");
	const encoded = params.get("preset");
	const recipe = recipeId ? getGuideRecipe(recipeId) : undefined;
	const preset = useMemo<SharedPreset | null>(() => {
		if (recipeId !== null && encoded !== null) return null;
		if (recipe)
			return {
				name: recipe.name[locale],
				description: recipe.note[locale],
				rules: recipe.rules,
				extensionScope: "name",
			};
		return encoded ? decodeSharedPreset(encoded) : null;
	}, [recipeId, encoded, recipe, locale]);
	if (recipeId === null && encoded === null) return null;
	return (
		<PresetLinkReview
			key={`${recipeId}:${encoded}`}
			preset={preset}
			recipe={recipe}
			entry={params.get("entry")}
		/>
	);
}

function PresetLinkReview({
	preset,
	recipe,
	entry,
}: {
	preset: SharedPreset | null;
	recipe?: GuideRecipe;
	entry: string | null;
}) {
	useEffect(() => {
		if (preset && recipe)
			trackTaskEvent("recipe_open", {
				recipe_id: recipe.id,
				entry: entry === "home" || entry === "guide" ? entry : "direct",
			});
	}, [preset, recipe, entry]);
	const t = useTranslations("rename.presetLink");
	const rulesText = useTranslations("rename.rules");
	const [dismissed, setDismissed] = useState(false);
	const [trustCode, setTrustCode] = useState(false);
	const existingRuleCount = useRenameStore((s) => s.rules.length);
	const existingFileCount = useRenameStore((s) => s.files.length);
	const currentScope = useRenameStore((s) => s.extensionScope);
	const isExecuting = useRenameStore((s) => s.isExecuting);
	const hasCode = preset?.rules.some((rule) => rule.type === "customJs");
	const canApply = !isExecuting && (!hasCode || trustCode);
	const canTrySample = !!recipe && existingRuleCount === 0 && existingFileCount === 0;
	const scopeLabel = (scope: string) =>
		rulesText(
			scope === "name" ? "scopeName" : scope === "extension" ? "scopeExtension" : "scopeFull",
		);

	function dismiss() {
		setDismissed(true);
		const url = new URL(window.location.href);
		url.searchParams.delete("preset");
		url.searchParams.delete("recipe");
		url.searchParams.delete("entry");
		window.history.replaceState(
			window.history.state,
			"",
			`${url.pathname}${url.search}${url.hash}`,
		);
	}

	async function apply(withSamples = false) {
		if (!preset || !canApply) return;
		const store = useRenameStore.getState();
		if (store.isExecuting) return;
		// Never mix tutorial filenames into the user's existing batch.
		if (withSamples && (store.rules.length || store.files.length || !recipe)) return;
		if (recipe)
			trackTaskEvent("recipe_apply", {
				recipe_id: recipe.id,
				mode: withSamples ? "sample" : taskMode(store.files),
			});
		store.addRulesFromTemplate(structuredClone(preset.rules), preset.extensionScope);
		if (withSamples && recipe)
			await store.addFiles(recipe.examples.map((example) => example.before));
		dismiss();
	}

	function save() {
		if (!preset) return;
		usePresetsStore.getState().savePreset(preset.name, structuredClone(preset.rules), preset);
		toast.success(t("saved"));
		dismiss();
	}

	function fieldLabel(type: string, key: string) {
		const aliases: Record<string, string> = {
			positionStart: "position",
			positionCount: "count",
			fromEnd: "fromEnd",
		};
		const path = `${type}.${aliases[key] ?? key}`;
		return rulesText.has(path) ? rulesText(path) : key;
	}

	function fieldValue(type: string, key: string, value: unknown) {
		if (typeof value === "boolean") return t(value ? "yes" : "no");
		if (typeof value === "string") {
			if (!value) return t("empty");
			// Translate enumerated settings only; literal text and patterns must stay exact.
			const aliases: Record<string, Record<string, string>> = {
				position: { start: "atStart", end: "atEnd", index: "atIndex" },
				scope: {
					global: "scopeGlobal",
					perFolder: "scopePerFolder",
					perExtension: "scopePerExtension",
					perCategory: "scopePerCategory",
				},
				sortBy: {
					name: "sortByName",
					size: "sortBySize",
					modified: "sortByModified",
					extension: "sortByExtension",
				},
				sortOrder: { asc: "sortAsc", desc: "sortDesc" },
				direction: { start: "fromStart", end: "fromEnd" },
			};
			if (
				[
					"position",
					"scope",
					"sortBy",
					"sortOrder",
					"direction",
					"seqType",
					"mode",
					"style",
				].includes(key)
			) {
				const path = `${type}.${aliases[key]?.[value] ?? value}`;
				return rulesText.has(path) ? rulesText(path) : value;
			}
			return JSON.stringify(value);
		}
		return String(value);
	}

	return (
		<Dialog
			open={!dismissed}
			onOpenChange={(open) => {
				if (!open) dismiss();
			}}
		>
			<DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle className="pr-5 break-words">
						{preset ? preset.name : t("invalidTitle")}
					</DialogTitle>
					<DialogDescription>{preset ? t("intro") : t("invalidDescription")}</DialogDescription>
				</DialogHeader>
				{preset && (
					<>
						{preset.description && <p className="text-sm break-words">{preset.description}</p>}
						<p className="text-sm">
							{rulesText("extensionScope")}: {scopeLabel(preset.extensionScope)}
						</p>
						{recipe && (
							<div className="space-y-2 rounded-lg border p-3 text-sm">
								<p className="font-medium">{t("example")}</p>
								{recipe.examples.map((example) => (
									<p key={example.before} className="whitespace-pre-wrap break-all font-mono">
										{example.before} → {example.after}
									</p>
								))}
							</div>
						)}
						<div className="space-y-2">
							{preset.rules.map((rule, i) => (
								<details
									key={`${i}-${rule.type}`}
									className="rounded-lg border p-3"
									open={rule.type === "customJs"}
								>
									<summary className="cursor-pointer text-sm font-medium">
										{i + 1}. {rulesText(`types.${rule.type}`)}
									</summary>
									{rule.type === "customJs" ? (
										<pre className="mt-3 whitespace-pre-wrap break-all text-xs">
											{rule.config.code}
										</pre>
									) : (
										<dl className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 text-xs">
											{Object.entries(rule.config).map(([key, value]) => (
												<div key={key} className="contents">
													<dt className="text-muted-foreground">{fieldLabel(rule.type, key)}</dt>
													<dd className="whitespace-pre-wrap break-all">
														{fieldValue(rule.type, key, value)}
													</dd>
												</div>
											))}
										</dl>
									)}
								</details>
							))}
						</div>
						{existingRuleCount > 0 && (
							<p className="rounded-lg bg-muted p-3 text-sm">
								{t("existing", { count: existingRuleCount, scope: scopeLabel(currentScope) })}
							</p>
						)}
						{hasCode && (
							<label className="flex items-start gap-2 text-sm">
								<input
									type="checkbox"
									checked={trustCode}
									onChange={(event) => setTrustCode(event.target.checked)}
									className="mt-1"
								/>
								{t("trustCode")}
							</label>
						)}
						{isExecuting && <output className="text-sm">{t("busy")}</output>}
					</>
				)}
				<DialogFooter className="flex-wrap">
					<Button variant="outline" onClick={dismiss}>
						{t("cancel")}
					</Button>
					{preset && (
						<>
							{!recipe && (
								<Button variant="outline" onClick={save}>
									{t("save")}
								</Button>
							)}
							<Button
								variant={canTrySample ? "outline" : "default"}
								disabled={!canApply}
								onClick={() => void apply()}
							>
								{t(existingRuleCount ? "append" : "apply")}
							</Button>
							{canTrySample && (
								<Button disabled={!canApply} onClick={() => void apply(true)}>
									{t("trySample")}
								</Button>
							)}
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
