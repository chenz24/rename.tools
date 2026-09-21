import { getDefaultConfig, type RuleConfig, type SequenceConfig } from "@/lib/rename/types";

export interface GuideRecipe {
	id: string;
	guideSlug: string;
	name: { en: string; zh: string };
	note: { en: string; zh: string };
	rules: RuleConfig[];
	examples: { before: string; after: string }[];
}

function sequence(config: Partial<SequenceConfig>): RuleConfig {
	const defaults = getDefaultConfig("sequence");
	if (defaults.type !== "sequence") throw new Error("Invalid sequence defaults");
	return { type: "sequence", config: { ...defaults.config, ...config } };
}

function replace(find: string, replacement: string): RuleConfig {
	const defaults = getDefaultConfig("findReplace");
	if (defaults.type !== "findReplace") throw new Error("Invalid replacement defaults");
	return { type: "findReplace", config: { ...defaults.config, find, replace: replacement } };
}

export const guideRecipes: GuideRecipe[] = [
	{
		id: "photo-date-sequence",
		guideSlug: "organize-photos-by-date-sequence",
		name: { en: "Photos with a fixed date and sequence", zh: "照片：固定日期与序号" },
		note: {
			en: "Uses the literal date 2026-05-22, not EXIF metadata. Change the date and location before using your own photos.",
			zh: "使用固定日期 2026-05-22，不读取 EXIF。处理自己的照片前，请修改日期和地点。",
		},
		rules: [sequence({ template: "2026-05-22_{n}_tokyo" })],
		examples: [
			{ before: "IMG_0421.jpg", after: "2026-05-22_001_tokyo.jpg" },
			{ before: "IMG_0422.jpg", after: "2026-05-22_002_tokyo.jpg" },
		],
	},
	{
		id: "regex-date",
		guideSlug: "regex-batch-rename",
		name: { en: "Move a leading date with regex", zh: "正则：把开头日期移到末尾" },
		note: {
			en: "Matches a leading YYYY-MM-DD date, moves it after the title, then replaces spaces with underscores. Extensions are preserved.",
			zh: "匹配开头的 YYYY-MM-DD 日期并移到标题后，再将空格替换为下划线。扩展名保持不变。",
		},
		rules: [
			{
				type: "regex",
				config: { pattern: "^(\\d{4}-\\d{2}-\\d{2})\\s+(.+)$", replacement: "$2_$1", flags: "" },
			},
			replace(" ", "_"),
		],
		examples: [
			{ before: "2026-05-22 invoice client-a.pdf", after: "invoice_client-a_2026-05-22.pdf" },
			{ before: "notes.pdf", after: "notes.pdf" },
		],
	},
	{
		id: "sequence-preserve",
		guideSlug: "sequence-file-numbering",
		name: { en: "Pad existing photo numbers", zh: "序号：保留原编号并补零" },
		note: {
			en: "Preserves the first number in each name and pads it to three digits. Names without a number use the sequence counter instead.",
			zh: "保留名称中的第一个数字并补足三位。没有数字的名称会使用序号计数器。",
		},
		rules: [sequence({ preserveOriginal: true, preservePattern: "(\\d+)", template: "{n}_photo" })],
		examples: [
			{ before: "photo1.jpg", after: "001_photo.jpg" },
			{ before: "photo10.jpg", after: "010_photo.jpg" },
		],
	},
	{
		id: "prefix-suffix",
		guideSlug: "add-prefix-suffix-to-filenames",
		name: { en: "Add a project prefix and version suffix", zh: "添加项目名前缀与版本后缀" },
		note: {
			en: "Adds client-a_ at the start and _review before the extension. Existing names and extensions stay intact.",
			zh: "在开头添加 client-a_，在扩展名前添加 _review，保留原名称和扩展名。",
		},
		rules: [
			{ type: "insert", config: { text: "client-a_", position: "start", index: 0 } },
			{ type: "insert", config: { text: "_review", position: "end", index: 0 } },
		],
		examples: [
			{ before: "proposal.pdf", after: "client-a_proposal_review.pdf" },
			{ before: "budget.xlsx", after: "client-a_budget_review.xlsx" },
		],
	},
	{
		id: "spaces-to-underscores",
		guideSlug: "replace-spaces-in-filenames",
		name: { en: "Replace spaces with underscores", zh: "将文件名空格替换为下划线" },
		note: {
			en: "Replaces every ordinary space with an underscore. Two consecutive spaces become two underscores; other punctuation and extensions are unchanged.",
			zh: "将每个普通空格替换为下划线。两个连续空格会变成两个下划线；其他标点和扩展名不变。",
		},
		rules: [replace(" ", "_")],
		examples: [
			{ before: "Quarterly Report 2026.pdf", after: "Quarterly_Report_2026.pdf" },
			{ before: "draft  final.txt", after: "draft__final.txt" },
		],
	},
];

export function getGuideRecipe(id: string) {
	return guideRecipes.find((recipe) => recipe.id === id);
}

export function getRecipeForGuide(slug: string) {
	return guideRecipes.find((recipe) => recipe.guideSlug === slug);
}
