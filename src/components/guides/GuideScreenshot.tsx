import screenshots from "./guide-screenshots.json";

type Screenshot = {
	width: number;
	height: number;
	variants: { src: string; width: number }[];
};

/** Serve prebuilt variants without requiring Cloudflare's image transformation binding. */
export function GuideScreenshot({
	src,
	alt,
	sizes,
	className,
}: {
	src: string;
	alt: string;
	sizes: string;
	className?: string;
}) {
	const screenshot = (screenshots as Record<string, Screenshot>)[src];
	if (!screenshot)
		throw new Error(`Missing guide screenshot: ${src}. Run pnpm generate:screenshots.`);
	return (
		// biome-ignore lint/performance/noImgElement: Responsive WebP variants are generated before deployment.
		<img
			src={screenshot.variants[1].src}
			srcSet={screenshot.variants.map(({ src, width }) => `${src} ${width}w`).join(", ")}
			sizes={sizes}
			width={screenshot.width}
			height={screenshot.height}
			alt={alt}
			loading="lazy"
			decoding="async"
			className={className}
		/>
	);
}
