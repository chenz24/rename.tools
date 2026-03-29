import type { ParsedFilename } from "./types";

// Common noise words to strip from filenames
const QUALITY_PATTERNS = /\b(2160p|1080p|1080i|720p|480p|4k|uhd|hd|sd)\b/gi;
const SOURCE_PATTERNS =
	/\b(webrip|web-dl|webdl|web\.dl|bluray|blu-ray|bdrip|brrip|dvdrip|hdtv|pdtv|dsr|hdrip|remux|proper|repack)\b/gi;
const CODEC_PATTERNS =
	/\b(x264|x265|h\.?264|h\.?265|hevc|avc|xvid|divx|aac|ac3|dts|flac|atmos|truehd)\b/gi;
const RELEASE_GROUP = /[-[]([\w]+)$/i;
const EXTRA_NOISE =
	/\b(10bit|8bit|hdr|hdr10|dv|dolby\.?vision|multi|dual|complete|season|series|extended|unrated|directors\.?cut|remastered)\b/gi;

// Season/Episode extraction patterns (ordered by specificity)
const SE_PATTERNS: Array<{ regex: RegExp; seasonIdx: number; episodeIdx: number }> = [
	// S01E01, S1E1, s01e01, S01.E01
	{ regex: /[Ss](\d{1,2})\.?[Ee](\d{1,3})/, seasonIdx: 1, episodeIdx: 2 },
	// 1x01, 01x01
	{ regex: /(\d{1,2})[xX](\d{2,3})/, seasonIdx: 1, episodeIdx: 2 },
	// Season 1 Episode 1
	{
		regex: /[Ss]eason\s*(\d{1,2})\s*[Ee]pisode\s*(\d{1,3})/,
		seasonIdx: 1,
		episodeIdx: 2,
	},
	// E01 (no season, default to 1)
	{ regex: /[Ee](\d{2,3})(?!\d)/, seasonIdx: -1, episodeIdx: 1 },
	// [01] or [E01]
	{ regex: /\[E?(\d{2,3})\]/, seasonIdx: -1, episodeIdx: 1 },
];

// Year pattern (4-digit year in range 1900-2099)
const YEAR_PATTERN = /(?:^|[.\s_([-])(\d{4})(?=[.\s_)\]-]|$)/;

function extractYear(text: string): number | undefined {
	const match = text.match(YEAR_PATTERN);
	if (match) {
		const year = Number.parseInt(match[1], 10);
		if (year >= 1900 && year <= 2099) {
			return year;
		}
	}
	return undefined;
}

function extractQuality(text: string): string | undefined {
	const match = text.match(QUALITY_PATTERNS);
	return match ? match[0].toLowerCase() : undefined;
}

function extractSource(text: string): string | undefined {
	const match = text.match(SOURCE_PATTERNS);
	return match ? match[0].toLowerCase() : undefined;
}

function cleanTitle(raw: string): string {
	let title = raw;

	// Remove everything after and including the season/episode pattern
	for (const { regex } of SE_PATTERNS) {
		const match = title.match(regex);
		if (match?.index !== undefined) {
			title = title.slice(0, match.index);
			break;
		}
	}

	// If no S/E found, remove after year
	if (title === raw) {
		const yearMatch = title.match(YEAR_PATTERN);
		if (yearMatch?.index !== undefined) {
			// Keep the year boundary but cut after it
			const cutPoint = yearMatch.index;
			if (cutPoint > 2) {
				title = title.slice(0, cutPoint);
			}
		}
	}

	// Remove quality, source, codec, noise
	title = title
		.replace(QUALITY_PATTERNS, " ")
		.replace(SOURCE_PATTERNS, " ")
		.replace(CODEC_PATTERNS, " ")
		.replace(EXTRA_NOISE, " ")
		.replace(RELEASE_GROUP, "");

	// Replace separators with spaces
	title = title.replace(/[._]/g, " ").replace(/-/g, " ").replace(/\s+/g, " ").trim();

	return title;
}

/**
 * Parse a media filename to extract show title, season, episode, year, etc.
 */
export function parseFilename(filename: string): ParsedFilename {
	// Remove extension
	const lastDot = filename.lastIndexOf(".");
	const nameWithoutExt = lastDot > 0 ? filename.slice(0, lastDot) : filename;

	const quality = extractQuality(nameWithoutExt);
	const source = extractSource(nameWithoutExt);
	const year = extractYear(nameWithoutExt);

	// Try to extract season/episode
	let season: number | undefined;
	let episode: number | undefined;

	for (const { regex, seasonIdx, episodeIdx } of SE_PATTERNS) {
		const match = nameWithoutExt.match(regex);
		if (match) {
			season = seasonIdx >= 0 ? Number.parseInt(match[seasonIdx], 10) : 1;
			episode = Number.parseInt(match[episodeIdx], 10);
			break;
		}
	}

	const isMovie = season === undefined && episode === undefined;
	const title = cleanTitle(nameWithoutExt);

	return {
		cleanTitle: title,
		season,
		episode,
		year,
		isMovie,
		quality,
		source,
	};
}

/**
 * Check if a filename looks like it contains TV show episode info.
 */
export function hasTvShowPattern(filename: string): boolean {
	return SE_PATTERNS.some(({ regex }) => regex.test(filename));
}

/**
 * Group files by their parsed show title (normalized lowercase).
 * Returns a Map of normalized title → file IDs.
 */
export function groupByShow(
	files: Array<{ id: string; name: string }>,
): Map<string, { title: string; season?: number; fileIds: string[] }> {
	const groups = new Map<string, { title: string; season?: number; fileIds: string[] }>();

	for (const file of files) {
		const parsed = parseFilename(file.name);
		if (parsed.isMovie) continue;

		const key = parsed.cleanTitle.toLowerCase().trim();
		if (!key) continue;

		if (!groups.has(key)) {
			groups.set(key, {
				title: parsed.cleanTitle,
				season: parsed.season,
				fileIds: [],
			});
		}
		groups.get(key)!.fileIds.push(file.id);
	}

	return groups;
}
