"use client";

import { useEffect, useState } from "react";
import { getRecoveryCopy, repairHref } from "@/lib/page-recovery";

/** No UI library or context providers: usable even if the normal shell fails. */
export function RecoveryError({ reset }: { reset: () => void }) {
	const [locale, setLocale] = useState("en");
	const [href, setHref] = useState("/repair.html");
	useEffect(() => {
		setLocale(document.documentElement.lang || location.pathname.split("/")[1]);
		setHref(repairHref(location.pathname + location.search + location.hash));
	}, []);
	const copy = getRecoveryCopy(locale);
	return (
		<main
			style={{
				maxWidth: 520,
				margin: "12vh auto",
				padding: 24,
				fontFamily: "system-ui",
				textAlign: "center",
				lineHeight: 1.6,
			}}
		>
			<h1>{copy.title}</h1>
			<p>{copy.description}</p>
			<button
				type="button"
				onClick={reset}
				style={{ padding: "10px 20px", margin: 8, cursor: "pointer" }}
			>
				{copy.retry}
			</button>
			<a
				href={href}
				style={{
					display: "inline-block",
					padding: "10px 20px",
					background: "#1d4ed8",
					color: "white",
					borderRadius: 6,
				}}
			>
				{copy.repair}
			</a>
		</main>
	);
}
