export interface ImageMetadata {
	kind: "image";
	dateTime?: Date;
	cameraMake?: string;
	cameraModel?: string;
	width?: number;
	height?: number;
	iso?: number;
	fNumber?: number;
	exposureTime?: number;
	focalLength?: number;
	gps?: {
		latitude: number;
		longitude: number;
	};
}

export interface MediaMetadata {
	kind: "media";
	title?: string;
	artist?: string;
	album?: string;
	year?: number;
	genre?: string[];
	duration?: number;
	bitrate?: number;
	codec?: string;
	trackNumber?: number;
}

export interface DocumentMetadata {
	kind: "document";
	title?: string;
	author?: string;
	subject?: string;
	creator?: string;
	pageCount?: number;
}

export type FileMetadata = ImageMetadata | MediaMetadata | DocumentMetadata;

export type MetadataLoadState = "idle" | "loading" | "loaded" | "error";

export interface MetadataResult {
	state: MetadataLoadState;
	data?: FileMetadata;
	error?: string;
}
