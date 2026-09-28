import { beforeEach, describe, expect, it } from "vitest";
import { useRenameStore } from "@/hooks/useRenameStore";
import { getGuidanceState } from "@/lib/rename/guidance";

function guidance() {
	const state = useRenameStore.getState();
	return getGuidanceState({
		...state,
		selectedCount: state.filteredFiles.filter((file) => file.selected).length,
	});
}

describe("Guided rename workflow", () => {
	beforeEach(() => useRenameStore.setState(useRenameStore.getInitialState(), true));

	it("loads a complete preview without writable files, once even on double click", async () => {
		expect(guidance()).toBe("noFiles");
		await Promise.all([useRenameStore.getState().loadDemo(), useRenameStore.getState().loadDemo()]);
		const state = useRenameStore.getState();
		expect(state.files).toHaveLength(3);
		expect(state.files.every((file) => file.isDemo && !file.handle)).toBe(true);
		expect(state.rules).toHaveLength(1);
		expect(state.preview.map((row) => row.newName)).toEqual(["Photo_001.jpg", "Photo_002.jpg", "Photo_003.jpg"]);
		expect(state.preview.every((row) => row.hasChange && !row.conflict)).toBe(true);
		expect(guidance()).toBe("previewOnly");
	});

	it("never overwrites existing files or rules, including edits while loading", async () => {
		await useRenameStore.getState().addFiles(["own.jpg"]);
		await useRenameStore.getState().loadDemo();
		expect(useRenameStore.getState().files.map((file) => file.name)).toEqual(["own.jpg"]);
		useRenameStore.getState().clearFiles();
		const loading = useRenameStore.getState().loadDemo();
		useRenameStore.getState().addRule("insert");
		await loading;
		expect(useRenameStore.getState().files).toHaveLength(0);
		expect(useRenameStore.getState().rules[0].ruleConfig.type).toBe("insert");
		await useRenameStore.getState().loadDemo();
		expect(useRenameStore.getState().files).toHaveLength(0);
	});

	it("replaces demo files on import, even when a real file shares a demo name", async () => {
		await useRenameStore.getState().loadDemo();
		const rule = useRenameStore.getState().rules[0];
		await useRenameStore.getState().addFiles([]);
		expect(useRenameStore.getState().files).toHaveLength(3);
		const handle = {} as FileSystemFileHandle;
		await useRenameStore.getState().addFiles(["IMG_2048.jpg"], [handle]);
		const state = useRenameStore.getState();
		expect(state.files).toHaveLength(1);
		expect(state.files[0].isDemo).toBeUndefined();
		expect(state.files[0].handle).toBe(handle);
		expect(state.rules[0]).toEqual(rule);
		expect(guidance()).toBe("ready");
	});

	it("explains missing rules, inactive rules, and unchanged results separately", async () => {
		await useRenameStore.getState().addFiles(["photo.jpg"]);
		expect(guidance()).toBe("noRules");
		useRenameStore.getState().addRule("findReplace");
		expect(guidance()).toBe("noChanges");
		useRenameStore.getState().updateRule(useRenameStore.getState().rules[0].id, { enabled: false });
		expect(guidance()).toBe("disabledRules");
	});

	it("explains selection and filters hiding all files", async () => {
		await useRenameStore.getState().loadDemo();
		useRenameStore.getState().selectAll(false);
		expect(guidance()).toBe("noSelection");
		useRenameStore.getState().selectAll(true);
		useRenameStore.getState().addFilterCondition();
		const condition = useRenameStore.getState().filter.conditions[0];
		useRenameStore.getState().updateFilterCondition(condition.id, { value: "not-a-photo" });
		expect(guidance()).toBe("noSelection");
	});

	it("prioritizes conflicts over preview-only warnings", async () => {
		await useRenameStore.getState().loadDemo();
		const rule = useRenameStore.getState().rules[0];
		if (rule.ruleConfig.type !== "sequence") throw Error("Expected sequence");
		useRenameStore.getState().updateRule(rule.id, {
			ruleConfig: { type: "sequence", config: { ...rule.ruleConfig.config, template: "same" } },
		});
		expect(guidance()).toBe("conflicts");
		useRenameStore.getState().applyAutoFix();
		expect(guidance()).toBe("previewOnly");
		await useRenameStore.getState().addFiles(["own.jpg"]);
		const state = useRenameStore.getState();
		expect(state.hasAutoFix).toBe(false);
		expect(state.preview).toHaveLength(1);
		expect(state.preview[0].fileId).toBe(state.files[0].id);
		expect(state.preview[0].original).toBe("own.jpg");
	});

	it("identifies mixed access and blocks while computing or executing", async () => {
		await useRenameStore.getState().addFiles(["real.jpg"], [{} as FileSystemFileHandle]);
		await useRenameStore.getState().addFiles(["sample.jpg"]);
		useRenameStore.getState().addRule("sequence");
		expect(guidance()).toBe("mixed");
		useRenameStore.setState({ isPreviewComputing: true });
		expect(guidance()).toBe("computing");
		useRenameStore.setState({ isExecuting: true });
		expect(guidance()).toBe("executing");
	});

	it("clears corrected previews along with demo files", async () => {
		await useRenameStore.getState().loadDemo();
		useRenameStore.getState().applyAutoFix();
		useRenameStore.getState().clearFiles();
		expect(useRenameStore.getState().preview).toEqual([]);
		expect(useRenameStore.getState().hasAutoFix).toBe(false);
		expect(guidance()).toBe("noFiles");
	});
});
