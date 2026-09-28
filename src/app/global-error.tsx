"use client";

import { RecoveryError } from "@/components/RecoveryError";

export default function GlobalError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html>
			<body>
				<RecoveryError reset={reset} />
			</body>
		</html>
	);
}
