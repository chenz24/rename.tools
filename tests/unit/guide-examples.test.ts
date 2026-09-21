import { afterEach, describe, expect, it, vi } from "vitest";
import { guides } from "@/lib/guides/content";
import { computePreview } from "@/lib/rename/rules";
import { getDefaultConfig } from "@/lib/rename/types";
import type { FileEntry, RenameRule, RuleConfig, SequenceConfig } from "@/lib/rename/types";

function sequence(config: Partial<SequenceConfig>): RuleConfig {
	const defaults = getDefaultConfig("sequence");
	if (defaults.type !== "sequence") throw new Error("Expected Sequence defaults");
	return { type: "sequence", config: { ...defaults.config, ...config } };
}

function replace(find: string, replacement: string): RuleConfig {
	const defaults = getDefaultConfig("findReplace");
	if (defaults.type !== "findReplace") throw new Error("Expected Find & Replace defaults");
	return { type: "findReplace", config: { ...defaults.config, find, replace: replacement } };
}

function regex(pattern: string, replacement: string, flags = ""): RuleConfig {
	return { type: "regex", config: { pattern, replacement, flags } };
}

const titleCase: RuleConfig = {
	type: "caseStyle", config: { mode: "titlecase", style: "none" },
};
const kebabCase: RuleConfig = {
	type: "caseStyle", config: { mode: "kebab-case", style: "none" },
};
const episode = regex("^(.+)\\.s(\\d+)e(\\d+).*$", "$1 S$2E$3", "i");

function preview(names: string[], configs: RuleConfig[], metadata?: FileEntry["metadata"][]) {
	const files: FileEntry[] = names.map((path, i) => {
		const name = path.split("/").at(-1)!;
		const dot = name.lastIndexOf(".");
		return { id: String(i), name, baseName: name.slice(0, dot), extension: name.slice(dot),
			selected: true, relativePath: path, metadata: metadata?.[i] };
	});
	const rules: RenameRule[] = configs.map((ruleConfig, i) => ({ id: String(i), enabled: true, ruleConfig }));
	return computePreview(files, rules, "name").map((result, i) => {
		expect(result.error).toBeUndefined();
		expect(result.conflict).toBe(false);
		const slash = names[i].lastIndexOf("/");
		return names[i].slice(0, slash + 1) + result.newName;
	});
}

// Exercise the actual filenames published in both translations, using the documented settings.
const examples: {
	guide: number; section: number; example?: number; rules: RuleConfig[];
	metadata?: FileEntry["metadata"][];
}[] = [
	{ guide: 0, section: 1, rules: [replace("IMG_", ""), sequence({ template: "2026-05-22_{n}" })] },
	{ guide: 0, section: 2, rules: [sequence({ start: 5 })] },
	{ guide: 0, section: 4, rules: [sequence({ start: 6 })] },
	{ guide: 1, section: 0, rules: [sequence({ template: "2026-05-22_{n}_tokyo" })] },
	{ guide: 1, section: 3, rules: [sequence({ template: "2026-05-22_{n}_tokyo" })] },
	{ guide: 1, section: 4, rules: [sequence({ padding: 2, preserveOriginal: true, preservePattern: "(\\d+)", template: "client-a_2026-05-22_v{n}" })] },
	{ guide: 2, section: 0, example: 0, rules: [regex("^(\\d{4}-\\d{2}-\\d{2})\\s+(.+)$", "$2_$1"), replace(" ", "_")] },
	{ guide: 2, section: 0, example: 1, rules: [episode, replace(".", " ")] },
	{ guide: 2, section: 3, rules: [regex("^([^_]+)_([^_]+)_(\\d{4}-\\d{2}-\\d{2})_final$", "$2_$1_$3")] },
	{ guide: 2, section: 4, rules: [kebabCase] },
	{ guide: 3, section: 0, rules: [sequence({ preserveOriginal: true, preservePattern: "(\\d+)", template: "{n}_photo" })] },
	{ guide: 3, section: 2, rules: [sequence({ template: "archive_2026_{n}_{name}" })] },
	{ guide: 3, section: 3, rules: [sequence({ preserveOriginal: true, preservePattern: "page-(\\d+)", template: "page_{n}_scan" })] },
	{ guide: 3, section: 4, rules: [sequence({ template: "{n}_{name}", sortBeforeNumbering: true, sortBy: "name", sortOrder: "asc", naturalSort: true })] },
	{ guide: 4, section: 0, rules: [sequence({ template: "{media.track}. {media.artist} - {media.title}" })], metadata: [
		{ kind: "media", trackNumber: 1, artist: "Taylor Swift", title: "Love Story" },
		{ kind: "media", trackNumber: 7, artist: "Artist", title: "Song Title" },
	] },
	{ guide: 4, section: 1, rules: [episode, replace(".", " "), titleCase] },
	{ guide: 4, section: 3, rules: [regex("^(.+)\\.s(\\d+)e(\\d+).*\\.([a-z]{2})$", "$1 S$2E$3", "i"), replace(".", " "), titleCase, { type: "insert", config: { text: ".en", position: "end", index: 0 } }] },
];

afterEach(() => vi.useRealTimers());

describe.each(["en", "zh"] as const)("Published %s guide examples", (locale) => {
	for (const recipe of examples) {
		const guide = guides[recipe.guide];
		const section = guide.content[locale].sections[recipe.section];
		it(`${guide.slug}: ${section.title} (${recipe.example ?? "all"})`, () => {
			const selected = recipe.example === undefined ? section.examples! : [section.examples![recipe.example]];
			const names = selected.flatMap((example) => example.before.split(", "));
			const expected = selected.flatMap((example) => example.after.split(", "));
			expect(preview(names, recipe.rules, recipe.metadata)).toEqual(expected);
		});
	}
});

it("distinguishes today's UTC date from a loaded capture date, and leaves missing metadata explicit", () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date("2026-09-21T01:00:00Z"));
	expect(preview(["photo.jpg"], [sequence({ template: "{date}_{n}" })])).toEqual(["2026-09-21_001.jpg"]);
	expect(preview(["photo.jpg"], [sequence({ template: "{exif.date}_{n}" })], [{ kind: "image", dateTime: new Date(2024, 2, 15, 12) }])).toEqual(["2024-03-15_001.jpg"]);
	expect(preview(["photo.jpg"], [sequence({ template: "{exif.date}_{n}" })])).toEqual(["{exif.date}_001.jpg"]);
	expect(preview(["track.mp3"], [sequence({ template: "{media.track}. {media.artist} - {media.title}" })])).toEqual(["{media.track}. {media.artist} - {media.title}.mp3"]);
});

it("applies the independent regex recipes without touching extensions or unrelated names", () => {
	expect(preview(["report [draft].pdf", "notes.pdf"], [regex("\\s*\\[[^\\]]+\\]", "", "g")])).toEqual(["report.pdf", "notes.pdf"]);
});
