import { createHash } from "node:crypto";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const sourceDirectory = new URL("../public/guides/screenshots/", import.meta.url);
const output = new URL("optimized/", sourceDirectory);
const manifestPath = new URL("../src/components/guides/guide-screenshots.json", import.meta.url);
const manifest = {};
const generated = new Set();
await mkdir(output, { recursive: true });

for (const sourceName of (await readdir(sourceDirectory)).sort()) {
	if (!/^(basics|samples|photos|regex|sequence|media)-(en|zh)\.png$/.test(sourceName)) continue;
	const image = sharp(fileURLToPath(new URL(sourceName, sourceDirectory)));
	const metadata = await image.metadata();
	const variants = [];
	for (const width of [384, 768, 1280]) {
		const { data, info } = await image
			.clone()
			.resize({ width, withoutEnlargement: true })
			.webp({ quality: 85, effort: 6 })
			.toBuffer({ resolveWithObject: true });
		const hash = createHash("sha256").update(data).digest("hex").slice(0, 12);
		const filename = `${sourceName.slice(0, -4)}-${info.width}-${hash}.webp`;
		await writeFile(new URL(filename, output), data);
		generated.add(filename);
		variants.push({ src: `/guides/screenshots/optimized/${filename}`, width: info.width });
		console.log(`${filename}: ${data.length} bytes`);
	}
	manifest[`/guides/screenshots/${sourceName}`] = {
		width: metadata.width,
		height: metadata.height,
		variants,
	};
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, "\t")}\n`);
// Delete only this generator's stale variants, after the new manifest is complete.
for (const filename of await readdir(output)) {
	if (/^(basics|samples|photos|regex|sequence|media)-(en|zh)-\d+-[a-f0-9]{12}\.webp$/.test(filename) && !generated.has(filename)) {
		await unlink(new URL(filename, output));
	}
}
