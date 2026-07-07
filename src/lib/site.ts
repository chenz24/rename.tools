export const SITE_URL = normalizeSiteUrl(
	process.env.NEXT_PUBLIC_BASE_URL ?? "https://rename.tools",
);

function normalizeSiteUrl(url: string): string {
	return url.replace(/\/+$/, "");
}
