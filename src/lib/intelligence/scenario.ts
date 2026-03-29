import type { FileMetadata, ImageMetadata, MediaMetadata } from "@/lib/file-metadata/types";
import type { RuleConfig } from "@/lib/rename/types";

export type RenameScenario =
	| "photo_collection"
	| "music_library"
	| "video_series"
	| "document_archive"
	| "mixed_files";

export interface ScenarioSuggestion {
	id: string;
	scenario: RenameScenario;
	confidence: number;
	suggestedRules: RuleConfig[];
	hasMetadata: boolean;
}

interface FileInfo {
	name: string;
	extension: string;
	metadata?: FileMetadata | null;
}

const IMAGE_EXTS = new Set([
	".jpg",
	".jpeg",
	".png",
	".gif",
	".bmp",
	".webp",
	".heic",
	".heif",
	".tiff",
	".tif",
	".avif",
	".svg",
]);

const AUDIO_EXTS = new Set([
	".mp3",
	".flac",
	".wav",
	".aac",
	".ogg",
	".wma",
	".m4a",
	".opus",
	".aiff",
]);

const VIDEO_EXTS = new Set([".mp4", ".mov", ".avi", ".mkv", ".wmv", ".flv", ".webm", ".m4v"]);

const DOC_EXTS = new Set([
	".pdf",
	".doc",
	".docx",
	".xls",
	".xlsx",
	".ppt",
	".pptx",
	".txt",
	".rtf",
	".odt",
]);

function getTypeRatio(files: FileInfo[], extSet: Set<string>): number {
	if (files.length === 0) return 0;
	const count = files.filter((f) => extSet.has(f.extension.toLowerCase())).length;
	return count / files.length;
}

function hasExifData(files: FileInfo[]): boolean {
	return files.some(
		(f) => f.metadata?.kind === "image" && (f.metadata as ImageMetadata).dateTime != null,
	);
}

function hasMediaTags(files: FileInfo[]): boolean {
	return files.some(
		(f) =>
			f.metadata?.kind === "media" &&
			((f.metadata as MediaMetadata).artist != null || (f.metadata as MediaMetadata).title != null),
	);
}

export function analyzeScenario(files: FileInfo[]): ScenarioSuggestion[] {
	if (files.length < 2) return [];

	const suggestions: ScenarioSuggestion[] = [];

	const imageRatio = getTypeRatio(files, IMAGE_EXTS);
	const audioRatio = getTypeRatio(files, AUDIO_EXTS);
	const videoRatio = getTypeRatio(files, VIDEO_EXTS);
	const docRatio = getTypeRatio(files, DOC_EXTS);

	const hasExif = hasExifData(files);
	const hasTags = hasMediaTags(files);

	// Photo collection
	if (imageRatio >= 0.6) {
		const confidence = hasExif ? 0.95 : imageRatio * 0.8;
		const rules: RuleConfig[] = hasExif
			? [
					{
						type: "sequence",
						config: {
							seqType: "numeric" as const,
							start: 1,
							step: 1,
							padding: 3,
							position: "start" as const,
							template: "{exif.date}_{exif.time}_{n}",
							scope: "global" as const,
							sortBeforeNumbering: false,
							sortBy: "name" as const,
							sortOrder: "asc" as const,
							naturalSort: true,
							preserveOriginal: false,
							preservePattern: "(\\d+)",
							hierarchical: false,
							hierarchySeparator: ".",
						},
					},
				]
			: [
					{
						type: "sequence",
						config: {
							seqType: "numeric" as const,
							start: 1,
							step: 1,
							padding: 3,
							position: "start" as const,
							template: "Photo_{n}_{date}",
							scope: "perFolder" as const,
							sortBeforeNumbering: true,
							sortBy: "name" as const,
							sortOrder: "asc" as const,
							naturalSort: true,
							preserveOriginal: false,
							preservePattern: "(\\d+)",
							hierarchical: false,
							hierarchySeparator: ".",
						},
					},
				];
		suggestions.push({
			id: "photo_collection",
			scenario: "photo_collection",
			confidence,
			suggestedRules: rules,
			hasMetadata: hasExif,
		});
	}

	// Music library
	if (audioRatio >= 0.6) {
		const confidence = hasTags ? 0.92 : audioRatio * 0.75;
		const rules: RuleConfig[] = hasTags
			? [
					{
						type: "sequence",
						config: {
							seqType: "numeric" as const,
							start: 1,
							step: 1,
							padding: 2,
							position: "start" as const,
							template: "{media.track}. {media.artist} - {media.title}",
							scope: "global" as const,
							sortBeforeNumbering: false,
							sortBy: "name" as const,
							sortOrder: "asc" as const,
							naturalSort: true,
							preserveOriginal: false,
							preservePattern: "(\\d+)",
							hierarchical: false,
							hierarchySeparator: ".",
						},
					},
				]
			: [
					{
						type: "sequence",
						config: {
							seqType: "numeric" as const,
							start: 1,
							step: 1,
							padding: 2,
							position: "start" as const,
							template: "{n}. {name}",
							scope: "global" as const,
							sortBeforeNumbering: true,
							sortBy: "name" as const,
							sortOrder: "asc" as const,
							naturalSort: true,
							preserveOriginal: false,
							preservePattern: "(\\d+)",
							hierarchical: false,
							hierarchySeparator: ".",
						},
					},
				];
		suggestions.push({
			id: "music_library",
			scenario: "music_library",
			confidence,
			suggestedRules: rules,
			hasMetadata: hasTags,
		});
	}

	// Video series
	if (videoRatio >= 0.6) {
		const confidence = videoRatio * 0.8;
		suggestions.push({
			id: "video_series",
			scenario: "video_series",
			confidence,
			suggestedRules: [
				{
					type: "sequence",
					config: {
						seqType: "numeric" as const,
						start: 1,
						step: 1,
						padding: 2,
						position: "start" as const,
						template: "E{n} - {name}",
						scope: "perFolder" as const,
						sortBeforeNumbering: true,
						sortBy: "name" as const,
						sortOrder: "asc" as const,
						naturalSort: true,
						preserveOriginal: false,
						preservePattern: "(\\d+)",
						hierarchical: false,
						hierarchySeparator: ".",
					},
				},
			],
			hasMetadata: false,
		});
	}

	// Document archive
	if (docRatio >= 0.5) {
		const confidence = docRatio * 0.75;
		suggestions.push({
			id: "document_archive",
			scenario: "document_archive",
			confidence,
			suggestedRules: [
				{
					type: "sequence",
					config: {
						seqType: "numeric" as const,
						start: 1,
						step: 1,
						padding: 3,
						position: "start" as const,
						template: "{date}_{n}_{name}",
						scope: "global" as const,
						sortBeforeNumbering: true,
						sortBy: "modified" as const,
						sortOrder: "asc" as const,
						naturalSort: true,
						preserveOriginal: false,
						preservePattern: "(\\d+)",
						hierarchical: false,
						hierarchySeparator: ".",
					},
				},
			],
			hasMetadata: false,
		});
	}

	// Sort by confidence descending
	suggestions.sort((a, b) => b.confidence - a.confidence);

	return suggestions;
}
