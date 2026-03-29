export interface FileEntry {
	id: string;
	name: string; // full name with extension
	baseName: string; // name without extension
	extension: string; // extension with dot, e.g. ".jpg"
	selected: boolean;
	handle?: FileSystemFileHandle;
	relativePath?: string; // relative path from imported folder root, e.g. "sub/dir/file.jpg"
	size?: number; // file size in bytes
	modified?: number; // last modified timestamp
	metadata?: import("@/lib/file-metadata/types").FileMetadata | null;
	metadataState?: import("@/lib/file-metadata/types").MetadataLoadState;
	scrapedInfo?: import("@/lib/media-scraper/types").ScrapedMediaInfo | null;
}

export interface RuleContext {
	index: number;
	ext: string;
	originalName: string;
	currentName?: string; // 当前规则链处理后的名称,用于序列号模板等场景
	folderName?: string;
	relativePath?: string;
	size?: number;
	modified?: number;
	metadata?: import("@/lib/file-metadata/types").FileMetadata | null;
}

/** Options object passed to custom JS rename function */
export interface CustomJsOptions {
	name: string;
	ext: string;
	fullName: string;
	index: number;
	size?: number;
	modifiedTime?: number;
}

export type ExtensionScope = "name" | "extension" | "full";

export type RuleType =
	| "findReplace"
	| "insert"
	| "sequence"
	| "caseStyle"
	| "regex"
	| "customJs"
	| "removeCleanup";

export interface FindReplaceConfig {
	find: string;
	replace: string;
	caseSensitive: boolean;
	matchAll: boolean;
	usePosition: boolean;
	fromEnd: boolean;
	positionStart: number;
	positionCount: number;
}

export interface InsertConfig {
	text: string;
	position: "start" | "end" | "index";
	index: number;
}

export interface SequenceConfig {
	seqType: "numeric" | "alpha" | "roman";
	start: number;
	step: number;
	padding: number;
	position: "start" | "end" | "replaceAll";
	template: string;
	// Scope: how sequence index is calculated
	scope: "global" | "perFolder" | "perExtension" | "perCategory";
	// Sort before numbering
	sortBeforeNumbering: boolean;
	sortBy: "name" | "size" | "modified" | "extension";
	sortOrder: "asc" | "desc";
	naturalSort: boolean;
	// Preserve original numbers
	preserveOriginal: boolean;
	preservePattern: string; // regex to extract original number
	// Hierarchical numbering
	hierarchical: boolean;
	hierarchySeparator: string; // ".", "-", "_"
}

export interface CaseStyleConfig {
	mode:
		| "uppercase"
		| "lowercase"
		| "titlecase"
		| "sentencecase"
		| "camelCase"
		| "PascalCase"
		| "kebab-case"
		| "snake_case"
		| "none";
	style: "none" | "spaceToDash" | "spaceToUnderscore" | "dashToSpace" | "underscoreToSpace";
}

export interface RegexConfig {
	pattern: string;
	replacement: string;
	flags: string;
}

export interface CustomJsConfig {
	code: string;
	lastError?: string;
}

export interface RemoveCleanupConfig {
	mode: "chars" | "range" | "cleanup";
	// chars 模式
	direction: "start" | "end";
	count: number;
	// range 模式
	rangeStart: number;
	rangeEnd: number;
	// cleanup 模式 — 多选
	removeDigits: boolean;
	removeSymbols: boolean;
	removeSpaces: boolean;
	removeChinese: boolean;
	removeEnglish: boolean;
}

export type RuleConfig =
	| { type: "findReplace"; config: FindReplaceConfig }
	| { type: "insert"; config: InsertConfig }
	| { type: "sequence"; config: SequenceConfig }
	| { type: "caseStyle"; config: CaseStyleConfig }
	| { type: "regex"; config: RegexConfig }
	| { type: "customJs"; config: CustomJsConfig }
	| { type: "removeCleanup"; config: RemoveCleanupConfig };

export interface RenameRule {
	id: string;
	enabled: boolean;
	ruleConfig: RuleConfig;
}

export interface PreviewResult {
	fileId: string;
	original: string;
	newName: string;
	hasChange: boolean;
	conflict: boolean;
	error?: string;
	dirPath?: string;
}

export function getDefaultConfig(type: RuleType): RuleConfig {
	switch (type) {
		case "findReplace":
			return {
				type,
				config: {
					find: "",
					replace: "",
					caseSensitive: false,
					matchAll: true,
					usePosition: false,
					fromEnd: false,
					positionStart: 0,
					positionCount: 1,
				},
			};
		case "insert":
			return { type, config: { text: "", position: "start", index: 0 } };
		case "sequence":
			return {
				type,
				config: {
					seqType: "numeric",
					start: 1,
					step: 1,
					padding: 3,
					position: "start",
					template: "",
					scope: "global",
					sortBeforeNumbering: false,
					sortBy: "name",
					sortOrder: "asc",
					naturalSort: true,
					preserveOriginal: false,
					preservePattern: "(\\d+)",
					hierarchical: false,
					hierarchySeparator: ".",
				},
			};
		case "caseStyle":
			return { type, config: { mode: "lowercase", style: "none" } };
		case "regex":
			return { type, config: { pattern: "", replacement: "", flags: "g" } };
		case "customJs":
			return {
				type,
				config: {
					code: `/**
 * @param {Object} options
 * @param {string} options.name - 文件名 (不含扩展名)
 * @param {string} options.ext - 扩展名 (不含点, 如 "jpg")
 * @param {string} options.fullName - 完整文件名
 * @param {number} options.index - 序号 (从0开始)
 * @param {number} [options.size] - 文件大小 (字节)
 * @param {number} [options.modifiedTime] - 修改时间戳
 * @returns {string} 新文件名 (不含扩展名)
 */
function rename(options) {
  const { name, ext, index } = options;
  // your code here
  return name;
}`,
				},
			};
		case "removeCleanup":
			return {
				type,
				config: {
					mode: "chars",
					direction: "start",
					count: 1,
					rangeStart: 0,
					rangeEnd: 1,
					removeDigits: false,
					removeSymbols: false,
					removeSpaces: false,
					removeChinese: false,
					removeEnglish: false,
				},
			};
	}
}

export type PresetCategory = "photo" | "document" | "code" | "video" | "music" | "general";

export type PresetSortMode = "recent" | "frequent" | "name" | "created";

export interface UserPreset {
	id: string;
	name: string;
	description?: string;
	tags?: string[];
	category?: PresetCategory;
	rules: RuleConfig[];
	createdAt: number;
	lastUsedAt: number;
	usageCount: number;
	isPinned?: boolean;
}

export interface PresetPinned {
	type: "system" | "user";
	id: string;
	pinnedAt: number;
}

// 过滤相关类型
export type FilterField = "name" | "extension" | "size" | "modified";
export type FilterOperator =
	| "contains"
	| "notContains"
	| "equals"
	| "notEquals"
	| "startsWith"
	| "endsWith"
	| "regex"
	| "greaterThan"
	| "lessThan";

export interface FilterCondition {
	id: string;
	field: FilterField;
	operator: FilterOperator;
	value: string;
	caseSensitive?: boolean;
}

export interface FileFilter {
	conditions: FilterCondition[];
	logic: "AND" | "OR";
}
