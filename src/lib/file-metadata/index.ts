import { extractImageMetadata, isImageFile } from "./image";
import { extractMediaMetadata, isMediaFile } from "./media";
import type { FileMetadata } from "./types";

export { isImageFile } from "./image";
export { isAudioFile, isMediaFile } from "./media";
export type {
	DocumentMetadata,
	FileMetadata,
	ImageMetadata,
	MediaMetadata,
	MetadataLoadState,
	MetadataResult,
} from "./types";

function getExtension(fileName: string): string {
	const lastDot = fileName.lastIndexOf(".");
	return lastDot > 0 ? fileName.slice(lastDot + 1).toLowerCase() : "";
}

export async function extractMetadata(file: File): Promise<FileMetadata | null> {
	const ext = getExtension(file.name);

	if (isImageFile(ext)) {
		try {
			return await extractImageMetadata(file);
		} catch {
			return { kind: "image" };
		}
	}

	if (isMediaFile(ext)) {
		try {
			return await extractMediaMetadata(file);
		} catch {
			return { kind: "media" };
		}
	}

	return null;
}

// Resolve a metadata variable like {exif.date} or {media.artist}
export function resolveMetadataVariable(
	variable: string,
	metadata: FileMetadata | undefined | null,
): string | null {
	if (!metadata) return null;

	switch (variable) {
		// Image EXIF variables
		case "exif.date": {
			if (metadata.kind !== "image" || !metadata.dateTime) return null;
			const d = metadata.dateTime instanceof Date ? metadata.dateTime : new Date(metadata.dateTime);
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
		}
		case "exif.time": {
			if (metadata.kind !== "image" || !metadata.dateTime) return null;
			const d = metadata.dateTime instanceof Date ? metadata.dateTime : new Date(metadata.dateTime);
			return `${String(d.getHours()).padStart(2, "0")}-${String(d.getMinutes()).padStart(2, "0")}-${String(d.getSeconds()).padStart(2, "0")}`;
		}
		case "exif.datetime": {
			if (metadata.kind !== "image" || !metadata.dateTime) return null;
			const d = metadata.dateTime instanceof Date ? metadata.dateTime : new Date(metadata.dateTime);
			return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}_${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}${String(d.getSeconds()).padStart(2, "0")}`;
		}
		case "exif.camera": {
			if (metadata.kind !== "image") return null;
			const parts = [metadata.cameraMake, metadata.cameraModel].filter(Boolean);
			return parts.length > 0 ? parts.join("_").replace(/\s+/g, "_") : null;
		}
		case "exif.make": {
			if (metadata.kind !== "image") return null;
			return metadata.cameraMake?.replace(/\s+/g, "_") || null;
		}
		case "exif.model": {
			if (metadata.kind !== "image") return null;
			return metadata.cameraModel?.replace(/\s+/g, "_") || null;
		}
		case "exif.resolution": {
			if (metadata.kind !== "image" || !metadata.width || !metadata.height) return null;
			return `${metadata.width}x${metadata.height}`;
		}
		case "exif.iso": {
			if (metadata.kind !== "image" || !metadata.iso) return null;
			return String(metadata.iso);
		}
		case "exif.fnumber": {
			if (metadata.kind !== "image" || !metadata.fNumber) return null;
			return `f${metadata.fNumber}`;
		}
		case "exif.focal": {
			if (metadata.kind !== "image" || !metadata.focalLength) return null;
			return `${metadata.focalLength}mm`;
		}
		case "exif.gps": {
			if (metadata.kind !== "image" || !metadata.gps) return null;
			return `${metadata.gps.latitude.toFixed(4)}_${metadata.gps.longitude.toFixed(4)}`;
		}

		// Media variables
		case "media.title": {
			if (metadata.kind !== "media") return null;
			return metadata.title?.replace(/[<>:"/\\|?*]/g, "_") || null;
		}
		case "media.artist": {
			if (metadata.kind !== "media") return null;
			return metadata.artist?.replace(/[<>:"/\\|?*]/g, "_") || null;
		}
		case "media.album": {
			if (metadata.kind !== "media") return null;
			return metadata.album?.replace(/[<>:"/\\|?*]/g, "_") || null;
		}
		case "media.year": {
			if (metadata.kind !== "media" || !metadata.year) return null;
			return String(metadata.year);
		}
		case "media.genre": {
			if (metadata.kind !== "media" || !metadata.genre?.length) return null;
			return metadata.genre[0].replace(/[<>:"/\\|?*]/g, "_");
		}
		case "media.track": {
			if (metadata.kind !== "media" || !metadata.trackNumber) return null;
			return String(metadata.trackNumber).padStart(2, "0");
		}
		case "media.duration": {
			if (metadata.kind !== "media" || !metadata.duration) return null;
			const mins = Math.floor(metadata.duration / 60);
			const secs = Math.floor(metadata.duration % 60);
			return `${mins}m${String(secs).padStart(2, "0")}s`;
		}

		default:
			return null;
	}
}

// Get all supported metadata variable names for UI display
export const METADATA_VARIABLES = {
	image: [
		{ key: "exif.date", example: "2024-03-15" },
		{ key: "exif.time", example: "14-30-25" },
		{ key: "exif.datetime", example: "20240315_143025" },
		{ key: "exif.camera", example: "Canon_EOS_5D" },
		{ key: "exif.make", example: "Canon" },
		{ key: "exif.model", example: "EOS_5D" },
		{ key: "exif.resolution", example: "4000x3000" },
		{ key: "exif.iso", example: "400" },
		{ key: "exif.fnumber", example: "f2.8" },
		{ key: "exif.focal", example: "50mm" },
		{ key: "exif.gps", example: "39.9042_116.4074" },
	],
	media: [
		{ key: "media.title", example: "Song_Name" },
		{ key: "media.artist", example: "Artist_Name" },
		{ key: "media.album", example: "Album_Name" },
		{ key: "media.year", example: "2024" },
		{ key: "media.genre", example: "Rock" },
		{ key: "media.track", example: "01" },
		{ key: "media.duration", example: "3m45s" },
	],
} as const;
