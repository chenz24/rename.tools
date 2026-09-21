import { z } from "zod";
import type { RuleConfig } from "./types";

const text = z.string().max(10_000);
const integer = z.number().int().min(-1_000_000).max(1_000_000);
const index = integer.nonnegative();
const ruleSchema: z.ZodType<RuleConfig> = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("findReplace"),
		config: z.object({
			find: text,
			replace: text,
			caseSensitive: z.boolean(),
			matchAll: z.boolean(),
			usePosition: z.boolean(),
			fromEnd: z.boolean(),
			positionStart: index,
			positionCount: index,
		}),
	}),
	z.object({
		type: z.literal("insert"),
		config: z.object({ text, position: z.enum(["start", "end", "index"]), index }),
	}),
	z.object({
		type: z.literal("sequence"),
		config: z.object({
			seqType: z.enum(["numeric", "alpha", "roman"]),
			start: integer,
			step: integer,
			padding: z.number().int().min(0).max(100),
			position: z.enum(["start", "end", "replaceAll"]),
			template: text,
			scope: z.enum(["global", "perFolder", "perExtension", "perCategory"]),
			sortBeforeNumbering: z.boolean(),
			sortBy: z.enum(["name", "size", "modified", "extension"]),
			sortOrder: z.enum(["asc", "desc"]),
			naturalSort: z.boolean(),
			preserveOriginal: z.boolean(),
			preservePattern: text,
			hierarchical: z.boolean(),
			hierarchySeparator: z.string().max(10),
		}),
	}),
	z.object({
		type: z.literal("caseStyle"),
		config: z.object({
			mode: z.enum([
				"uppercase",
				"lowercase",
				"titlecase",
				"sentencecase",
				"camelCase",
				"PascalCase",
				"kebab-case",
				"snake_case",
				"none",
			]),
			style: z.enum([
				"none",
				"spaceToDash",
				"spaceToUnderscore",
				"dashToSpace",
				"underscoreToSpace",
			]),
		}),
	}),
	z.object({
		type: z.literal("regex"),
		config: z.object({ pattern: text, replacement: text, flags: z.string().max(8) }),
	}),
	z.object({ type: z.literal("customJs"), config: z.object({ code: text }) }),
	z.object({
		type: z.literal("removeCleanup"),
		config: z.object({
			mode: z.enum(["chars", "range", "cleanup"]),
			direction: z.enum(["start", "end"]),
			count: index,
			rangeStart: index,
			rangeEnd: index,
			removeDigits: z.boolean(),
			removeSymbols: z.boolean(),
			removeSpaces: z.boolean(),
			removeChinese: z.boolean(),
			removeEnglish: z.boolean(),
		}),
	}),
]);

export const sharedPresetSchema = z.object({
	name: z.string().trim().min(1).max(200),
	description: z.string().max(2000).optional(),
	tags: z.array(z.string().max(100)).max(30).optional(),
	category: z.enum(["photo", "document", "code", "video", "music", "general"]).optional(),
	extensionScope: z.enum(["name", "extension", "full"]).default("name"),
	rules: z.array(ruleSchema).min(1).max(100),
});

export type SharedPreset = z.infer<typeof sharedPresetSchema>;
const MAX_ENCODED_LENGTH = 100_000;

// Keep the original encoding readable so existing shared links continue to work.
export function encodeSharedPreset(preset: unknown): string {
	const encoded = btoa(encodeURIComponent(JSON.stringify(sharedPresetSchema.parse(preset))));
	if (encoded.length > MAX_ENCODED_LENGTH) throw new Error("Preset link is too large");
	return encoded;
}

export function decodeSharedPreset(encoded: string): SharedPreset | null {
	if (!encoded || encoded.length > MAX_ENCODED_LENGTH) return null;
	try {
		// Legacy links did not URL-encode base64 '+' characters.
		const result = sharedPresetSchema.safeParse(
			JSON.parse(decodeURIComponent(atob(encoded.replace(/ /g, "+")))),
		);
		return result.success ? result.data : null;
	} catch {
		return null;
	}
}
