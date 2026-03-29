/**
 * 自动化测试用例数据
 * 对应 TEST-CASES.md 中的所有测试场景
 */

import type { TestCase } from "./test-runner";
import { createFile, createRule } from "./test-runner";

export const testCases: TestCase[] = [
	// ========== 基础功能测试 ==========
	{
		id: "TC001",
		name: "基础序列号 - 数字",
		description: "测试基础数字序列号功能",
		files: [
			createFile("1", "file1.txt"),
			createFile("2", "file2.txt"),
			createFile("3", "file3.txt"),
		],
		rules: [
			createRule("r1", "sequence", {
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
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "001file1.txt" },
			{ fileId: "2", expectedName: "002file2.txt" },
			{ fileId: "3", expectedName: "003file3.txt" },
		],
	},

	{
		id: "TC002",
		name: "序列号 - 字母",
		description: "测试字母序列号",
		files: [
			createFile("1", "file1.txt"),
			createFile("2", "file2.txt"),
			createFile("3", "file3.txt"),
		],
		rules: [
			createRule("r1", "sequence", {
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
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "Afile1.txt" },
			{ fileId: "2", expectedName: "Bfile2.txt" },
			{ fileId: "3", expectedName: "Cfile3.txt" },
		],
	},

	{
		id: "TC003",
		name: "序列号 - 罗马数字",
		description: "测试罗马数字序列号",
		files: [
			createFile("1", "file1.txt"),
			createFile("2", "file2.txt"),
			createFile("3", "file3.txt"),
		],
		rules: [
			createRule("r1", "sequence", {
				seqType: "roman",
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
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "Ifile1.txt" },
			{ fileId: "2", expectedName: "IIfile2.txt" },
			{ fileId: "3", expectedName: "IIIfile3.txt" },
		],
	},

	{
		id: "TC004",
		name: "查找替换 - 基础",
		description: "测试基础查找替换功能",
		files: [createFile("1", "old_file.txt"), createFile("2", "old_document.txt")],
		rules: [
			createRule("r1", "findReplace", {
				find: "old",
				replace: "new",
				caseSensitive: false,
				matchAll: true,
				usePosition: false,
				fromEnd: false,
				positionStart: 0,
				positionCount: 1,
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "new_file.txt" },
			{ fileId: "2", expectedName: "new_document.txt" },
		],
	},

	{
		id: "TC005",
		name: "大小写转换 - kebab-case",
		description: "测试 kebab-case 转换",
		files: [createFile("1", "MyFileName.txt"), createFile("2", "AnotherFile.txt")],
		rules: [
			createRule("r1", "caseStyle", {
				mode: "kebab-case",
				style: "none",
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "my-file-name.txt" },
			{ fileId: "2", expectedName: "another-file.txt" },
		],
	},

	{
		id: "TC006",
		name: "大小写转换 - camelCase",
		description: "测试 camelCase 转换",
		files: [createFile("1", "my_file_name.txt"), createFile("2", "another-file.txt")],
		rules: [
			createRule("r1", "caseStyle", {
				mode: "camelCase",
				style: "none",
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "myFileName.txt" },
			{ fileId: "2", expectedName: "anotherFile.txt" },
		],
	},

	{
		id: "TC007",
		name: "正则表达式 - 日期格式化",
		description: "使用正则表达式格式化日期",
		files: [createFile("1", "20240318.txt"), createFile("2", "20241225.txt")],
		rules: [
			createRule("r1", "regex", {
				pattern: "(\\d{4})(\\d{2})(\\d{2})",
				replacement: "$1-$2-$3",
				flags: "g",
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "2024-03-18.txt" },
			{ fileId: "2", expectedName: "2024-12-25.txt" },
		],
	},

	{
		id: "TC008",
		name: "删除清理 - 删除数字",
		description: "测试删除数字功能",
		files: [createFile("1", "file123.txt"), createFile("2", "doc456.txt")],
		rules: [
			createRule("r1", "removeCleanup", {
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
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "file.txt" },
			{ fileId: "2", expectedName: "doc.txt" },
		],
	},

	{
		id: "TC009",
		name: "删除清理 - 删除符号",
		description: "测试删除符号功能",
		files: [createFile("1", "file@#$.txt"), createFile("2", "doc***name.txt")],
		rules: [
			createRule("r1", "removeCleanup", {
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
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "file.txt" },
			{ fileId: "2", expectedName: "docname.txt" },
		],
	},

	{
		id: "TC010",
		name: "按文件夹分组序列号",
		description: "测试 perFolder 作用域",
		files: [
			createFile("1", "file1.txt", { relativePath: "folder1/file1.txt" }),
			createFile("2", "file2.txt", { relativePath: "folder1/file2.txt" }),
			createFile("3", "file3.txt", { relativePath: "folder2/file3.txt" }),
			createFile("4", "file4.txt", { relativePath: "folder2/file4.txt" }),
		],
		rules: [
			createRule("r1", "sequence", {
				seqType: "numeric",
				start: 1,
				step: 1,
				padding: 2,
				position: "start",
				template: "{n}_",
				scope: "perFolder",
				sortBeforeNumbering: false,
				sortBy: "name",
				sortOrder: "asc",
				naturalSort: true,
				preserveOriginal: false,
				preservePattern: "(\\d+)",
				hierarchical: false,
				hierarchySeparator: ".",
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "01_file1.txt" },
			{ fileId: "2", expectedName: "02_file2.txt" },
			{ fileId: "3", expectedName: "01_file3.txt" },
			{ fileId: "4", expectedName: "02_file4.txt" },
		],
	},

	{
		id: "TC011",
		name: "按扩展名分组序列号",
		description: "测试 perExtension 作用域",
		files: [
			createFile("1", "file1.jpg"),
			createFile("2", "file2.jpg"),
			createFile("3", "file3.png"),
			createFile("4", "file4.png"),
		],
		rules: [
			createRule("r1", "sequence", {
				seqType: "numeric",
				start: 1,
				step: 1,
				padding: 2,
				position: "start",
				template: "{n}_",
				scope: "perExtension",
				sortBeforeNumbering: false,
				sortBy: "name",
				sortOrder: "asc",
				naturalSort: true,
				preserveOriginal: false,
				preservePattern: "(\\d+)",
				hierarchical: false,
				hierarchySeparator: ".",
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "01_file1.jpg" },
			{ fileId: "2", expectedName: "02_file2.jpg" },
			{ fileId: "3", expectedName: "01_file3.png" },
			{ fileId: "4", expectedName: "02_file4.png" },
		],
	},

	// ========== 复杂规则链测试 ==========
	{
		id: "TC012",
		name: "复杂规则链 - 清理+小写+序列号",
		description: "测试多规则组合: IMG_2024@#$.jpg → 001_img2024.jpg",
		files: [createFile("1", "IMG_2024@#$.jpg"), createFile("2", "IMG_2025@#$.jpg")],
		rules: [
			createRule("r1", "removeCleanup", {
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
			}),
			createRule("r2", "caseStyle", {
				mode: "lowercase",
				style: "none",
			}),
			createRule("r3", "sequence", {
				seqType: "numeric",
				start: 1,
				step: 1,
				padding: 3,
				position: "start",
				template: "{n}_",
				scope: "global",
				sortBeforeNumbering: false,
				sortBy: "name",
				sortOrder: "asc",
				naturalSort: true,
				preserveOriginal: false,
				preservePattern: "(\\d+)",
				hierarchical: false,
				hierarchySeparator: ".",
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "001_img2024.jpg" },
			{ fileId: "2", expectedName: "002_img2025.jpg" },
		],
	},

	// ========== 冲突检测测试 ==========
	{
		id: "TC013",
		name: "冲突检测 - 重复文件名",
		description: "测试冲突检测功能",
		files: [createFile("1", "file1.txt"), createFile("2", "file2.txt")],
		rules: [
			createRule("r1", "findReplace", {
				find: "file",
				replace: "doc",
				caseSensitive: false,
				matchAll: true,
				usePosition: false,
				fromEnd: false,
				positionStart: 0,
				positionCount: 1,
			}),
			createRule("r2", "findReplace", {
				find: "1",
				replace: "",
				caseSensitive: false,
				matchAll: true,
				usePosition: false,
				fromEnd: false,
				positionStart: 0,
				positionCount: 1,
			}),
			createRule("r3", "findReplace", {
				find: "2",
				replace: "",
				caseSensitive: false,
				matchAll: true,
				usePosition: false,
				fromEnd: false,
				positionStart: 0,
				positionCount: 1,
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "doc.txt", shouldConflict: true },
			{ fileId: "2", expectedName: "doc.txt", shouldConflict: true },
		],
	},

	// ========== 边界测试 ==========
	{
		id: "TC014",
		name: "边界测试 - 空文件名",
		description: "测试空文件名检测",
		files: [createFile("1", "123abc.txt")],
		rules: [
			createRule("r1", "removeCleanup", {
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
			}),
		],
		extensionScope: "name",
		expectedResults: [{ fileId: "1", expectedName: ".txt", shouldError: true }],
	},

	{
		id: "TC015",
		name: "扩展名作用域 - 只重命名扩展名",
		description: "测试 extension 作用域",
		files: [createFile("1", "file.jpg"), createFile("2", "document.png")],
		rules: [
			createRule("r1", "caseStyle", {
				mode: "uppercase",
				style: "none",
			}),
		],
		extensionScope: "extension",
		expectedResults: [
			{ fileId: "1", expectedName: "file.JPG" },
			{ fileId: "2", expectedName: "document.PNG" },
		],
	},

	{
		id: "TC016",
		name: "完整文件名作用域",
		description: "测试 full 作用域",
		files: [createFile("1", "MyFile.JPG"), createFile("2", "Document.PNG")],
		rules: [
			createRule("r1", "caseStyle", {
				mode: "lowercase",
				style: "none",
			}),
		],
		extensionScope: "full",
		expectedResults: [
			{ fileId: "1", expectedName: "myfile.jpg" },
			{ fileId: "2", expectedName: "document.png" },
		],
	},

	{
		id: "TC017",
		name: "中文文件名处理",
		description: "测试中文字符删除",
		files: [createFile("1", "file文件名.txt"), createFile("2", "Hello世界.txt")],
		rules: [
			createRule("r1", "removeCleanup", {
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
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "file.txt" },
			{ fileId: "2", expectedName: "Hello.txt" },
		],
	},

	{
		id: "TC018",
		name: "自然排序测试",
		description: "测试自然排序功能",
		files: [
			createFile("1", "file1.txt"),
			createFile("2", "file10.txt"),
			createFile("3", "file2.txt"),
			createFile("4", "file20.txt"),
		],
		rules: [
			createRule("r1", "sequence", {
				seqType: "numeric",
				start: 1,
				step: 1,
				padding: 3,
				position: "start",
				template: "{n}_",
				scope: "global",
				sortBeforeNumbering: true,
				sortBy: "name",
				sortOrder: "asc",
				naturalSort: true,
				preserveOriginal: false,
				preservePattern: "(\\d+)",
				hierarchical: false,
				hierarchySeparator: ".",
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "001_file1.txt" },
			{ fileId: "3", expectedName: "002_file2.txt" },
			{ fileId: "2", expectedName: "003_file10.txt" },
			{ fileId: "4", expectedName: "004_file20.txt" },
		],
	},

	{
		id: "TC019",
		name: "模板变量组合",
		description: "测试序列号模板中的多个变量",
		files: [
			createFile("1", "photo.jpg", {
				relativePath: "vacation/beach/photo.jpg",
			}),
		],
		rules: [
			createRule("r1", "sequence", {
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
			}),
		],
		extensionScope: "name",
		expectedResults: [{ fileId: "1", expectedName: "beach_01_photo.jpg" }],
	},

	{
		id: "TC020",
		name: "位置替换 - 从开头",
		description: "测试位置替换功能",
		files: [createFile("1", "oldfile.txt"), createFile("2", "oldname.txt")],
		rules: [
			createRule("r1", "findReplace", {
				find: "",
				replace: "NEW",
				caseSensitive: false,
				matchAll: false,
				usePosition: true,
				fromEnd: false,
				positionStart: 0,
				positionCount: 3,
			}),
		],
		extensionScope: "name",
		expectedResults: [
			{ fileId: "1", expectedName: "NEWfile.txt" },
			{ fileId: "2", expectedName: "NEWname.txt" },
		],
	},
];
