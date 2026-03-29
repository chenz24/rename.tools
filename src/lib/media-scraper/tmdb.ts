import type { TMDbSearchResult, TMDbSeasonDetail } from "./types";

const TMDB_API_BASE = "https://api.themoviedb.org/3";

function headers(apiKey: string): HeadersInit {
	return {
		Authorization: `Bearer ${apiKey}`,
		"Content-Type": "application/json",
	};
}

/**
 * Search for TV shows on TMDb.
 */
export async function searchTv(
	query: string,
	apiKey: string,
	language = "en-US",
): Promise<TMDbSearchResult[]> {
	const url = `${TMDB_API_BASE}/search/tv?query=${encodeURIComponent(query)}&language=${language}&page=1`;
	const res = await fetch(url, { headers: headers(apiKey) });
	if (!res.ok) throw new Error(`TMDb search failed: ${res.status}`);
	const data = await res.json();
	return (data.results || []).map((r: TMDbSearchResult) => ({ ...r, media_type: "tv" as const }));
}

/**
 * Search for movies on TMDb.
 */
export async function searchMovie(
	query: string,
	apiKey: string,
	year?: number,
	language = "en-US",
): Promise<TMDbSearchResult[]> {
	let url = `${TMDB_API_BASE}/search/movie?query=${encodeURIComponent(query)}&language=${language}&page=1`;
	if (year) url += `&year=${year}`;
	const res = await fetch(url, { headers: headers(apiKey) });
	if (!res.ok) throw new Error(`TMDb search failed: ${res.status}`);
	const data = await res.json();
	return (data.results || []).map((r: TMDbSearchResult) => ({
		...r,
		media_type: "movie" as const,
	}));
}

/**
 * Get season detail (episode list) from TMDb.
 */
export async function getSeasonDetail(
	tvId: number,
	seasonNumber: number,
	apiKey: string,
	language = "en-US",
): Promise<TMDbSeasonDetail> {
	const url = `${TMDB_API_BASE}/tv/${tvId}/season/${seasonNumber}?language=${language}`;
	const res = await fetch(url, { headers: headers(apiKey) });
	if (!res.ok) throw new Error(`TMDb season detail failed: ${res.status}`);
	return res.json();
}

export type ApiKeyValidationResult = {
	valid: boolean;
	error?: "invalid" | "network" | "timeout" | "unknown";
};

/**
 * Validate a TMDb API key by calling the /authentication endpoint.
 * Returns detailed error information for better UX.
 */
export async function validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		const url = `${TMDB_API_BASE}/authentication`;
		const res = await fetch(url, {
			headers: headers(apiKey),
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (res.ok) {
			return { valid: true };
		}
		if (res.status === 401) {
			return { valid: false, error: "invalid" };
		}
		return { valid: false, error: "unknown" };
	} catch (err: unknown) {
		if (err instanceof Error && err.name === "AbortError") {
			return { valid: false, error: "timeout" };
		}
		return { valid: false, error: "network" };
	}
}
