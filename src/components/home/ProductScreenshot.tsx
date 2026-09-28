import screenshots from "./product-screenshots.json";

/** Prebuilt variants work on Cloudflare without an image transformation binding. */
export function ProductScreenshot({
	theme,
	className,
}: {
	theme: "light" | "dark";
	className: string;
}) {
	const screenshot = screenshots[theme];
	return (
		// biome-ignore lint/performance/noImgElement: Prebuilt responsive WebP files bypass unavailable runtime image optimization.
		<img
			src={screenshot.variants[2].src}
			srcSet={screenshot.variants.map(({ src, width }) => `${src} ${width}w`).join(", ")}
			sizes="(max-width: 639px) calc(100vw - 44px), (max-width: 1023px) calc(100vw - 64px), 960px"
			width={screenshot.width}
			height={screenshot.height}
			alt="Rename.Tools Rule Chain Interface"
			loading="lazy"
			decoding="async"
			className={className}
		/>
	);
}
