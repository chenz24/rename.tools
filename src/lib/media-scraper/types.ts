// ── Filename Parser Types ──

export interface ParsedFilename {
	/** Cleaned show/movie title */
	cleanTitle: string;
	/** Season number (undefined for movies) */
	season?: number;
	/** Episode number (undefined for movies) */
	episode?: number;
	/** Year extracted from filename */
	year?: number;
	/** Whether this looks like a movie (no season/episode info) */
	isMovie: boolean;
	/** Video quality (720p, 1080p, etc.) */
	quality?: string;
	/** Source type (WEBRip, BluRay, etc.) */
	source?: string;
}

// ── TMDb API Types ──

export interface TMDbSearchResult {
	id: number;
	name?: string;
	title?: string;
	original_name?: string;
	original_title?: string;
	first_air_date?: string;
	release_date?: string;
	overview?: string;
	poster_path?: string;
	media_type?: "tv" | "movie";
	popularity?: number;
}

export interface TMDbEpisode {
	episode_number: number;
	name: string;
	overview?: string;
	air_date?: string;
	runtime?: number;
	still_path?: string;
}

export interface TMDbSeasonDetail {
	season_number: number;
	episodes: TMDbEpisode[];
}

// ── Scraper Result Types ──

export type MatchConfidence = "high" | "medium" | "low" | "none";

export interface ScrapedMediaInfo {
	tmdbId: number;
	title: string;
	season?: number;
	episode?: number;
	episodeTitle?: string;
	year?: number;
	posterPath?: string;
}

export interface FileMatchResult {
	fileId: string;
	fileName: string;
	parsed: ParsedFilename;
	match: ScrapedMediaInfo | null;
	confidence: MatchConfidence;
	alternatives: TMDbSearchResult[];
	selected: boolean;
	/** Formatted new name (without extension) */
	newName?: string;
}

export interface ParsedGroup {
	id: string;
	title: string;
	season?: number;
	fileIds: string[];
	tmdbResults: TMDbSearchResult[];
	selectedTmdbId?: number;
}

// ── Naming Template Types ──

export interface NamingTemplate {
	id: string;
	label: string;
	template: string;
	example: string;
}

export const DEFAULT_NAMING_TEMPLATES: NamingTemplate[] = [
	{
		id: "standard",
		label: "{show} - S{season}E{episode} - {episodeTitle}",
		template: "{show} - S{season}E{episode} - {episodeTitle}",
		example: "Breaking Bad - S01E01 - Pilot",
	},
	{
		id: "dotted",
		label: "{show}.S{season}E{episode}.{episodeTitle}",
		template: "{show}.S{season}E{episode}.{episodeTitle}",
		example: "Breaking.Bad.S01E01.Pilot",
	},
	{
		id: "simple",
		label: "{show} S{season}E{episode}",
		template: "{show} S{season}E{episode}",
		example: "Breaking Bad S01E01",
	},
	{
		id: "plex",
		label: "{show} - s{season}e{episode} - {episodeTitle}",
		template: "{show} - s{season}e{episode} - {episodeTitle}",
		example: "Breaking Bad - s01e01 - Pilot",
	},
];

export type ScraperState = "idle" | "parsing" | "searching" | "matched" | "applying" | "error";
