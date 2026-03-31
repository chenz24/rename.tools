import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Rename.Tools - Batch File Renaming Tool",
		short_name: "Rename.Tools",
		description:
			"Free browser-based batch file renaming tool with regex, sequences, and rule chains. 100% local processing.",
		start_url: "/",
		display: "standalone",
		orientation: "any",
		background_color: "#ffffff",
		theme_color: "#667eea",
		categories: ["utilities", "productivity"],
		icons: [
			{
				src: "/icon-192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
			},
			{
				src: "/logo.svg",
				sizes: "any",
				type: "image/svg+xml",
				purpose: "maskable",
			},
		],
		screenshots: [
			{
				src: "/screenshots/product_screenshot.png",
				sizes: "3348x1844",
				type: "image/png",
				form_factor: "wide",
				label: "Rename.Tools - Batch File Renaming",
			},
			{
				src: "/screenshots/product_screenshot_dark.png",
				sizes: "3354x1852",
				type: "image/png",
				form_factor: "wide",
				label: "Rename.Tools - Dark Mode",
			},
		],
	};
}
