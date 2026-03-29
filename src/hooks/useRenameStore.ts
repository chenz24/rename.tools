import { create } from "zustand";
import type { FileMetadata, MetadataLoadState } from "@/lib/file-metadata/types";
import { autoFixConflicts, computePreview } from "@/lib/rename/rules";
import type {
	ExtensionScope,
	FileEntry,
	FileFilter,
	FilterCondition,
	PreviewResult,
	RenameRule,
	RuleConfig,
	RuleType,
} from "@/lib/rename/types";
import { getDefaultConfig } from "@/lib/rename/types";

export interface LogEntry {
	fileId: string;
	original: string;
	newName: string;
	status: "success" | "failed" | "skipped";
	reason?: string;
}

export interface UndoableRename {
	fileId: string;
	original: string;
	newName: string;
	handle: FileSystemFileHandle;
}

export interface UndoableBatch {
	timestamp: number;
	entries: UndoableRename[];
}

export type SortMode = "import" | "name-asc" | "name-desc" | "ext-asc" | "ext-desc";

// ── helpers ──

let nextId = 1;
const genId = () => String(nextId++);

let nextFilterId = 1;
const genFilterId = () => String(nextFilterId++);

async function parseFileEntry(
	name: string,
	handle?: FileSystemFileHandle,
	relativePath?: string,
): Promise<FileEntry> {
	const lastDot = name.lastIndexOf(".");
	const baseName = lastDot > 0 ? name.slice(0, lastDot) : name;
	const extension = lastDot > 0 ? name.slice(lastDot) : "";

	let size: number | undefined;
	let modified: number | undefined;

	if (handle) {
		try {
			const file = await handle.getFile();
			size = file.size;
			modified = file.lastModified;
		} catch {
			// ignore errors
		}
	}

	return {
		id: genId(),
		name,
		baseName,
		extension,
		selected: true,
		handle,
		relativePath,
		size,
		modified,
	};
}

// 解析文件大小字符串为字节数，支持 KB/MB/GB 单位
function parseSizeValue(value: string): number | null {
	const trimmed = value.trim().toUpperCase();
	const match = trimmed.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)?$/);
	if (!match) return null;
	const num = Number.parseFloat(match[1]);
	if (Number.isNaN(num)) return null;
	const unit = match[2] || "B";
	switch (unit) {
		case "B":
			return num;
		case "KB":
			return num * 1024;
		case "MB":
			return num * 1024 * 1024;
		case "GB":
			return num * 1024 * 1024 * 1024;
		case "TB":
			return num * 1024 * 1024 * 1024 * 1024;
		default:
			return num;
	}
}

// 解析日期字符串为时间戳（毫秒）
function parseDateValue(value: string): number | null {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const ts = Date.parse(trimmed);
	if (Number.isNaN(ts)) return null;
	return ts;
}

// 过滤逻辑
function applyFilter(file: FileEntry, filter: FileFilter): boolean {
	if (filter.conditions.length === 0) return true;

	const results = filter.conditions.map((condition) => {
		const { field, operator, value, caseSensitive } = condition;

		// 空值不过滤
		if (!value.trim()) return true;

		if (field === "size") {
			const numericValue = parseSizeValue(value);
			if (numericValue === null) return true;
			const fileSize = file.size || 0;
			switch (operator) {
				case "greaterThan":
					return fileSize > numericValue;
				case "lessThan":
					return fileSize < numericValue;
				case "equals":
					return fileSize === numericValue;
				default:
					return true;
			}
		}

		if (field === "modified") {
			const dateValue = parseDateValue(value);
			if (dateValue === null) return true;
			const fileModified = file.modified || 0;
			switch (operator) {
				case "greaterThan":
					return fileModified > dateValue;
				case "lessThan":
					return fileModified < dateValue;
				case "equals": {
					// 日期"等于"按天比较
					const fileDate = new Date(fileModified).toDateString();
					const targetDate = new Date(dateValue).toDateString();
					return fileDate === targetDate;
				}
				default:
					return true;
			}
		}

		let fieldValue = "";
		switch (field) {
			case "name":
				fieldValue = file.baseName;
				break;
			case "extension":
				// 去掉点号，如 ".jpg" → "jpg"
				fieldValue = file.extension ? file.extension.replace(/^\./, "") : "";
				break;
			default:
				return true;
		}

		const compareValue = caseSensitive ? value : value.toLowerCase();
		const compareField = caseSensitive ? fieldValue : fieldValue.toLowerCase();

		switch (operator) {
			case "contains":
				return compareField.includes(compareValue);
			case "notContains":
				return !compareField.includes(compareValue);
			case "equals":
				return compareField === compareValue;
			case "notEquals":
				return compareField !== compareValue;
			case "startsWith":
				return compareField.startsWith(compareValue);
			case "endsWith":
				return compareField.endsWith(compareValue);
			case "regex":
				try {
					const regex = new RegExp(value, caseSensitive ? "" : "i");
					return regex.test(fieldValue);
				} catch {
					return false;
				}
			default:
				return true;
		}
	});

	return filter.logic === "AND" ? results.every((r) => r) : results.some((r) => r);
}

