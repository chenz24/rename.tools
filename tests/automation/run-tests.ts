#!/usr/bin/env tsx
/**
 * 自动化测试执行脚本
 * 运行方式: pnpm test:auto
 */

import { TestRunner } from "./test-runner";
import { testCases } from "./test-cases-data";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {
	console.log("╔═══════════════════════════════════════════════════════════╗");
	console.log("║         Rename.tools 自动化测试套件                      ║");
	console.log("╚═══════════════════════════════════════════════════════════╝");

	const runner = new TestRunner();

	// 添加所有测试用例
	for (const testCase of testCases) {
		runner.addTestCase(testCase);
	}

	// 运行所有测试
	const results = runner.runAll();

	// 导出测试报告
	const reportDir = path.join(process.cwd(), "test-reports");
	if (!fs.existsSync(reportDir)) {
		fs.mkdirSync(reportDir, { recursive: true });
	}

	// JSON 报告
	const jsonReport = runner.exportResults("json");
	const jsonPath = path.join(reportDir, `test-report-${Date.now()}.json`);
	fs.writeFileSync(jsonPath, jsonReport);
	console.log(`📄 JSON 报告已保存: ${jsonPath}`);

	// Markdown 报告
	const mdReport = runner.exportResults("markdown");
	const mdPath = path.join(reportDir, `test-report-${Date.now()}.md`);
	fs.writeFileSync(mdPath, mdReport);
	console.log(`📄 Markdown 报告已保存: ${mdPath}`);

	// 退出码
	const hasFailures = results.some((r) => !r.passed);
	process.exit(hasFailures ? 1 : 0);
}

main().catch((error) => {
	console.error("❌ 测试执行失败:", error);
	process.exit(1);
});
