import type { FileEntry } from "@/lib/rename/types";
import { parseFilename } from "./parser";
import { getSeasonDetail, searchTv } from "./tmdb";
import type {
	FileMatchResult,
	MatchConfidence,
	ParsedGroup,
	ScrapedMediaInfo,
	TMDbEpisode,
	TMDbSearchResult,
	TMDbSeasonDetail,
} from "./types";

const VIDEO_EXTS = new Set([
	".mp4",
	".mov",
	".avi",
	".mkv",
	".wmv",
	".flv",
	".webm",
	".m4v",
	".ts",
]);

/**
 * Group selected video files by their parsed show title AND season.
 * This ensures files from different seasons are in separate groups.
 */
export function buildParsedGroups(files: FileEntry[]): ParsedGroup[] {
	const videoFiles = files.filter((f) => VIDEO_EXTS.has(f.extension.toLowerCase()));

	const groupMap = new Map<string, ParsedGroup>();

	for (const file of videoFiles) {
		const parsed = parseFilename(file.name);
		if (parsed.isMovie) continue;

		const titleKey = parsed.cleanTitle.toLowerCase().trim();
		if (!titleKey) continue;

		// Group by title + season to handle multi-season files correctly
		const key = `${titleKey}::s${parsed.season ?? 0}`;

		if (!groupMap.has(key)) {
			groupMap.set(key, {
				id: key,
				title: parsed.cleanTitle,
				season: parsed.season,
				fileIds: [],
				tmdbResults: [],
			});
		}
		groupMap.get(key)!.fileIds.push(file.id);
	}

	return Array.from(groupMap.values());
}

/**
 * Search TMDb for each parsed group, populating tmdbResults.
 */
export async function searchGroups(
	groups: ParsedGroup[],
	apiKey: string,
	language = "en-US",
): Promise<ParsedGroup[]> {
	const searched = new Map<string, TMDbSearchResult[]>();

	const updated: ParsedGroup[] = [];
	for (const group of groups) {
		const key = group.title.toLowerCase();
		if (!searched.has(key)) {
			try {
				const results = await searchTv(group.title, apiKey, language);
				searched.set(key, results.slice(0, 5));
			} catch {
				searched.set(key, []);
			}
		}
		updated.push({
			...group,
			tmdbResults: searched.get(key) || [],
			selectedTmdbId: searched.get(key)?.[0]?.id,
		});
	}

	return updated;
}

/**
 * Normalize a string for comparison: lowercase, remove punctuation, collapse spaces.
 */
function normalize(s: string): string {
	return s
		.toLowerCase()
		.replace(/[^\w\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/**
 * Compute similarity score (0–1) between two strings using word-based Jaccard similarity.
 */
function similarity(a: string, b: string): number {
	const na = normalize(a);
	const nb = normalize(b);
	if (na === nb) return 1;

	const wordsA = new Set(na.split(" ").filter(Boolean));
	const wordsB = new Set(nb.split(" ").filter(Boolean));

	if (wordsA.size === 0 || wordsB.size === 0) return 0;

	let intersection = 0;
	for (const w of wordsA) {
		if (wordsB.has(w)) intersection++;
	}

	const union = wordsA.size + wordsB.size - intersection;
	return union > 0 ? intersection / union : 0;
}

function computeConfidence(
	parsedTitle: string,
	tmdbResult: TMDbSearchResult | undefined,
	episode: TMDbEpisode | undefined,
): MatchConfidence {
	if (!tmdbResult) return "none";

	const tmdbName = (tmdbResult.name || tmdbResult.title || "").toLowerCase();
	const sim = similarity(parsedTitle.toLowerCase(), tmdbName);

	if (episode && sim > 0.5) return "high";
	if (episode && sim > 0.3) return "medium";
	if (!episode && sim > 0.5) return "medium";
	return "low";
}

/**
 * Build match results for all files in groups by fetching episode details.
 * Fetches season details per file's parsed season to handle multi-season correctly.
 */
export async function matchFiles(
	files: FileEntry[],
	groups: ParsedGroup[],
	apiKey: string,
	language = "en-US",
): Promise<FileMatchResult[]> {
	const fileMap = new Map(files.map((f) => [f.id, f]));
	const results: FileMatchResult[] = [];

	// Cache season details: tmdbId-season → TMDbSeasonDetail
	const seasonCache = new Map<string, TMDbSeasonDetail | null>();

	// Helper to get season detail with caching
	const getSeasonCached = async (
		tmdbId: number,
		season: number,
	): Promise<TMDbSeasonDetail | null> => {
		const cacheKey = `${tmdbId}-${season}`;
		if (seasonCache.has(cacheKey)) {
			return seasonCache.get(cacheKey) || null;
		}
		try {
			const detail = await getSeasonDetail(tmdbId, season, apiKey, language);
			seasonCache.set(cacheKey, detail);
			return detail;
		} catch {
			seasonCache.set(cacheKey, null);
			return null;
		}
	};

	for (const group of groups) {
		const tmdbResult = group.tmdbResults.find((r) => r.id === group.selectedTmdbId);

		for (const fileId of group.fileIds) {
			const file = fileMap.get(fileId);
			if (!file) continue;

			const parsed = parseFilename(file.name);

			// Fetch season detail based on each file's parsed season
			let episode: TMDbEpisode | undefined;
			if (tmdbResult && parsed.season != null) {
				const seasonDetail = await getSeasonCached(tmdbResult.id, parsed.season);
				episode = seasonDetail?.episodes.find((e) => e.episode_number === parsed.episode);
			}

			const confidence = computeConfidence(parsed.cleanTitle, tmdbResult, episode);
			const showTitle = tmdbResult?.name || tmdbResult?.title || parsed.cleanTitle;
			const year = tmdbResult?.first_air_date
				? Number.parseInt(tmdbResult.first_air_date.slice(0, 4), 10)
				: parsed.year;

			const match: ScrapedMediaInfo | null = tmdbResult
				? {
						tmdbId: tmdbResult.id,
						title: showTitle,
						season: parsed.season,
						episode: parsed.episode,
						episodeTitle: episode?.name,
						year: year || undefined,
						posterPath: tmdbResult.poster_path || undefined,
					}
				: null;

			results.push({
				fileId,
				fileName: file.name,
				parsed,
				match,
				confidence,
				alternatives: group.tmdbResults,
				selected: confidence === "high" || confidence === "medium",
			});
		}
	}

	return results;
}

/**
 * Format a scraped media info into a new filename using a template.
 */
export function formatScrapedName(info: ScrapedMediaInfo, template: string): string {
	const pad2 = (n?: number) => (n != null ? String(n).padStart(2, "0") : "");

	return template
		.replace(/\{show\}/g, info.title)
		.replace(/\{season\}/g, pad2(info.season))
		.replace(/\{episode\}/g, pad2(info.episode))
		.replace(/\{episodeTitle\}/g, info.episodeTitle || "")
		.replace(/\{year\}/g, info.year ? String(info.year) : "")
		.replace(/\s{2,}/g, " ")
		.replace(/\s*-\s*$/g, "")
		.trim();
}