function sortFileEntries(files: FileEntry[], mode: SortMode): FileEntry[] {
	const sorted = [...files];
	if (mode === "import") {
		return sorted.sort((a, b) => Number(a.id) - Number(b.id));
	}
	if (mode === "name-asc") {
		return sorted.sort((a, b) => a.name.localeCompare(b.name));
	}
	if (mode === "name-desc") {
		return sorted.sort((a, b) => b.name.localeCompare(a.name));
	}
	if (mode === "ext-asc") {
		return sorted.sort((a, b) => {
			const extA = a.extension || "";
			const extB = b.extension || "";
			if (extA === extB) return a.name.localeCompare(b.name);
			return extA.localeCompare(extB);
		});
	}
	if (mode === "ext-desc") {
		return sorted.sort((a, b) => {
			const extA = a.extension || "";
			const extB = b.extension || "";
			if (extA === extB) return a.name.localeCompare(b.name);
			return extB.localeCompare(extA);
		});
	}
	return sorted;
}

// ── derived state helpers ──

function deriveFilteredFiles(files: FileEntry[], filter: FileFilter): FileEntry[] {
	if (filter.conditions.length === 0) return files;
	return files.filter((file) => applyFilter(file, filter));
}

function derivePreview(
	filteredFiles: FileEntry[],
	rules: RenameRule[],
	extensionScope: ExtensionScope,
): PreviewResult[] {
	return computePreview(filteredFiles, rules, extensionScope);
}

function deriveHasMetadata(files: FileEntry[]): boolean {
	return files.some((f) => f.metadataState === "loaded" && f.metadata != null);
}

// ── Store types ──

interface RenameState {
	// File state
	files: FileEntry[];
	sortMode: SortMode;
	filter: FileFilter;

	// Derived (cached)
	filteredFiles: FileEntry[];
	preview: PreviewResult[];
	hasMetadata: boolean;

	// Preview override (auto-fix)
	_previewOverride: PreviewResult[] | null;
	_basePreview: PreviewResult[];
	hasAutoFix: boolean;

	// Rules state
	rules: RenameRule[];
	extensionScope: ExtensionScope;

	// Execution state
	executionLog: LogEntry[];
	executionProgress: { current: number; total: number } | null;
	isExecuting: boolean;
	_abortExecution: boolean;
	needsUserActivation: boolean;

	// Undo / Redo stacks
	undoStack: UndoableBatch[];
	redoStack: UndoableBatch[];
	canUndo: boolean;
	canRedo: boolean;

	// ── Actions ──
	// Files
	addFiles: (
		names: string[],
		handles?: FileSystemFileHandle[],
		relativePaths?: string[],
	) => Promise<void>;
	clearFiles: () => void;
	toggleFileSelection: (id: string) => void;
	selectAll: (selected: boolean, filteredIds?: string[]) => void;
	sortFiles: (mode: SortMode) => void;

	// Rules
	addRule: (type: RuleType) => void;
	addRulesFromTemplate: (configs: RuleConfig[]) => void;
	updateRule: (id: string, updates: Partial<RenameRule>) => void;
	removeRule: (id: string) => void;
	reorderRules: (newOrder: RenameRule[]) => void;
	cloneRule: (id: string) => void;
	clearRules: () => void;
	setExtensionScope: (scope: ExtensionScope) => void;

