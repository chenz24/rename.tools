import { createHash } from "node:crypto";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const output = new URL("../public/screenshots/optimized/", import.meta.url);
const manifestPath = new URL("../src/components/home/product-screenshots.json", import.meta.url);
const widths = [384, 640, 960, 1440, 1920];
const manifest = {};
const generated = new Set();
await mkdir(output, { recursive: true });

for (const theme of ["light", "dark"]) {
	const source = new URL(
		`../public/screenshots/product_screenshot${theme === "dark" ? "_dark" : ""}.png`,
		import.meta.url,
	);
	const image = sharp(fileURLToPath(source));
	const metadata = await image.metadata();
	const variants = [];
	for (const width of widths) {
		const { data, info } = await image
			.clone()
			.resize({ width, withoutEnlargement: true })
			.webp({ quality: 85, effort: 6 })
			.toBuffer({ resolveWithObject: true });
		const hash = createHash("sha256").update(data).digest("hex").slice(0, 12);
		const filename = `product-${theme}-${info.width}-${hash}.webp`;
		await writeFile(new URL(filename, output), data);
		generated.add(filename);
		variants.push({ src: `/screenshots/optimized/${filename}`, width: info.width });
		console.log(`${filename}: ${data.length} bytes`);
	}
	manifest[theme] = { width: metadata.width, height: metadata.height, variants };
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, "\t")}\n`);
// Only remove old files owned by this generator, after the new manifest exists.
for (const filename of await readdir(output)) {
	if (/^product-(light|dark)-\d+-[a-f0-9]{12}\.webp$/.test(filename) && !generated.has(filename)) {
		await unlink(new URL(filename, output));
	}
}
