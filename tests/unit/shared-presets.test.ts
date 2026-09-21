import { beforeEach, describe, expect, it } from "vitest";
import { useRenameStore } from "@/hooks/useRenameStore";
import { guideRecipes } from "@/lib/guides/recipes";
import { decodeSharedPreset, encodeSharedPreset } from "@/lib/rename/shared-presets";
import { getDefaultConfig } from "@/lib/rename/types";

const legacy = (value: unknown) => btoa(encodeURIComponent(JSON.stringify(value)));
const preset = { name: "照片 & résumé 📸", description: "本地预览", rules: [getDefaultConfig("insert")] };

describe("Shared preset links", () => {
	it("round-trips Unicode and preserves the explicit extension scope", () => {
		const input = { ...preset, extensionScope: "full", tags: ["照片"], category: "photo" };
		const params = new URLSearchParams({ preset: encodeSharedPreset(input) });
		expect(decodeSharedPreset(new URLSearchParams(params.toString()).get("preset")!)).toEqual(input);
	});
	it("reads legacy links without scope as name-only", () => {
		expect(decodeSharedPreset(legacy(preset))).toEqual({ ...preset, extensionScope: "name" });
	});
	it.each(["findReplace", "insert", "sequence", "caseStyle", "regex", "customJs", "removeCleanup"] as const)("accepts a supported %s rule", (type) => {
		expect(decodeSharedPreset(encodeSharedPreset({ ...preset, rules: [getDefaultConfig(type)] }))?.rules[0].type).toBe(type);
	});
	it("decodes JavaScript as inert text without running it", () => {
		const code = 'throw new Error("must not run while reading a link")';
		expect(decodeSharedPreset(legacy({ ...preset, rules: [{ type: "customJs", config: { code } }] }))?.rules[0]).toEqual({ type: "customJs", config: { code } });
	});
	it.each([null, [], {}, { ...preset, rules: [] }, { ...preset, rules: [{ type: "insert", config: { text: 42 } }] }, { ...preset, extensionScope: "all" }, { ...preset, rules: [{ type: "unknown", config: {} }] }, { ...preset, rules: Array(101).fill(getDefaultConfig("insert")) }, { ...preset, rules: [{ ...getDefaultConfig("sequence"), config: { padding: 1e9 } }] }])("rejects malformed payload %#", (input) => {
		expect(decodeSharedPreset(legacy(input))).toBeNull();
	});
	it("rejects broken and oversized encodings", () => {
		for (const value of ["", "not base64!", btoa("not JSON"), "a".repeat(100_001)]) expect(decodeSharedPreset(value)).toBeNull();
	});
	it("does not export unrelated saved state or credentials", () => {
		const result = decodeSharedPreset(encodeSharedPreset({ ...preset, apiKey: "not-a-real-key", files: ["private.txt"], id: "local-only", usageCount: 5 }));
		expect(result).toEqual({ ...preset, extensionScope: "name" });
	});
});

describe("Applying a recipe to the working batch", () => {
	beforeEach(() => useRenameStore.setState(useRenameStore.getInitialState(), true));
	it("uses the preset scope on an empty chain and recomputes the preview", async () => {
		await useRenameStore.getState().addFiles(["report.PDF"]);
		useRenameStore.getState().addRulesFromTemplate([{ type: "caseStyle", config: { mode: "lowercase", style: "none" } }], "extension");
		expect(useRenameStore.getState().extensionScope).toBe("extension");
		expect(useRenameStore.getState().preview[0].newName).toBe("report.pdf");
	});
	it("preserves existing rules, files, selection and scope when appending", async () => {
		const store = useRenameStore.getState();
		await store.addFiles(["report.PDF"]);
		store.setExtensionScope("extension");
		store.addRule("caseStyle");
		const before = useRenameStore.getState();
		const originalRule = before.rules[0];
		store.addRulesFromTemplate(guideRecipes[3].rules, "name");
		const after = useRenameStore.getState();
		expect(after.rules[0]).toEqual(originalRule);
		expect(after.rules).toHaveLength(3);
		expect(new Set(after.rules.map((rule) => rule.id)).size).toBe(3);
		expect(after.files).toEqual(before.files);
		expect(after.extensionScope).toBe("extension");
		expect(after.executionLog).toEqual([]);
	});
	it.each(guideRecipes)("reproduces $id from the actual rule chain", async (recipe) => {
		useRenameStore.getState().addRulesFromTemplate(structuredClone(recipe.rules), "name");
		await useRenameStore.getState().addFiles(recipe.examples.map((example) => example.before));
		const state = useRenameStore.getState();
		expect(state.preview.map((result) => result.newName)).toEqual(recipe.examples.map((example) => example.after));
		expect(state.preview.every((result) => !result.error && !result.conflict)).toBe(true);
		expect(state.files.every((file) => !file.handle)).toBe(true);
		expect(state.executionLog).toEqual([]);
	});
});
