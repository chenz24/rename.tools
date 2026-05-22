import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { SANDBOX_WORKER_SOURCE } from "@/lib/rename/js-sandbox-worker-source";
import { applyRule, computePreview, computePreviewAsync } from "@/lib/rename/rules";
import type {
	FileEntry,
	RenameRule,
	RuleContext,
	ExtensionScope,
} from "@/lib/rename/types";
import { getDefaultConfig } from "@/lib/rename/types";

// 测试工具函数
function createMockFile(
	id: string,
	name: string,
	baseName: string,
	extension: string,
	options: Partial<FileEntry> = {},
): FileEntry {
	return {
		id,
		name,
		baseName,
		extension,
		selected: true,
		relativePath: options.relativePath,
		size: options.size,
		modified: options.modified,
		...options,
	};
}

function createMockContext(
	index: number,
	originalName: string,
	ext: string,
	options: Partial<RuleContext> = {},
): RuleContext {
	return {
		index,
		ext,
		originalName,
		folderName: options.folderName,
		relativePath: options.relativePath,
		size: options.size,
		modified: options.modified,
		metadata: options.metadata,
	};
}

function installFakeSandboxWorker(scriptUrls: string[] = []) {
	const originalWorker = globalThis.Worker;

	class FakeWorker {
		onmessage: ((event: MessageEvent) => void) | null = null;
		onerror: ((event: ErrorEvent) => void) | null = null;
		private terminated = false;

		constructor(scriptUrl: string | URL) {
			scriptUrls.push(String(scriptUrl));
		}

		postMessage(message: {
			code: string;
			options: { name: string; ext: string; fullName: string; index: number };
		}) {
			queueMicrotask(() => {
				if (this.terminated) return;
				try {
					const fn = new Function(
						"options",
						`
							${message.code}
							if (typeof rename === "function") {
								return rename(options);
							}
							return options.name;
						`,
					);
					const result = fn(message.options);
					this.onmessage?.({
						data:
							typeof result === "string"
								? { success: true, result }
								: {
										success: false,
										result: message.options.name,
										error: `Expected string return value, got ${typeof result}`,
									},
					} as MessageEvent);
				} catch (error) {
					this.onerror?.({ message: error instanceof Error ? error.message : String(error) } as ErrorEvent);
				}
			});
		}

		terminate() {
			this.terminated = true;
		}
	}

	Object.defineProperty(globalThis, "Worker", {
		value: FakeWorker,
		configurable: true,
	});

	return () => {
		Object.defineProperty(globalThis, "Worker", {
			value: originalWorker,
			configurable: true,
		});
	};
}

