import { resolveMetadataVariable } from "@/lib/file-metadata";
import type {
	CaseStyleConfig,
	CustomJsConfig,
	ExtensionScope,
	FileEntry,
	FindReplaceConfig,
	InsertConfig,
	PreviewResult,
	RegexConfig,
	RemoveCleanupConfig,
	RenameRule,
	RuleContext,
	SequenceConfig,
} from "@/lib/rename/types";

function formatDate(date: Date, format: string): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hour = String(date.getHours()).padStart(2, "0");
	const minute = String(date.getMinutes()).padStart(2, "0");
	const second = String(date.getSeconds()).padStart(2, "0");

	return format
		.replace(/YYYY/g, String(year))
		.replace(/MM/g, month)
		.replace(/DD/g, day)
		.replace(/HH/g, hour)
		.replace(/mm/g, minute)
		.replace(/ss/g, second);
}

function resolveVariables(text: string, context: RuleContext): string {
	const now = new Date();

	return text
		.replace(/\{date\}/g, now.toISOString().slice(0, 10))
		.replace(/\{date:([^}]+)\}/g, (_, fmt) => formatDate(now, fmt))
		.replace(/\{time\}/g, now.toTimeString().slice(0, 8))
		.replace(/\{datetime\}/g, now.toISOString().slice(0, 19).replace("T", "_"))
		.replace(/\{timestamp\}/g, String(now.getTime()))
		.replace(/\{n\}/g, String(context.index + 1))
		.replace(/\{name\}/g, context.currentName ?? context.originalName)
		.replace(/\{folderName\}/g, context.folderName || "")
		.replace(/\{relativePath\}/g, context.relativePath || "")
		.replace(/\{(exif\.[a-z]+)\}/g, (match, key) => {
			const val = resolveMetadataVariable(key, context.metadata);
			return val ?? match;
		})
		.replace(/\{(media\.[a-z]+)\}/g, (match, key) => {
			const val = resolveMetadataVariable(key, context.metadata);
			return val ?? match;
		});
}

function toAlpha(n: number): string {
	if (n <= 0) return "";
	let result = "";
	while (n > 0) {
		n--;
		result = String.fromCharCode(65 + (n % 26)) + result;
		n = Math.floor(n / 26);
	}
	return result;
}

function toRoman(n: number): string {
	if (n <= 0 || n >= 4000) return String(n);
	const map: [number, string][] = [
		[1000, "M"],
		[900, "CM"],
		[500, "D"],
		[400, "CD"],
		[100, "C"],
		[90, "XC"],
		[50, "L"],
		[40, "XL"],
		[10, "X"],
		[9, "IX"],
		[5, "V"],
		[4, "IV"],
		[1, "I"],
	];
	let result = "";
	for (const [value, symbol] of map) {
		while (n >= value) {
			result += symbol;
			n -= value;
		}
	}
	return result;
}

function getFileCategory(ext: string): string {
	const lowerExt = ext.toLowerCase();
	const categories: Record<string, string[]> = {
		image: [
			".jpg",
			".jpeg",
			".png",
			".gif",
			".bmp",
			".webp",
			".svg",
			".tiff",
			".ico",
			".heic",
			".heif",
			".avif",
		],
		video: [".mp4", ".mov", ".avi", ".mkv", ".wmv", ".flv", ".webm", ".m4v"],
		audio: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".wma", ".m4a"],
		document: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".rtf", ".odt"],
		code: [
			".js",
			".ts",
			".jsx",
			".tsx",
			".py",
			".java",
			".cpp",
			".c",
			".h",
			".css",
			".html",
			".json",
			".xml",
			".yml",
			".yaml",
		],
	};
	for (const [cat, exts] of Object.entries(categories)) {
		if (exts.includes(lowerExt)) return cat;
	}
	return "other";
}

