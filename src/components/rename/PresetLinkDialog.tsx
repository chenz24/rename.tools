"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const PresetLinkReview = dynamic(() =>
	import("./PresetLinkReview").then((m) => m.PresetLinkDialog),
);

export function PresetLinkDialog() {
	const params = useSearchParams();
	return params.has("recipe") || params.has("preset") ? <PresetLinkReview /> : null;
}
