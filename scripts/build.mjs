import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

// OpenNext invokes this same build script. One ID is shared by Next and the SW;
// a new build changes the worker bytes even when its caching policy is unchanged.
const release = process.env.NEXT_DEPLOYMENT_ID || randomUUID();
if (!/^[a-zA-Z0-9_-]+$/.test(release)) throw new Error("Invalid NEXT_DEPLOYMENT_ID");
const template = readFileSync(new URL("./service-worker.js", import.meta.url), "utf8");
const nextCli = createRequire(import.meta.url).resolve("next/dist/bin/next");
const result = spawnSync(process.execPath, [nextCli, "build", "--webpack"], {
	stdio: "inherit",
	env: { ...process.env, NEXT_DEPLOYMENT_ID: release },
});
if (result.error) throw result.error;
// Failed builds must leave the worker paired with the last successful build.
// OpenNext copies public assets after this command completes.
if (result.status === 0) {
	writeFileSync(new URL("../public/sw.js", import.meta.url), template.replaceAll("__RENAME_RELEASE__", release));
}
process.exit(result.status ?? 1);
