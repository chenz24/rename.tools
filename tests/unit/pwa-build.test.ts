import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const fixtures: string[] = [];
afterEach(() => { for (const root of fixtures.splice(0)) rmSync(root, { recursive: true, force: true }); });
function fixture() {
	const root = mkdtempSync(join(tmpdir(), "rename-pwa-build-"));
	fixtures.push(root);
	mkdirSync(join(root, "scripts"));
	mkdirSync(join(root, "public"));
	mkdirSync(join(root, "node_modules/next/dist/bin"), { recursive: true });
	writeFileSync(join(root, "scripts/build.mjs"), readFileSync("scripts/build.mjs"));
	writeFileSync(join(root, "scripts/service-worker.js"), "const release = '__RENAME_RELEASE__';");
	writeFileSync(join(root, "public/sw.js"), "previous working worker");
	// Exercise the actual wrapper with a tiny Next executable, including subprocess
	// failure and env propagation; no production build/network is needed per test.
	writeFileSync(join(root, "node_modules/next/dist/bin/next.js"), `
const fs = require('node:fs');
fs.writeFileSync('build-observation.json', JSON.stringify({release: process.env.NEXT_DEPLOYMENT_ID, worker: fs.readFileSync('public/sw.js', 'utf8'), args: process.argv.slice(2)}));
process.exit(Number(process.env.QA_BUILD_STATUS || 0));
`);
	const run = (status = 0, release = "release-test") => spawnSync(process.execPath, ["scripts/build.mjs"], {
		cwd: root,
		env: { ...process.env, QA_BUILD_STATUS: String(status), NEXT_DEPLOYMENT_ID: release },
		encoding: "utf8",
	});
	return { root, run, worker: () => readFileSync(join(root, "public/sw.js"), "utf8") };
}

describe("PWA production build wrapper", () => {
	it("does not publish a worker for a failed build", () => {
		const s = fixture();
		expect(s.run(2).status).toBe(2);
		expect(s.worker()).toBe("previous working worker");
	});
	it("publishes only after success and shares the release with Next", () => {
		const s = fixture();
		const result = s.run();
		expect(result.stderr).toBe("");
		expect(result.status).toBe(0);
		expect(JSON.parse(readFileSync(join(s.root, "build-observation.json"), "utf8"))).toEqual({ release: "release-test", worker: "previous working worker", args: ["build", "--webpack"] });
		expect(s.worker()).toBe("const release = 'release-test';");
	});
	it("generates a fresh identity for every build without a CI override", () => {
		const s = fixture();
		expect(s.run(0, "").status).toBe(0);
		const first = s.worker();
		expect(s.run(0, "").status).toBe(0);
		expect(s.worker()).not.toBe(first);
	});
});