	// Metadata
	updateFileMetadata: (
		id: string,
		metadata: FileMetadata | null,
		state: MetadataLoadState,
		error?: string,
	) => void;

	// Filter
	addFilterCondition: () => void;
	updateFilterCondition: (id: string, updates: Partial<FilterCondition>) => void;
	removeFilterCondition: (id: string) => void;
	setFilterLogic: (logic: "AND" | "OR") => void;
	clearFilter: () => void;

	// Preview
	applyAutoFix: () => void;
	resetAutoFix: () => void;

	// Execution
	execute: () => Promise<void>;
	clearExecutionLog: () => void;
	confirmUserActivation: () => void;
	undo: () => Promise<void>;
	redo: () => Promise<void>;
}

// ── Recompute derived state ──

function recomputeDerived(
	state: Pick<RenameState, "files" | "filter" | "rules" | "extensionScope" | "_previewOverride">,
) {
	const filteredFiles = deriveFilteredFiles(state.files, state.filter);
	const basePreview = derivePreview(filteredFiles, state.rules, state.extensionScope);
	const preview = state._previewOverride || basePreview;
	const hasMetadata = deriveHasMetadata(state.files);
	return { filteredFiles, _basePreview: basePreview, preview, hasMetadata };
}

// Batch UI update interval for execute / undo / redo
const EXEC_UI_UPDATE_INTERVAL = 5;

// Module-level resolver for user activation pause/resume
let _activationResolver: (() => void) | null = null;

// ── Zustand store ──

