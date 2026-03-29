"use client";

import { Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PresetCategory, RuleConfig } from "@/lib/rename/types";

interface Props {
	rules: RuleConfig[];
	onSave: (
		name: string,
		options: {
			description?: string;
			tags?: string[];
			category?: PresetCategory;
		},
	) => void;
	trigger: React.ReactNode;
}

export function SavePresetDialog({ rules, onSave, trigger }: Props) {
	const t = useTranslations("rename.presets");
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState<PresetCategory | "">("");
	const [tagsInput, setTagsInput] = useState("");

	const handleSave = () => {
		if (!name.trim()) return;

		const tags = tagsInput
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		onSave(name.trim(), {
			description: description.trim() || undefined,
			tags: tags.length > 0 ? tags : undefined,
			category: category || undefined,
		});

		setName("");
		setDescription("");
		setCategory("");
		setTagsInput("");
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Save className="h-4 w-4" />
						{t("saveAsPreset")}
					</DialogTitle>
					<DialogDescription>{t("saveDescription", { count: rules.length })}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="preset-name">{t("presetName")}</Label>
						<Input
							id="preset-name"
							placeholder={t("presetNamePlaceholder")}
							value={name}
							onChange={(e) => setName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && name.trim()) {
									handleSave();
								}
							}}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="preset-description">
							{t("description")} ({t("optional")})
						</Label>
						<Textarea
							id="preset-description"
							placeholder={t("descriptionPlaceholder")}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={2}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="preset-category">
							{t("category")} ({t("optional")})
						</Label>
						<Select value={category} onValueChange={(v) => setCategory(v as PresetCategory)}>
							<SelectTrigger id="preset-category">
								<SelectValue placeholder={t("selectCategory")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="photo">{t("categoryPhoto")}</SelectItem>
								<SelectItem value="document">{t("categoryDocument")}</SelectItem>
								<SelectItem value="code">{t("categoryCode")}</SelectItem>
								<SelectItem value="video">{t("categoryVideo")}</SelectItem>
								<SelectItem value="music">{t("categoryMusic")}</SelectItem>
								<SelectItem value="general">{t("categoryGeneral")}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="preset-tags">
							{t("tags")} ({t("optional")})
						</Label>
						<Input
							id="preset-tags"
							placeholder={t("tagsPlaceholder")}
							value={tagsInput}
							onChange={(e) => setTagsInput(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">{t("tagsHint")}</p>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						{t("cancel")}
					</Button>
					<Button onClick={handleSave} disabled={!name.trim()}>
						<Save className="h-4 w-4 mr-1.5" />
						{t("save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
