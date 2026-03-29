import type { ImageMetadata } from "./types";

const IMAGE_EXTENSIONS = new Set([
	"jpg",
	"jpeg",
	"png",
	"heic",
	"heif",
	"webp",
	"tiff",
	"tif",
	"avif",
]);

export function isImageFile(ext: string): boolean {
	return IMAGE_EXTENSIONS.has(ext.toLowerCase().replace(".", ""));
}

export async function extractImageMetadata(file: File): Promise<ImageMetadata> {
	// Dynamic import to avoid bundling exifr when not needed
	const exifr = await import("exifr");

	const exif = await exifr.parse(file, {
		pick: [
			"DateTimeOriginal",
			"CreateDate",
			"Make",
			"Model",
			"ImageWidth",
			"ImageHeight",
			"ExifImageWidth",
			"ExifImageHeight",
			"ISO",
			"FNumber",
			"ExposureTime",
			"FocalLength",
			"GPSLatitude",
			"GPSLongitude",
		],
	});

	if (!exif) {
		return { kind: "image" };
	}

	return {
		kind: "image",
		dateTime: exif.DateTimeOriginal || exif.CreateDate || undefined,
		cameraMake: exif.Make || undefined,
		cameraModel: exif.Model || undefined,
		width: exif.ExifImageWidth || exif.ImageWidth || undefined,
		height: exif.ExifImageHeight || exif.ImageHeight || undefined,
		iso: exif.ISO || undefined,
		fNumber: exif.FNumber || undefined,
		exposureTime: exif.ExposureTime || undefined,
		focalLength: exif.FocalLength || undefined,
		gps:
			exif.GPSLatitude != null && exif.GPSLongitude != null
				? { latitude: exif.GPSLatitude, longitude: exif.GPSLongitude }
				: undefined,
	};
}