describe("重命名规则测试", () => {
	describe("1. FindReplace - 查找替换", () => {
		it("基础查找替换", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "findReplace",
					config: {
						find: "old",
						replace: "new",
						caseSensitive: false,
						matchAll: true,
						usePosition: false,
						fromEnd: false,
						positionStart: 0,
						positionCount: 1,
					},
				},
			};
			const context = createMockContext(0, "old_file", ".txt");
			const result = applyRule(rule, "old_file", ".txt", 0, context);
			expect(result).toBe("new_file");
		});

		it("大小写敏感", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "findReplace",
					config: {
						find: "OLD",
						replace: "new",
						caseSensitive: true,
						matchAll: true,
						usePosition: false,
						fromEnd: false,
						positionStart: 0,
						positionCount: 1,
					},
				},
			};
			const context = createMockContext(0, "old_file", ".txt");
			const result = applyRule(rule, "old_file", ".txt", 0, context);
			expect(result).toBe("old_file");
		});

		it("位置替换 - 替换前3个字符", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "findReplace",
					config: {
						find: "",
						replace: "NEW",
						caseSensitive: false,
						matchAll: false,
						usePosition: true,
						fromEnd: false,
						positionStart: 0,
						positionCount: 3,
					},
				},
			};
			const context = createMockContext(0, "old_file", ".txt");
			const result = applyRule(rule, "old_file", ".txt", 0, context);
			expect(result).toBe("NEW_file");
		});
	});

	describe("2. Insert - 插入文本", () => {
		it("开头插入", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "insert",
					config: {
						text: "prefix_",
						position: "start",
						index: 0,
					},
				},
			};
			const context = createMockContext(0, "file", ".txt");
			const result = applyRule(rule, "file", ".txt", 0, context);
			expect(result).toBe("prefix_file");
		});

		it("结尾插入", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "insert",
					config: {
						text: "_suffix",
						position: "end",
						index: 0,
					},
				},
			};
			const context = createMockContext(0, "file", ".txt");
			const result = applyRule(rule, "file", ".txt", 0, context);
			expect(result).toBe("file_suffix");
		});

		it("插入日期变量", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "insert",
					config: {
						text: "{date}_",
						position: "start",
						index: 0,
					},
				},
			};
			const context = createMockContext(0, "file", ".txt");
			const result = applyRule(rule, "file", ".txt", 0, context);
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}_file$/);
		});
	});

	describe("3. Sequence - 序列号", () => {
		it("数字序列 - 基础", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "sequence",
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
				},
			};
			const context = createMockContext(0, "file", ".txt");
			const result = applyRule(rule, "file", ".txt", 0, context);
			expect(result).toBe("001file");
		});

		it("字母序列", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "sequence",
					config: {
						seqType: "alpha",
						start: 1,
						step: 1,
						padding: 0,
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
				},
			};
			const context = createMockContext(0, "file", ".txt");
			const result = applyRule(rule, "file", ".txt", 0, context);
			expect(result).toBe("Afile");
		});

		it("罗马数字序列", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "sequence",
					config: {
						seqType: "roman",
						start: 5,
						step: 1,
						padding: 0,
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
				},
			};
			const context = createMockContext(4, "file", ".txt");
			const result = applyRule(rule, "file", ".txt", 4, context);
			expect(result).toBe("IXfile");
		});

		it("模板序列 - 使用变量", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "sequence",
					config: {
						seqType: "numeric",
						start: 1,
						step: 1,
						padding: 2,
						position: "start",
						template: "{folderName}_{n}_{name}",
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
				},
			};
			const context = createMockContext(0, "file", ".txt", {
				folderName: "photos",
			});
			const result = applyRule(rule, "file", ".txt", 0, context);
			expect(result).toBe("photos_01_file");
		});
	});

	describe("4. CaseStyle - 大小写转换", () => {
		it("转小写", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "caseStyle",
					config: {
						mode: "lowercase",
						style: "none",
					},
				},
			};
			const context = createMockContext(0, "MyFile", ".txt");
			const result = applyRule(rule, "MyFile", ".txt", 0, context);
			expect(result).toBe("myfile");
		});

		it("转大写", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "caseStyle",
					config: {
						mode: "uppercase",
						style: "none",
					},
				},
			};
			const context = createMockContext(0, "myfile", ".txt");
			const result = applyRule(rule, "myfile", ".txt", 0, context);
			expect(result).toBe("MYFILE");
		});

		it("kebab-case", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "caseStyle",
					config: {
						mode: "kebab-case",
						style: "none",
					},
				},
			};
			const context = createMockContext(0, "MyFileName", ".txt");
			const result = applyRule(rule, "MyFileName", ".txt", 0, context);
			expect(result).toBe("my-file-name");
		});

		it("camelCase", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "caseStyle",
					config: {
						mode: "camelCase",
						style: "none",
					},
				},
			};
			const context = createMockContext(0, "my_file_name", ".txt");
			const result = applyRule(rule, "my_file_name", ".txt", 0, context);
			expect(result).toBe("myFileName");
		});

		it("PascalCase", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "caseStyle",
					config: {
						mode: "PascalCase",
						style: "none",
					},
				},
			};
			const context = createMockContext(0, "my_file_name", ".txt");
			const result = applyRule(rule, "my_file_name", ".txt", 0, context);
			expect(result).toBe("MyFileName");
		});

		it("snake_case", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "caseStyle",
					config: {
						mode: "snake_case",
						style: "none",
					},
				},
			};
			const context = createMockContext(0, "MyFileName", ".txt");
			const result = applyRule(rule, "MyFileName", ".txt", 0, context);
			expect(result).toBe("my_file_name");
		});
	});

	describe("5. Regex - 正则表达式", () => {
		it("日期格式转换", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "regex",
					config: {
						pattern: "(\\d{4})(\\d{2})(\\d{2})",
						replacement: "$1-$2-$3",
						flags: "g",
					},
				},
			};
			const context = createMockContext(0, "20240318", ".txt");
			const result = applyRule(rule, "20240318", ".txt", 0, context);
			expect(result).toBe("2024-03-18");
		});

		it("提取数字", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "regex",
					config: {
						pattern: "[^0-9]",
						replacement: "",
						flags: "g",
					},
				},
			};
			const context = createMockContext(0, "file123abc456", ".txt");
			const result = applyRule(rule, "file123abc456", ".txt", 0, context);
			expect(result).toBe("123456");
		});
	});

	describe("6. CustomJs - 自定义 JS", () => {
		it("Worker 沙盒示例代码在严格模式下正常执行", () => {
			let workerResult: unknown;
			const workerSelf = {
				onmessage: null as ((event: { data: unknown }) => void) | null,
				postMessage(message: unknown) {
					workerResult = message;
				},
			};

			vm.runInNewContext(SANDBOX_WORKER_SOURCE, { self: workerSelf });
			workerSelf.onmessage?.({
				data: {
					code: `function rename(options) {
  const { name } = options;
  return name
    .replace(/[^a-zA-Z0-9\\u4e00-\\u9fa5\\s_-]/g, '')
    .replace(/\\s+/g, '_')
    .toLowerCase();
}`,
					options: {
						name: "IMG 20250409_4126!",
						ext: "png",
						fullName: "IMG 20250409_4126!.png",
						index: 0,
					},
				},
			});

			expect(workerResult).toEqual({ success: true, result: "img_20250409_4126" });
		});

		it("优先使用 Blob Worker，避免 public worker 缓存", async () => {
			const originalCreateObjectURL = URL.createObjectURL;
			const originalRevokeObjectURL = URL.revokeObjectURL;
			const workerUrls: string[] = [];
			const revokedUrls: string[] = [];
			const restoreWorker = installFakeSandboxWorker(workerUrls);
			Object.defineProperty(URL, "createObjectURL", {
				value: () => "blob:custom-js-worker",
				configurable: true,
			});
			Object.defineProperty(URL, "revokeObjectURL", {
				value: (url: string) => {
					revokedUrls.push(url);
				},
				configurable: true,
			});
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "customJs",
					config: {
						code: `
							function rename(options) {
								return options.name.toUpperCase();
							}
						`,
					},
				},
			};

			try {
				const files = [createMockFile("1", "file.txt", "file", ".txt")];
				const results = await computePreviewAsync(files, [rule], "name");
				expect(results[0].newName).toBe("FILE.txt");
				expect(workerUrls[0]).toBe("blob:custom-js-worker");
				expect(revokedUrls).toEqual(["blob:custom-js-worker"]);
			} finally {
				restoreWorker();
				Object.defineProperty(URL, "createObjectURL", {
					value: originalCreateObjectURL,
					configurable: true,
				});
				Object.defineProperty(URL, "revokeObjectURL", {
					value: originalRevokeObjectURL,
					configurable: true,
				});
			}
		});

		it("Blob Worker 不可用时回退到带版本号的静态 Worker", async () => {
			const originalCreateObjectURL = URL.createObjectURL;
			const originalRevokeObjectURL = URL.revokeObjectURL;
			const workerUrls: string[] = [];
			const revokedUrls: string[] = [];
			const originalWorker = globalThis.Worker;

			class FallbackWorker {
				onmessage: ((event: MessageEvent) => void) | null = null;
				onerror: ((event: ErrorEvent) => void) | null = null;
				private terminated = false;

				constructor(scriptUrl: string | URL) {
					const url = String(scriptUrl);
					workerUrls.push(url);
					if (url.startsWith("blob:")) {
						throw new Error("Blob workers are blocked");
					}
				}

				postMessage(message: {
					code: string;
					options: { name: string; ext: string; fullName: string; index: number };
				}) {
					queueMicrotask(() => {
						if (this.terminated) return;
						this.onmessage?.({
							data: { success: true, result: message.options.name.toUpperCase() },
						} as MessageEvent);
					});
				}

				terminate() {
					this.terminated = true;
				}
			}

			Object.defineProperty(globalThis, "Worker", {
				value: FallbackWorker,
				configurable: true,
			});
			Object.defineProperty(URL, "createObjectURL", {
				value: () => "blob:blocked-custom-js-worker",
				configurable: true,
			});
			Object.defineProperty(URL, "revokeObjectURL", {
				value: (url: string) => {
					revokedUrls.push(url);
				},
				configurable: true,
			});

			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "customJs",
					config: {
						code: `
							function rename(options) {
								return options.name.toUpperCase();
							}
						`,
					},
				},
			};

			try {
				const files = [createMockFile("1", "file.txt", "file", ".txt")];
				const results = await computePreviewAsync(files, [rule], "name");
				expect(results[0].newName).toBe("FILE.txt");
				expect(workerUrls).toHaveLength(2);
				expect(workerUrls[0]).toBe("blob:blocked-custom-js-worker");
				expect(workerUrls[1]).toMatch(/^\/js-sandbox-worker\.js\?v=.+/);
				expect(revokedUrls).toEqual(["blob:blocked-custom-js-worker"]);
			} finally {
				Object.defineProperty(globalThis, "Worker", {
					value: originalWorker,
					configurable: true,
				});
				Object.defineProperty(URL, "createObjectURL", {
					value: originalCreateObjectURL,
					configurable: true,
				});
				Object.defineProperty(URL, "revokeObjectURL", {
					value: originalRevokeObjectURL,
					configurable: true,
				});
			}
		});

		it("基础自定义函数", async () => {
			const workerUrls: string[] = [];
			const restoreWorker = installFakeSandboxWorker(workerUrls);
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "customJs",
					config: {
						code: `
							function rename(options) {
								return options.name.toUpperCase();
							}
						`,
					},
				},
			};
			try {
				const files = [createMockFile("1", "file.txt", "file", ".txt")];
				const results = await computePreviewAsync(files, [rule], "name");
				expect(results[0].newName).toBe("FILE.txt");
				expect(workerUrls[0]).toMatch(/^(blob:|\/js-sandbox-worker\.js\?v=.+)/);
			} finally {
				restoreWorker();
			}
		});

		it("使用 index 参数", async () => {
			const restoreWorker = installFakeSandboxWorker();
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "customJs",
					config: {
						code: `
							function rename(options) {
								return String(options.index + 1).padStart(3, '0') + '_' + options.name;
							}
						`,
					},
				},
			};
			try {
				const files = Array.from({ length: 6 }, (_, i) =>
					createMockFile(String(i + 1), "file.txt", "file", ".txt"),
				);
				const results = await computePreviewAsync(files, [rule], "name");
				expect(results[5].newName).toBe("006_file.txt");
			} finally {
				restoreWorker();
			}
		});
	});

	describe("7. RemoveCleanup - 删除/清理", () => {
		it("删除前N个字符", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "removeCleanup",
					config: {
						mode: "chars",
						direction: "start",
						count: 3,
						rangeStart: 0,
						rangeEnd: 1,
						removeDigits: false,
						removeSymbols: false,
						removeSpaces: false,
						removeChinese: false,
						removeEnglish: false,
					},
				},
			};
			const context = createMockContext(0, "prefixfile", ".txt");
			const result = applyRule(rule, "prefixfile", ".txt", 0, context);
			expect(result).toBe("fixfile");
		});

		it("删除范围字符", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "removeCleanup",
					config: {
						mode: "range",
						direction: "start",
						count: 1,
						rangeStart: 3,
						rangeEnd: 6,
						removeDigits: false,
						removeSymbols: false,
						removeSpaces: false,
						removeChinese: false,
						removeEnglish: false,
					},
				},
			};
			const context = createMockContext(0, "abcdefgh", ".txt");
			const result = applyRule(rule, "abcdefgh", ".txt", 0, context);
			// rangeEnd 是排他的(exclusive),所以删除位置3-5(不包括6),即"def"
			expect(result).toBe("abcgh");
		});

		it("清理 - 删除数字", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "removeCleanup",
					config: {
						mode: "cleanup",
						direction: "start",
						count: 1,
						rangeStart: 0,
						rangeEnd: 1,
						removeDigits: true,
						removeSymbols: false,
						removeSpaces: false,
						removeChinese: false,
						removeEnglish: false,
					},
				},
			};
			const context = createMockContext(0, "file123", ".txt");
			const result = applyRule(rule, "file123", ".txt", 0, context);
			expect(result).toBe("file");
		});

		it("清理 - 删除符号", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "removeCleanup",
					config: {
						mode: "cleanup",
						direction: "start",
						count: 1,
						rangeStart: 0,
						rangeEnd: 1,
						removeDigits: false,
						removeSymbols: true,
						removeSpaces: false,
						removeChinese: false,
						removeEnglish: false,
					},
				},
			};
			const context = createMockContext(0, "file@#$name", ".txt");
			const result = applyRule(rule, "file@#$name", ".txt", 0, context);
			expect(result).toBe("filename");
		});

		it("清理 - 删除中文", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "removeCleanup",
					config: {
						mode: "cleanup",
						direction: "start",
						count: 1,
						rangeStart: 0,
						rangeEnd: 1,
						removeDigits: false,
						removeSymbols: false,
						removeSpaces: false,
						removeChinese: true,
						removeEnglish: false,
					},
				},
			};
			const context = createMockContext(0, "file文件名", ".txt");
			const result = applyRule(rule, "file文件名", ".txt", 0, context);
			expect(result).toBe("file");
		});
	});

	describe("集成测试 - 多规则组合", () => {
		it("复杂规则链: 清理 + 小写 + 序列号", () => {
			const files: FileEntry[] = [
				createMockFile("1", "IMG2024@#$.jpg", "IMG2024@#$", ".jpg"),
				createMockFile("2", "IMG2025@#$.jpg", "IMG2025@#$", ".jpg"),
			];

			const rules: RenameRule[] = [
				{
					id: "1",
					enabled: true,
					ruleConfig: {
						type: "removeCleanup",
						config: {
							mode: "cleanup",
							direction: "start",
							count: 1,
							rangeStart: 0,
							rangeEnd: 1,
							removeDigits: false,
							removeSymbols: true,
							removeSpaces: false,
							removeChinese: false,
							removeEnglish: false,
						},
					},
				},
				{
					id: "2",
					enabled: true,
					ruleConfig: {
						type: "caseStyle",
						config: {
							mode: "lowercase",
							style: "none",
						},
					},
				},
				{
					id: "3",
					enabled: true,
					ruleConfig: {
						type: "sequence",
						config: {
							seqType: "numeric",
							start: 1,
							step: 1,
							padding: 3,
							position: "start",
							template: "{n}_{name}",
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
					},
				},
			];

			const results = computePreview(files, rules, "name");
			expect(results[0].newName).toBe("001_img2024.jpg");
			expect(results[1].newName).toBe("002_img2025.jpg");
		});

		it("冲突检测", () => {
			const files: FileEntry[] = [
				createMockFile("1", "file1.txt", "file1", ".txt"),
				createMockFile("2", "file2.txt", "file2", ".txt"),
			];

			const rules: RenameRule[] = [
				{
					id: "1",
					enabled: true,
					ruleConfig: {
						type: "findReplace",
						config: {
							find: "file",
							replace: "doc",
							caseSensitive: false,
							matchAll: true,
							usePosition: false,
							fromEnd: false,
							positionStart: 0,
							positionCount: 1,
						},
					},
				},
				{
					id: "2",
					enabled: true,
					ruleConfig: {
						type: "findReplace",
						config: {
							find: "1",
							replace: "",
							caseSensitive: false,
							matchAll: true,
							usePosition: false,
							fromEnd: false,
							positionStart: 0,
							positionCount: 1,
						},
					},
				},
				{
					id: "3",
					enabled: true,
					ruleConfig: {
						type: "findReplace",
						config: {
							find: "2",
							replace: "",
							caseSensitive: false,
							matchAll: true,
							usePosition: false,
							fromEnd: false,
							positionStart: 0,
							positionCount: 1,
						},
					},
				},
			];

			const results = computePreview(files, rules, "name");
			expect(results[0].conflict).toBe(true);
			expect(results[1].conflict).toBe(true);
		});

		it("按文件夹分组序列号", () => {
			const files: FileEntry[] = [
				createMockFile("1", "file1.txt", "file1", ".txt", {
					relativePath: "folder1/file1.txt",
				}),
				createMockFile("2", "file2.txt", "file2", ".txt", {
					relativePath: "folder1/file2.txt",
				}),
				createMockFile("3", "file3.txt", "file3", ".txt", {
					relativePath: "folder2/file3.txt",
				}),
			];

			const rules: RenameRule[] = [
				{
					id: "1",
					enabled: true,
					ruleConfig: {
						type: "sequence",
						config: {
							seqType: "numeric",
							start: 1,
							step: 1,
							padding: 2,
							position: "start",
							template: "{n}_{name}",
							scope: "perFolder",
							sortBeforeNumbering: false,
							sortBy: "name",
							sortOrder: "asc",
							naturalSort: true,
							preserveOriginal: false,
							preservePattern: "(\\d+)",
							hierarchical: false,
							hierarchySeparator: ".",
						},
					},
				},
			];

			const results = computePreview(files, rules, "name");
			expect(results[0].newName).toBe("01_file1.txt");
			expect(results[1].newName).toBe("02_file2.txt");
			expect(results[2].newName).toBe("01_file3.txt"); // 新文件夹重新从01开始
		});
	});

	describe("边界测试", () => {
		it("空文件名检测", () => {
			const files: FileEntry[] = [
				createMockFile("1", "123abc.txt", "123abc", ".txt"),
			];

			const rules: RenameRule[] = [
				{
					id: "1",
					enabled: true,
					ruleConfig: {
						type: "removeCleanup",
						config: {
							mode: "cleanup",
							direction: "start",
							count: 1,
							rangeStart: 0,
							rangeEnd: 1,
							removeDigits: true,
							removeSymbols: false,
							removeSpaces: false,
							removeChinese: false,
							removeEnglish: true,
						},
					},
				},
			];

			const results = computePreview(files, rules, "name");
			expect(results[0].conflict).toBe(true);
			expect(results[0].error).toBe("empty");
		});

		it("非法字符检测", () => {
			const files: FileEntry[] = [createMockFile("1", "file.txt", "file", ".txt")];

			const rules: RenameRule[] = [
				{
					id: "1",
					enabled: true,
					ruleConfig: {
						type: "insert",
						config: {
							text: "file<>:",
							position: "start",
							index: 0,
						},
					},
				},
			];

			const results = computePreview(files, rules, "name");
			expect(results[0].conflict).toBe(true);
			expect(results[0].error).toBe("illegal");
		});

		it("罗马数字边界 (>3999)", () => {
			const rule: RenameRule = {
				id: "1",
				enabled: true,
				ruleConfig: {
					type: "sequence",
					config: {
						seqType: "roman",
						start: 4000,
						step: 1,
						padding: 0,
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
				},
			};
			const context = createMockContext(0, "file", ".txt");
			const result = applyRule(rule, "file", ".txt", 0, context);
			expect(result).toBe("4000file"); // 超过3999回退到数字
		});
	});
});
