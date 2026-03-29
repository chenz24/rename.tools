/**
 * 自动化测试运行器
 * 批量验证所有测试用例
 */

import { computePreview } from "@/lib/rename/rules";
import type { FileEntry, RenameRule, ExtensionScope } from "@/lib/rename/types";

interface TestCase {
	id: string;
	name: string;
	description: string;
	files: FileEntry[];
	rules: RenameRule[];
	extensionScope: ExtensionScope;
	expectedResults: {
		fileId: string;
		expectedName: string;
		shouldConflict?: boolean;
		shouldError?: boolean;
	}[];
}

interface TestResult {
	testId: string;
	testName: string;
	passed: boolean;
	errors: string[];
	duration: number;
}

class TestRunner {
	private testCases: TestCase[] = [];
	private results: TestResult[] = [];

	addTestCase(testCase: TestCase) {
		this.testCases.push(testCase);
	}

	runAll(): TestResult[] {
		console.log(`\n🚀 开始运行 ${this.testCases.length} 个测试用例...\n`);

		for (const testCase of this.testCases) {
			const result = this.runTestCase(testCase);
			this.results.push(result);
		}

		this.printSummary();
		return this.results;
	}

	private runTestCase(testCase: TestCase): TestResult {
		const startTime = Date.now();
		const errors: string[] = [];

		try {
			const results = computePreview(
				testCase.files,
				testCase.rules,
				testCase.extensionScope,
			);

			// 验证每个预期结果
			for (const expected of testCase.expectedResults) {
				const actual = results.find((r) => r.fileId === expected.fileId);

				if (!actual) {
					errors.push(`文件 ${expected.fileId} 未找到结果`);
					continue;
				}

				if (actual.newName !== expected.expectedName) {
					errors.push(
						`文件 ${expected.fileId}: 期望 "${expected.expectedName}", 实际 "${actual.newName}"`,
					);
				}

				if (expected.shouldConflict && !actual.conflict) {
					errors.push(`文件 ${expected.fileId}: 期望产生冲突,但未检测到`);
				}

				if (expected.shouldError && !actual.error) {
					errors.push(`文件 ${expected.fileId}: 期望产生错误,但未检测到`);
				}
			}
		} catch (error) {
			errors.push(`执行异常: ${error}`);
		}

		const duration = Date.now() - startTime;
		const passed = errors.length === 0;

		const icon = passed ? "✅" : "❌";
		const status = passed ? "通过" : "失败";
		console.log(`${icon} [${testCase.id}] ${testCase.name} - ${status} (${duration}ms)`);

		if (!passed) {
			for (const error of errors) {
				console.log(`   ⚠️  ${error}`);
			}
		}

		return {
			testId: testCase.id,
			testName: testCase.name,
			passed,
			errors,
			duration,
		};
	}

	private printSummary() {
		const total = this.results.length;
		const passed = this.results.filter((r) => r.passed).length;
		const failed = total - passed;
		const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

		console.log("\n" + "=".repeat(60));
		console.log("📊 测试总结");
		console.log("=".repeat(60));
		console.log(`总计: ${total} 个测试`);
		console.log(`✅ 通过: ${passed} 个`);
		console.log(`❌ 失败: ${failed} 个`);
		console.log(`⏱️  总耗时: ${totalDuration}ms`);
		console.log(`📈 通过率: ${((passed / total) * 100).toFixed(2)}%`);
		console.log("=".repeat(60) + "\n");
	}

	exportResults(format: "json" | "markdown" = "json"): string {
		if (format === "json") {
			return JSON.stringify(this.results, null, 2);
		}

		// Markdown 格式
		let md = "# 自动化测试报告\n\n";
		md += `- 测试时间: ${new Date().toLocaleString("zh-CN")}\n`;
		md += `- 总计: ${this.results.length} 个测试\n`;
		md += `- 通过: ${this.results.filter((r) => r.passed).length} 个\n`;
		md += `- 失败: ${this.results.filter((r) => !r.passed).length} 个\n\n`;

		md += "## 测试详情\n\n";
		md += "| 测试ID | 测试名称 | 状态 | 耗时 |\n";
		md += "|--------|----------|------|------|\n";

		for (const result of this.results) {
			const status = result.passed ? "✅ 通过" : "❌ 失败";
			md += `| ${result.testId} | ${result.testName} | ${status} | ${result.duration}ms |\n`;
		}

		const failedTests = this.results.filter((r) => !r.passed);
		if (failedTests.length > 0) {
			md += "\n## 失败详情\n\n";
			for (const test of failedTests) {
				md += `### ${test.testId} - ${test.testName}\n\n`;
				for (const error of test.errors) {
					md += `- ${error}\n`;
				}
				md += "\n";
			}
		}

		return md;
	}
}

// 辅助函数: 创建测试文件
function createFile(
	id: string,
	name: string,
	options: Partial<FileEntry> = {},
): FileEntry {
	const lastDot = name.lastIndexOf(".");
	const baseName = lastDot > 0 ? name.slice(0, lastDot) : name;
	const extension = lastDot > 0 ? name.slice(lastDot) : "";

	return {
		id,
		name,
		baseName,
		extension,
		selected: true,
		...options,
	};
}

// 辅助函数: 创建规则
function createRule(
	id: string,
	type: RenameRule["ruleConfig"]["type"],
	config: any,
): RenameRule {
	return {
		id,
		enabled: true,
		ruleConfig: {
			type,
			config,
		},
	};
}

// 导出测试运行器和辅助函数
export { TestRunner, createFile, createRule };
export type { TestCase, TestResult };
