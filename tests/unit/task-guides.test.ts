import { describe, expect, it } from "vitest";
import { GUIDE_LOCALES, guides } from "@/lib/guides/content";
const taskGuides = guides.filter((guide) => ["add-prefix-suffix-to-filenames", "replace-spaces-in-filenames"].includes(guide.slug));
import { getRecipeForGuide } from "@/lib/guides/recipes";
import { computePreview } from "@/lib/rename/rules";
import { getDefaultConfig, type RuleConfig } from "@/lib/rename/types";

const insert = (text: string, position: "start" | "end"): RuleConfig => ({ type: "insert", config: { text, position, index: 0 } });
const regex = (pattern: string, replacement: string, flags = ""): RuleConfig => ({ type: "regex", config: { pattern, replacement, flags } });
function replace(replacement: string): RuleConfig {
	const defaults = getDefaultConfig("findReplace");
	if (defaults.type !== "findReplace") throw new Error("Invalid defaults");
	return { type: "findReplace", config: { ...defaults.config, find: " ", replace: replacement } };
}
const recipes: RuleConfig[][][][] = [
	[[getRecipeForGuide(taskGuides[0].slug)!.rules], [[insert("client-a_", "start")], [insert("_review", "end")]], [[regex("^(?!client-a_)", "client-a_")]]],
	[[getRecipeForGuide(taskGuides[1].slug)!.rules], [[replace("-")], [replace("")]], [[regex("\\s+", "_", "g")], [regex("^\\s+|\\s+$", "", "g"), regex("\\s+", "_", "g")]]],
];

describe.each(GUIDE_LOCALES)("New %s task guide examples", (locale) => {
	for (const [guideIndex, guide] of taskGuides.entries()) {
		for (const [sectionIndex, section] of guide.content[locale].sections.entries()) {
			for (const [exampleIndex, example] of (section.examples ?? []).entries()) {
				it(`${guide.slug}: ${sectionIndex}/${exampleIndex}`, () => {
					const settings = recipes[guideIndex][sectionIndex];
					const configs = settings[exampleIndex] ?? settings[0];
					const dot = example.before.lastIndexOf(".");
					const file = { id: "example", name: example.before, baseName: example.before.slice(0, dot), extension: example.before.slice(dot), selected: true };
					const results = computePreview([file], configs.map((ruleConfig, i) => ({ id: String(i), enabled: true, ruleConfig })), "name");
					expect(results[0].newName).toBe(example.after);
					expect(results[0].error).toBeUndefined();
				});
			}
		}
	}
});

it("detects the documented space replacement collision", () => {
	const files = ["Report Final", "Report_Final"].map((name, i) => ({ id: String(i), name: `${name}.pdf`, baseName: name, extension: ".pdf", selected: true }));
	const preview = computePreview(files, [{ id: "replace", enabled: true, ruleConfig: replace("_") }], "name");
	expect(preview.some((result) => result.conflict)).toBe(true);
});
