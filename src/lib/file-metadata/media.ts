import type { MediaMetadata } from "./types";

const AUDIO_EXTENSIONS = new Set([
	"mp3",
	"flac",
	"wav",
	"aac",
	"ogg",
	"wma",
	"m4a",
	"opus",
	"aiff",
]);

const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "avi", "mkv", "wmv", "flv", "webm", "m4v", "ts"]);

export function isMediaFile(ext: string): boolean {
	const normalized = ext.toLowerCase().replace(".", "");
	return AUDIO_EXTENSIONS.has(normalized) || VIDEO_EXTENSIONS.has(normalized);
}

export function isAudioFile(ext: string): boolean {
	return AUDIO_EXTENSIONS.has(ext.toLowerCase().replace(".", ""));
}

export async function extractMediaMetadata(file: File): Promise<MediaMetadata> {
	// Dynamic import to avoid bundling when not needed
	const { parseBlob } = await import("music-metadata-browser");

	const metadata = await parseBlob(file, { duration: true });

	return {
		kind: "media",
		title: metadata.common.title || undefined,
		artist: metadata.common.artist || undefined,
		album: metadata.common.album || undefined,
		year: metadata.common.year || undefined,
		genre: metadata.common.genre?.length ? metadata.common.genre : undefined,
		duration: metadata.format.duration || undefined,
		bitrate: metadata.format.bitrate || undefined,
		codec: metadata.format.codec || undefined,
		trackNumber: metadata.common.track?.no || undefined,
	};
}
