"use client";

import { RecoveryError } from "@/components/RecoveryError";

export default function ErrorPage({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return <RecoveryError reset={reset} />;
}