function naturalCompare(a: string, b: string): number {
	return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

interface SequenceFileData {
	index: number;
	seqValue?: string;
}

function computeSequenceData(
	files: FileEntry[],
	config: SequenceConfig,
	getDirKey: (file: FileEntry) => string,
): Map<string, SequenceFileData> {
	const result = new Map<string, SequenceFileData>();

	// Preserve original numbers mode: extract number from filename and reformat
	// Files where extraction fails are skipped (no entry in map) and fall back to normal sequencing
	if (config.preserveOriginal) {
		for (const file of files) {
			try {
				const re = new RegExp(config.preservePattern);
				const match = file.baseName.match(re);
				if (match?.[1]) {
					const extractedNum = Number.parseInt(match[1], 10);
					if (!Number.isNaN(extractedNum) && extractedNum > 0) {
						let seqValue: string;
						switch (config.seqType) {
							case "numeric":
								seqValue = String(extractedNum).padStart(config.padding, "0");
								break;
							case "alpha":
								seqValue = toAlpha(extractedNum);
								break;
							case "roman":
								seqValue = toRoman(extractedNum);
								break;
						}
						result.set(file.id, { index: extractedNum, seqValue });
					}
				}
			} catch {
				// invalid regex, skip this file
			}
		}
		return result;
	}

	// Group files by scope
	const groups = new Map<string, FileEntry[]>();
	for (const file of files) {
		let groupKey: string;
		switch (config.scope) {
			case "perFolder":
				groupKey = getDirKey(file);
				break;
			case "perExtension":
				groupKey = file.extension.toLowerCase();
				break;
			case "perCategory":
				groupKey = getFileCategory(file.extension);
				break;
			default:
				groupKey = "__global__";
				break;
		}
		if (!groups.has(groupKey)) groups.set(groupKey, []);
		groups.get(groupKey)!.push(file);
	}

	// Sort within groups if needed
	if (config.sortBeforeNumbering) {
		for (const group of groups.values()) {
			group.sort((a, b) => {
				let cmp: number;
				switch (config.sortBy) {
					case "name":
						cmp = config.naturalSort
							? naturalCompare(a.baseName, b.baseName)
							: a.baseName.localeCompare(b.baseName);
						break;
					case "size":
						cmp = (a.size ?? 0) - (b.size ?? 0);
						break;
					case "modified":
						cmp = (a.modified ?? 0) - (b.modified ?? 0);
						break;
					case "extension":
						cmp = a.extension.localeCompare(b.extension);
						break;
					default:
						cmp = 0;
				}
				return config.sortOrder === "desc" ? -cmp : cmp;
			});
		}
	}

	// Hierarchical numbering (requires non-global scope)
	if (config.hierarchical && config.scope !== "global") {
		const groupKeys = [...groups.keys()].sort();
		for (let g = 0; g < groupKeys.length; g++) {
			const groupFiles = groups.get(groupKeys[g])!;
			const level1 = config.start + g * config.step;
			for (let f = 0; f < groupFiles.length; f++) {
				const level2 = config.start + f * config.step;
				let seqValue: string;
				if (config.seqType === "numeric") {
					const pad = Math.max(1, config.padding);
					const l1 = String(level1).padStart(pad, "0");
					const l2 = String(level2).padStart(pad, "0");
					seqValue = `${l1}${config.hierarchySeparator}${l2}`;
				} else {
					const fmt = config.seqType === "alpha" ? toAlpha : toRoman;
					seqValue = `${fmt(level1)}${config.hierarchySeparator}${fmt(level2)}`;
				}
				result.set(groupFiles[f].id, { index: f, seqValue });
			}
		}
		return result;
	}

	// Regular indexing within groups
	for (const group of groups.values()) {
		for (let i = 0; i < group.length; i++) {
			result.set(group[i].id, { index: i });
		}
	}

	return result;
}

function applyFindReplace(name: string, c: FindReplaceConfig): string {
	if (c.usePosition) {
		const start = c.fromEnd
			? Math.max(0, name.length - c.positionStart - c.positionCount)
			: c.positionStart;
		const end = start + c.positionCount;
		return name.slice(0, start) + c.replace + name.slice(end);
	}
	if (!c.find) return name;
	if (c.matchAll) {
		const flags = c.caseSensitive ? "g" : "gi";
		return name.replace(new RegExp(escapeRegex(c.find), flags), c.replace);
	}
	if (c.caseSensitive) {
		const idx = name.indexOf(c.find);
		if (idx === -1) return name;
		return name.slice(0, idx) + c.replace + name.slice(idx + c.find.length);
	}
	const idx = name.toLowerCase().indexOf(c.find.toLowerCase());
	if (idx === -1) return name;
	return name.slice(0, idx) + c.replace + name.slice(idx + c.find.length);
}

function applyInsert(name: string, c: InsertConfig, context: RuleContext): string {
	if (!c.text) return name;
	const text = resolveVariables(c.text, context);
	switch (c.position) {
		case "start":
			return text + name;
		case "end":
			return name + text;
		case "index": {
			const i = Math.min(Math.max(0, c.index), name.length);
			return name.slice(0, i) + text + name.slice(i);
		}
	}
}

function applySequence(
	name: string,
	c: SequenceConfig,
	index: number,
	context: RuleContext,
	precomputedSeqValue?: string,
): string {
	let seqValue: string;

	if (precomputedSeqValue !== undefined) {
		seqValue = precomputedSeqValue;
	} else {
		const numValue = c.start + index * c.step;
		switch (c.seqType) {
			case "numeric":
				seqValue = String(numValue).padStart(c.padding, "0");
				break;
			case "alpha":
				seqValue = toAlpha(numValue);
				break;
			case "roman":
				seqValue = toRoman(numValue);
				break;
		}
	}

	if (c.template) {
		const withSeq = c.template.replace(/\{n\}/g, seqValue);
		return resolveVariables(withSeq, context);
	}

	switch (c.position) {
		case "start":
			return seqValue + name;
		case "end":
			return name + seqValue;
		case "replaceAll":
			return seqValue;
	}
}

function toWords(str: string): string[] {
	return (
		str
			// 处理 camelCase 和 PascalCase 边界：myFileName -> my File Name
			.replace(/([a-z])([A-Z])/g, "$1 $2")
			// 处理连续大写后跟小写：XMLParser -> XML Parser
			.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
			// 将下划线和横线替换为空格
			.replace(/[_-]+/g, " ")
			.trim()
			// 按空格分割
			.split(/\s+/)
			// 过滤空字符串
			.filter(Boolean)
	);
}

function applyCaseStyle(name: string, c: CaseStyleConfig): string {
	let result = name;
	// style first
	switch (c.style) {
		case "spaceToDash":
			result = result.replace(/ /g, "-");
			break;
		case "spaceToUnderscore":
			result = result.replace(/ /g, "_");
			break;
		case "dashToSpace":
			result = result.replace(/-/g, " ");
			break;
		case "underscoreToSpace":
			result = result.replace(/_/g, " ");
			break;
	}
	// case
	switch (c.mode) {
		case "uppercase":
			return result.toUpperCase();
		case "lowercase":
			return result.toLowerCase();
		case "titlecase":
			return result.replace(/\b\w/g, (ch) => ch.toUpperCase());
		case "sentencecase":
			return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
		case "camelCase": {
			const words = toWords(result);
			return words
				.map((w, i) =>
					i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
				)
				.join("");
		}
		case "PascalCase": {
			const words = toWords(result);
			return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
		}
		case "kebab-case": {
			const words = toWords(result);
			return words.map((w) => w.toLowerCase()).join("-");
		}
		case "snake_case": {
			const words = toWords(result);
			return words.map((w) => w.toLowerCase()).join("_");
		}
		default:
			return result;
	}
}

function applyRegex(name: string, c: RegexConfig): string {
	if (!c.pattern) return name;
	try {
		const re = new RegExp(c.pattern, c.flags || "g");
		return name.replace(re, c.replacement);
	} catch {
		return name;
	}
}

function applyCustomJs(
	name: string,
	ext: string,
	index: number,
	c: CustomJsConfig,
	context: RuleContext,
): string {
	try {
		// Build options object for the rename function
		const options = {
			name,
			ext: ext.startsWith(".") ? ext.slice(1) : ext,
			fullName: ext ? `${name}${ext}` : name,
			index,
			size: context.size,
			modifiedTime: context.modified,
		};

		// Wrap user code to call rename(options) and return result
		const wrappedCode = `
			${c.code}
			if (typeof rename === 'function') {
				return rename(arguments[0]);
			}
			return arguments[0].name;
		`;

		const fn = new Function(wrappedCode);
		const result = fn(options);

		if (typeof result === "string") {
			return result;
		}
		console.warn(`Custom JS returned non-string value for "${name}": ${typeof result}`);
		return name;
	} catch (error) {
		console.error(`Custom JS execution error for "${name}":`, error);
		return name;
	}
}

function applyRemoveCleanup(name: string, c: RemoveCleanupConfig): string {
	switch (c.mode) {
		case "chars": {
			const count = Math.min(c.count, name.length);
			if (count <= 0) return name;
			return c.direction === "start" ? name.slice(count) : name.slice(0, name.length - count);
		}
		case "range": {
			const start = Math.max(0, Math.min(c.rangeStart, name.length));
			const end = Math.max(start, Math.min(c.rangeEnd, name.length));
			return name.slice(0, start) + name.slice(end);
		}
		case "cleanup": {
			let result = name;
			if (c.removeDigits) result = result.replace(/\d/g, "");
			if (c.removeEnglish) result = result.replace(/[a-zA-Z]/g, "");
			if (c.removeChinese) result = result.replace(/[\u4e00-\u9fff]/g, "");
			if (c.removeSpaces) result = result.replace(/\s+/g, "");
			if (c.removeSymbols) result = result.replace(/[^\w\s\u4e00-\u9fff]/g, "");
			return result;
		}
	}
}

function escapeRegex(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasInvalidFileNameChars(name: string) {
	if (/[<>:"/\\|?*]/.test(name)) return true;
	for (const ch of name) {
		if (ch.charCodeAt(0) <= 31) return true;
	}
	return false;
}

export function applyRule(
	rule: RenameRule,
	name: string,
	ext: string,
	index: number,
	context: RuleContext,
	precomputedSeqValue?: string,
): string {
	if (!rule.enabled) return name;
	const { ruleConfig } = rule;
	switch (ruleConfig.type) {
		case "findReplace":
			return applyFindReplace(name, ruleConfig.config);
		case "insert":
			return applyInsert(name, ruleConfig.config, context);
		case "sequence":
			return applySequence(name, ruleConfig.config, index, context, precomputedSeqValue);
		case "caseStyle":
			return applyCaseStyle(name, ruleConfig.config);
		case "regex":
			return applyRegex(name, ruleConfig.config);
		case "customJs":
			return applyCustomJs(name, ext, index, ruleConfig.config, context);
		case "removeCleanup":
			return applyRemoveCleanup(name, ruleConfig.config);
	}
}

export function computePreview(
	files: FileEntry[],
	rules: RenameRule[],
	extensionScope: ExtensionScope,
): PreviewResult[] {
	const selectedFiles = files.filter((f) => f.selected);
	const results: PreviewResult[] = [];
	// Conflict key = directory + newName, so files in different directories don't conflict
	const nameCount = new Map<string, number>();
	const conflictKeys: string[] = [];

	const getDirKey = (file: FileEntry) => {
		if (!file.relativePath) return "";
		const lastSlash = file.relativePath.lastIndexOf("/");
		return lastSlash > 0 ? file.relativePath.slice(0, lastSlash) : "";
	};

	// Pre-compute sequence data for each enabled sequence rule
	const sequenceDataMap = new Map<string, Map<string, SequenceFileData>>();
	for (const rule of rules) {
		if (!rule.enabled || rule.ruleConfig.type !== "sequence") continue;
		const seqConfig = rule.ruleConfig.config as SequenceConfig;
		sequenceDataMap.set(rule.id, computeSequenceData(selectedFiles, seqConfig, getDirKey));
	}

	// Helper to apply a single rule with sequence-aware index lookup
	const applyRuleWithSeqData = (
		rule: RenameRule,
		currentName: string,
		ext: string,
		globalIndex: number,
		fileId: string,
		context: RuleContext,
	): string => {
		let effectiveIndex = globalIndex;
		let precomputedSeqValue: string | undefined;
		if (rule.ruleConfig.type === "sequence" && sequenceDataMap.has(rule.id)) {
			const fileData = sequenceDataMap.get(rule.id)!.get(fileId);
			if (fileData) {
				effectiveIndex = fileData.index;
				precomputedSeqValue = fileData.seqValue;
			}
		}
		return applyRule(rule, currentName, ext, effectiveIndex, context, precomputedSeqValue);
	};

	for (let i = 0; i < selectedFiles.length; i++) {
		const file = selectedFiles[i];
		let name: string;
		let ext: string;

		const folderName = file.relativePath ? file.relativePath.split("/").slice(-2, -1)[0] || "" : "";

		const context: RuleContext = {
			index: i,
			ext: file.extension,
			originalName: file.baseName,
			currentName: file.baseName,
			folderName,
			relativePath: file.relativePath,
			size: file.size,
			modified: file.modified,
			metadata: file.metadata,
		};

		switch (extensionScope) {
			case "name":
				name = file.baseName;
				ext = file.extension;
				for (const rule of rules) {
					name = applyRuleWithSeqData(rule, name, ext, i, file.id, context);
					context.currentName = name;
				}
				break;
			case "extension":
				name = file.baseName;
				ext = file.extension.startsWith(".") ? file.extension.slice(1) : file.extension;
				for (const rule of rules) {
					ext = applyRuleWithSeqData(rule, ext, "", i, file.id, context);
					context.currentName = ext;
				}
				ext = ext ? `.${ext}` : "";
				break;
			case "full":
				name = file.name;
				ext = "";
				for (const rule of rules) {
					name = applyRuleWithSeqData(rule, name, file.extension, i, file.id, context);
					context.currentName = name;
				}
				break;
		}

		const fullName = extensionScope === "full" ? name : name + ext;
		const conflictKey = `${getDirKey(file)}/${fullName}`;
		nameCount.set(conflictKey, (nameCount.get(conflictKey) || 0) + 1);
		conflictKeys.push(conflictKey);
		const dirPath = getDirKey(file);
		results.push({
			fileId: file.id,
			original: file.name,
			newName: fullName,
			hasChange: fullName !== file.name,
			conflict: false,
			dirPath: dirPath || undefined,
		});
	}

	// Mark conflicts (only within the same directory)
	for (let i = 0; i < results.length; i++) {
		const r = results[i];
		if ((nameCount.get(conflictKeys[i]) || 0) > 1) {
			r.conflict = true;
		}
		// Check illegal chars and empty filename
		const trimmedName = r.newName.trim();
		const isEmptyName = trimmedName === "" || trimmedName === ".";
		if (hasInvalidFileNameChars(r.newName) || isEmptyName) {
			r.conflict = true;
			r.error = isEmptyName ? "empty" : "illegal";
		}
	}

	// Add non-selected files
	for (const file of files) {
		if (!file.selected) {
			const dirPath = getDirKey(file);
			results.push({
				fileId: file.id,
				original: file.name,
				newName: file.name,
				hasChange: false,
				conflict: false,
				dirPath: dirPath || undefined,
			});
		}
	}

	return results;
}

export function autoFixConflicts(
	results: PreviewResult[],
	extensionScope: ExtensionScope,
): PreviewResult[] {
	const conflictGroups = new Map<string, PreviewResult[]>();

	for (const result of results) {
		if (!result.conflict || result.error) continue;

		const getDirPath = () => result.dirPath || "";
		const key = `${getDirPath()}/${result.newName}`;

		if (!conflictGroups.has(key)) {
			conflictGroups.set(key, []);
		}
		conflictGroups.get(key)!.push(result);
	}

	const nameCount = new Map<string, number>();
	const fixedResults = results.map((r) => ({ ...r }));

	for (const group of conflictGroups.values()) {
		if (group.length <= 1) continue;

		for (let i = 0; i < group.length; i++) {
			const result = group[i];
			const fixed = fixedResults.find((fr) => fr.fileId === result.fileId);
			if (!fixed) continue;

			let baseName = fixed.newName;
			let ext = "";

			if (extensionScope !== "full") {
				const lastDot = baseName.lastIndexOf(".");
				if (lastDot > 0) {
					ext = baseName.slice(lastDot);
					baseName = baseName.slice(0, lastDot);
				}
			}

			const suffix = ` (${i + 1})`;
			fixed.newName = baseName + suffix + ext;
			fixed.hasChange = fixed.newName !== fixed.original;
			fixed.conflict = false;
			fixed.error = undefined;
		}
	}

	const getDirKey = (result: PreviewResult) => result.dirPath || "";

	for (const result of fixedResults) {
		if (!result.hasChange) continue;
		const conflictKey = `${getDirKey(result)}/${result.newName}`;
		nameCount.set(conflictKey, (nameCount.get(conflictKey) || 0) + 1);
	}

	const conflictKeys: string[] = [];
	for (const result of fixedResults) {
		if (!result.hasChange) {
			conflictKeys.push("");
			continue;
		}
		const conflictKey = `${getDirKey(result)}/${result.newName}`;
		conflictKeys.push(conflictKey);
	}

	for (let i = 0; i < fixedResults.length; i++) {
		const r = fixedResults[i];
		if (!r.hasChange) continue;

		const trimmedName = r.newName.trim();
		const isEmptyName = trimmedName === "" || trimmedName === ".";
		if ((nameCount.get(conflictKeys[i]) || 0) > 1) {
			r.conflict = true;
		} else if (hasInvalidFileNameChars(r.newName) || isEmptyName) {
			r.conflict = true;
			r.error = isEmptyName ? "empty" : "illegal";
		} else {
			r.conflict = false;
		}
	}

	return fixedResults;
}