export const useRenameStore = create<RenameState>()((set, get) => ({
	// ── Initial state ──
	files: [],
	sortMode: "import",
	filter: { conditions: [], logic: "AND" },

	filteredFiles: [],
	preview: [],
	hasMetadata: false,

	_previewOverride: null,
	_basePreview: [],
	hasAutoFix: false,

	rules: [],
	extensionScope: "name",

	executionLog: [],
	executionProgress: null,
	isExecuting: false,
	_abortExecution: false,
	needsUserActivation: false,

	undoStack: [],
	redoStack: [],
	canUndo: false,
	canRedo: false,

	// ── File actions ──

	addFiles: async (names, handles?, relativePaths?) => {
		try {
			const newEntries = await Promise.all(
				names.map((n, i) => parseFileEntry(n, handles?.[i], relativePaths?.[i])),
			);
			set((state) => {
				const existingKeys = new Set(state.files.map((f) => f.relativePath || f.name));
				const uniqueEntries = newEntries.filter((entry) => {
					const key = entry.relativePath || entry.name;
					if (existingKeys.has(key)) return false;
					existingKeys.add(key);
					return true;
				});
				const files = [...state.files, ...uniqueEntries];
				return { files, ...recomputeDerived({ ...state, files }) };
			});
		} catch (error) {
			console.error("Failed to add files:", error);
		}
	},

	clearFiles: () =>
		set((state) => {
			const files: FileEntry[] = [];
			return { files, ...recomputeDerived({ ...state, files }) };
		}),

	toggleFileSelection: (id) =>
		set((state) => {
			const files = state.files.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f));
			return { files, ...recomputeDerived({ ...state, files }) };
		}),

	selectAll: (selected, filteredIds?) =>
		set((state) => {
			const files = state.files.map((f) => {
				if (filteredIds && !filteredIds.includes(f.id)) return f;
				return { ...f, selected };
			});
			return { files, ...recomputeDerived({ ...state, files }) };
		}),

	sortFiles: (mode) =>
		set((state) => {
			const files = sortFileEntries(state.files, mode);
			return { files, sortMode: mode, ...recomputeDerived({ ...state, files }) };
		}),

	// ── Rule actions ──

	addRule: (type) =>
		set((state) => {
			const rule: RenameRule = { id: genId(), enabled: true, ruleConfig: getDefaultConfig(type) };
			const rules = [...state.rules, rule];
			return {
				rules,
				_previewOverride: null,
				hasAutoFix: false,
				...recomputeDerived({ ...state, rules, _previewOverride: null }),
			};
		}),

	addRulesFromTemplate: (configs) =>
		set((state) => {
			const newRules: RenameRule[] = configs.map((rc) => ({
				id: genId(),
				enabled: true,
				ruleConfig: rc,
			}));
			const rules = [...state.rules, ...newRules];
			return {
				rules,
				_previewOverride: null,
				hasAutoFix: false,
				...recomputeDerived({ ...state, rules, _previewOverride: null }),
			};
		}),

	updateRule: (id, updates) =>
		set((state) => {
			const rules = state.rules.map((r) => (r.id === id ? { ...r, ...updates } : r));
			return {
				rules,
				_previewOverride: null,
				hasAutoFix: false,
				...recomputeDerived({ ...state, rules, _previewOverride: null }),
			};
		}),

	removeRule: (id) =>
		set((state) => {
			const rules = state.rules.filter((r) => r.id !== id);
			return {
				rules,
				_previewOverride: null,
				hasAutoFix: false,
				...recomputeDerived({ ...state, rules, _previewOverride: null }),
			};
		}),

	reorderRules: (newOrder) =>
		set((state) => {
			const rules = newOrder;
			return {
				rules,
				_previewOverride: null,
				hasAutoFix: false,
				...recomputeDerived({ ...state, rules, _previewOverride: null }),
			};
		}),

	cloneRule: (id) =>
		set((state) => {
			const idx = state.rules.findIndex((r) => r.id === id);
			if (idx === -1) return state;
			const source = state.rules[idx];
			const cloned: RenameRule = {
				id: genId(),
				enabled: source.enabled,
				ruleConfig: JSON.parse(JSON.stringify(source.ruleConfig)),
			};
			const rules = [...state.rules];
			rules.splice(idx + 1, 0, cloned);
			return {
				rules,
				_previewOverride: null,
				hasAutoFix: false,
				...recomputeDerived({ ...state, rules, _previewOverride: null }),
			};
		}),

	clearRules: () =>
		set((state) => {
			const rules: RenameRule[] = [];
			return {
				rules,
				_previewOverride: null,
				hasAutoFix: false,
				...recomputeDerived({ ...state, rules, _previewOverride: null }),
			};
		}),

	setExtensionScope: (scope) =>
		set((state) => {
			return {
				extensionScope: scope,
				_previewOverride: null,
				hasAutoFix: false,
				...recomputeDerived({ ...state, extensionScope: scope, _previewOverride: null }),
			};
		}),

	// ── Metadata ──

	updateFileMetadata: (id, metadata, state_arg, _error?) =>
		set((state) => {
			const files = state.files.map((f) =>
				f.id === id ? { ...f, metadata: metadata ?? f.metadata, metadataState: state_arg } : f,
			);
			return { files, ...recomputeDerived({ ...state, files }) };
		}),

	// ── Filter actions ──

	addFilterCondition: () =>
		set((state) => {
			const filter: FileFilter = {
				...state.filter,
				conditions: [
					...state.filter.conditions,
					{
						id: genFilterId(),
						field: "name",
						operator: "contains",
						value: "",
						caseSensitive: false,
					},
				],
			};
			return { filter, ...recomputeDerived({ ...state, filter }) };
		}),

	updateFilterCondition: (id, updates) =>
		set((state) => {
			const filter: FileFilter = {
				...state.filter,
				conditions: state.filter.conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)),
			};
			return { filter, ...recomputeDerived({ ...state, filter }) };
		}),

	removeFilterCondition: (id) =>
		set((state) => {
			const filter: FileFilter = {
				...state.filter,
				conditions: state.filter.conditions.filter((c) => c.id !== id),
			};
			return { filter, ...recomputeDerived({ ...state, filter }) };
		}),

	setFilterLogic: (logic) =>
		set((state) => {
			const filter: FileFilter = { ...state.filter, logic };
			return { filter, ...recomputeDerived({ ...state, filter }) };
		}),

	clearFilter: () =>
		set((state) => {
			const filter: FileFilter = { conditions: [], logic: "AND" };
			return { filter, ...recomputeDerived({ ...state, filter }) };
		}),

	// ── Preview ──

	applyAutoFix: () =>
		set((state) => {
			const fixed = autoFixConflicts(state._basePreview, state.extensionScope);
			return { _previewOverride: fixed, preview: fixed, hasAutoFix: true };
		}),

	resetAutoFix: () =>
		set((state) => ({
			_previewOverride: null,
			preview: state._basePreview,
			hasAutoFix: false,
		})),

	// ── Execution (optimized: Map index + batched UI updates) ──

	execute: async () => {
		const { preview, filteredFiles } = get();
		const toRename = preview.filter((r) => r.hasChange);
		if (toRename.length === 0) return;

		set({
			isExecuting: true,
			executionLog: [],
			executionProgress: { current: 0, total: toRename.length },
			_abortExecution: false,
			needsUserActivation: false,
		});

		const log: LogEntry[] = [];
		const undoableEntries: UndoableRename[] = [];

		// 预建 Map 索引，避免 O(n²) 查找
		const fileMap = new Map(filteredFiles.map((f) => [f.id, f]));

		for (let i = 0; i < toRename.length; i++) {
			if (get()._abortExecution) break;
			const result = toRename[i];
			const file = fileMap.get(result.fileId);

			if (!file?.handle) {
				log.push({
					fileId: result.fileId,
					original: result.original,
					newName: result.newName,
					status: "skipped",
					reason: "No file handle",
				});
			} else {
				try {
					await (file.handle as any).move(result.newName);
					log.push({
						fileId: result.fileId,
						original: result.original,
						newName: result.newName,
						status: "success",
					});
					undoableEntries.push({
						fileId: result.fileId,
						original: result.original,
						newName: result.newName,
						handle: file.handle,
					});
				} catch (err: any) {
					const msg = err?.message || "Unknown error";
					// 检测浏览器 transient user activation 过期
					if (msg.includes("not allowed by the user agent")) {
						set({
							needsUserActivation: true,
							executionLog: [...log],
							executionProgress: { current: i, total: toRename.length },
						});
						// 暂停，等待用户点击刷新激活状态
						await new Promise<void>((resolve) => {
							_activationResolver = resolve;
						});
						// 用户已点击，重试当前文件
						i--;
						continue;
					}
					log.push({
						fileId: result.fileId,
						original: result.original,
						newName: result.newName,
						status: "failed",
						reason: msg,
					});
				}
			}

			// 批量更新 UI：每 N 个文件或最后一个才更新
			if ((i + 1) % EXEC_UI_UPDATE_INTERVAL === 0 || i === toRename.length - 1) {
				set({
					executionLog: [...log],
					executionProgress: { current: i + 1, total: toRename.length },
				});
			}
		}

		// 保存可撤销批次
		set((state) => {
			const newUndoStack =
				undoableEntries.length > 0
					? [...state.undoStack, { timestamp: Date.now(), entries: undoableEntries }]
					: state.undoStack;
			const newRedoStack = undoableEntries.length > 0 ? [] : state.redoStack;
			return {
				isExecuting: false,
				undoStack: newUndoStack,
				redoStack: newRedoStack,
				canUndo: newUndoStack.length > 0,
				canRedo: newRedoStack.length > 0,
			};
		});
	},

	clearExecutionLog: () =>
		set({ executionLog: [], executionProgress: null, needsUserActivation: false }),

	confirmUserActivation: () => {
		set({ needsUserActivation: false });
		if (_activationResolver) {
			_activationResolver();
			_activationResolver = null;
		}
	},

	// Undo: 撤销上一次批量重命名
	undo: async () => {
		const { undoStack, isExecuting } = get();
		if (undoStack.length === 0 || isExecuting) return;

		const batch = undoStack[undoStack.length - 1];
		set({
			isExecuting: true,
			executionLog: [],
			executionProgress: { current: 0, total: batch.entries.length },
			needsUserActivation: false,
		});

		const log: LogEntry[] = [];
		const redoEntries: UndoableRename[] = [];
		const failedEntries: UndoableRename[] = [];

		// 反向执行：newName -> original
		for (let i = 0; i < batch.entries.length; i++) {
			const entry = batch.entries[i];
			try {
				await (entry.handle as any).move(entry.original);
				log.push({
					fileId: entry.fileId,
					original: entry.newName,
					newName: entry.original,
					status: "success",
				});
				redoEntries.push(entry);
			} catch (err: any) {
				const msg = err?.message || "Unknown error";
				if (msg.includes("not allowed by the user agent")) {
					set({
						needsUserActivation: true,
						executionLog: [...log],
						executionProgress: { current: i, total: batch.entries.length },
					});
					await new Promise<void>((resolve) => {
						_activationResolver = resolve;
					});
					i--;
					continue;
				}
				failedEntries.push(entry);
				log.push({
					fileId: entry.fileId,
					original: entry.newName,
					newName: entry.original,
					status: "failed",
					reason: msg,
				});
			}

			if ((i + 1) % EXEC_UI_UPDATE_INTERVAL === 0 || i === batch.entries.length - 1) {
				set({
					executionLog: [...log],
					executionProgress: { current: i + 1, total: batch.entries.length },
				});
			}
		}

		// 拆分批次：成功的移到 redoStack，失败的留在 undoStack 供重试
		set((state) => {
			// 移除原批次
			let newUndoStack = state.undoStack.slice(0, -1);
			let newRedoStack = state.redoStack;

			// 失败的条目留在 undoStack 供重试
			if (failedEntries.length > 0) {
				newUndoStack = [...newUndoStack, { timestamp: batch.timestamp, entries: failedEntries }];
			}
			// 成功的条目移到 redoStack
			if (redoEntries.length > 0) {
				newRedoStack = [...state.redoStack, { timestamp: Date.now(), entries: redoEntries }];
			}

			return {
				isExecuting: false,
				undoStack: newUndoStack,
				redoStack: newRedoStack,
				canUndo: newUndoStack.length > 0,
				canRedo: newRedoStack.length > 0,
			};
		});
	},

	// Redo: 重做上一次撤销的操作
	redo: async () => {
		const { redoStack, isExecuting } = get();
		if (redoStack.length === 0 || isExecuting) return;

		const batch = redoStack[redoStack.length - 1];
		set({
			isExecuting: true,
			executionLog: [],
			executionProgress: { current: 0, total: batch.entries.length },
			needsUserActivation: false,
		});

		const log: LogEntry[] = [];
		const undoEntries: UndoableRename[] = [];
		const failedEntries: UndoableRename[] = [];

		// 正向执行：original -> newName
		for (let i = 0; i < batch.entries.length; i++) {
			const entry = batch.entries[i];
			try {
				await (entry.handle as any).move(entry.newName);
				log.push({
					fileId: entry.fileId,
					original: entry.original,
					newName: entry.newName,
					status: "success",
				});
				undoEntries.push(entry);
			} catch (err: any) {
				const msg = err?.message || "Unknown error";
				if (msg.includes("not allowed by the user agent")) {
					set({
						needsUserActivation: true,
						executionLog: [...log],
						executionProgress: { current: i, total: batch.entries.length },
					});
					await new Promise<void>((resolve) => {
						_activationResolver = resolve;
					});
					i--;
					continue;
				}
				failedEntries.push(entry);
				log.push({
					fileId: entry.fileId,
					original: entry.original,
					newName: entry.newName,
					status: "failed",
					reason: msg,
				});
			}

			if ((i + 1) % EXEC_UI_UPDATE_INTERVAL === 0 || i === batch.entries.length - 1) {
				set({
					executionLog: [...log],
					executionProgress: { current: i + 1, total: batch.entries.length },
				});
			}
		}

		// 拆分批次：成功的移到 undoStack，失败的留在 redoStack 供重试
		set((state) => {
			// 移除原批次
			let newRedoStack = state.redoStack.slice(0, -1);
			let newUndoStack = state.undoStack;

			// 失败的条目留在 redoStack 供重试
			if (failedEntries.length > 0) {
				newRedoStack = [...newRedoStack, { timestamp: batch.timestamp, entries: failedEntries }];
			}
			// 成功的条目移到 undoStack
			if (undoEntries.length > 0) {
				newUndoStack = [...state.undoStack, { timestamp: Date.now(), entries: undoEntries }];
			}

			return {
				isExecuting: false,
				undoStack: newUndoStack,
				redoStack: newRedoStack,
				canUndo: newUndoStack.length > 0,
				canRedo: newRedoStack.length > 0,
			};
		});
	},
}));
