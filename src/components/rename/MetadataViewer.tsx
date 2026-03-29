"use client";

import {
	Aperture,
	Calendar,
	Camera,
	Clock,
	Disc3,
	FileAudio,
	Focus,
	Gauge,
	Image,
	Info,
	MapPin,
	Music,
	Ruler,
	User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { FileMetadata, ImageMetadata, MediaMetadata } from "@/lib/file-metadata/types";

interface Props {
	metadata: FileMetadata;
}

function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${String(secs).padStart(2, "0")}`;
}

function formatBitrate(bitrate: number): string {
	return `${Math.round(bitrate / 1000)} kbps`;
}

function formatExposure(time: number): string {
	if (time >= 1) return `${time}s`;
	return `1/${Math.round(1 / time)}s`;
}

function ImageMetadataView({ data }: { data: ImageMetadata }) {
	const t = useTranslations("rename.metadata.image");

	const rows: { icon: React.ElementType; label: string; value: string }[] = [];

	if (data.dateTime) {
		const d = data.dateTime instanceof Date ? data.dateTime : new Date(data.dateTime);
		rows.push({ icon: Calendar, label: t("dateTime"), value: d.toLocaleString() });
	}
	if (data.cameraMake || data.cameraModel) {
		rows.push({
			icon: Camera,
			label: t("camera"),
			value: [data.cameraMake, data.cameraModel].filter(Boolean).join(" "),
		});
	}
	if (data.width && data.height) {
		rows.push({ icon: Ruler, label: t("resolution"), value: `${data.width} × ${data.height}` });
	}
	if (data.iso) {
		rows.push({ icon: Gauge, label: "ISO", value: String(data.iso) });
	}
	if (data.fNumber) {
		rows.push({ icon: Aperture, label: t("aperture"), value: `f/${data.fNumber}` });
	}
	if (data.exposureTime) {
		rows.push({ icon: Clock, label: t("exposure"), value: formatExposure(data.exposureTime) });
	}
	if (data.focalLength) {
		rows.push({ icon: Focus, label: t("focal"), value: `${data.focalLength}mm` });
	}
	if (data.gps) {
		rows.push({
			icon: MapPin,
			label: "GPS",
			value: `${Number(data.gps.latitude).toFixed(4)}, ${Number(data.gps.longitude).toFixed(4)}`,
		});
	}

	if (rows.length === 0) {
		return <p className="text-xs text-muted-foreground">{t("noData")}</p>;
	}

	return (
		<div className="space-y-1.5">
			{rows.map((row) => (
				<div key={row.label} className="flex items-center gap-2 text-xs">
					<row.icon className="h-3 w-3 text-muted-foreground shrink-0" />
					<span className="text-muted-foreground w-16 shrink-0">{row.label}</span>
					<span className="font-medium truncate">{row.value}</span>
				</div>
			))}
		</div>
	);
}

function MediaMetadataView({ data }: { data: MediaMetadata }) {
	const t = useTranslations("rename.metadata.media");

	const rows: { icon: React.ElementType; label: string; value: string }[] = [];

	if (data.title) {
		rows.push({ icon: Music, label: t("title"), value: data.title });
	}
	if (data.artist) {
		rows.push({ icon: User, label: t("artist"), value: data.artist });
	}
	if (data.album) {
		rows.push({ icon: Disc3, label: t("album"), value: data.album });
	}
	if (data.year) {
		rows.push({ icon: Calendar, label: t("year"), value: String(data.year) });
	}
	if (data.genre?.length) {
		rows.push({ icon: FileAudio, label: t("genre"), value: data.genre.join(", ") });
	}
	if (data.trackNumber) {
		rows.push({ icon: Music, label: t("track"), value: String(data.trackNumber) });
	}
	if (data.duration) {
		rows.push({ icon: Clock, label: t("duration"), value: formatDuration(data.duration) });
	}
	if (data.bitrate) {
		rows.push({ icon: Gauge, label: t("bitrate"), value: formatBitrate(data.bitrate) });
	}
	if (data.codec) {
		rows.push({ icon: FileAudio, label: t("codec"), value: data.codec });
	}

	if (rows.length === 0) {
		return <p className="text-xs text-muted-foreground">{t("noData")}</p>;
	}

	return (
		<div className="space-y-1.5">
			{rows.map((row) => (
				<div key={row.label} className="flex items-center gap-2 text-xs">
					<row.icon className="h-3 w-3 text-muted-foreground shrink-0" />
					<span className="text-muted-foreground w-14 shrink-0">{row.label}</span>
					<span className="font-medium truncate">{row.value}</span>
				</div>
			))}
		</div>
	);
}

export function MetadataViewer({ metadata }: Props) {
	const t = useTranslations("rename.metadata");

	const icon = metadata.kind === "image" ? Image : Music;
	const Icon = icon;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
				>
					<Info className="h-3 w-3" />
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-72" side="right" align="start">
				<div className="space-y-2">
					<div className="flex items-center gap-1.5">
						<Icon className="h-3.5 w-3.5 text-primary" />
						<h4 className="text-xs font-semibold">{t("title")}</h4>
					</div>
					{metadata.kind === "image" && <ImageMetadataView data={metadata} />}
					{metadata.kind === "media" && <MediaMetadataView data={metadata} />}
				</div>
			</PopoverContent>
		</Popover>
	);
}

export function MetadataIndicator({
	metadata,
	state,
}: {
	metadata?: FileMetadata | null;
	state?: string;
}) {
	if (state === "loading") {
		return (
			<span className="flex h-4 w-4 items-center justify-center">
				<span className="h-2 w-2 rounded-full bg-primary/50 animate-pulse" />
			</span>
		);
	}

	if (!metadata) return null;

	return <MetadataViewer metadata={metadata} />;
}
