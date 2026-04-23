import Script from "next/script";

const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_SRC =
	process.env.NEXT_PUBLIC_UMAMI_SRC || "https://cloud.umami.is/script.js";

export function UmamiAnalytics() {
	if (!UMAMI_WEBSITE_ID) return null;

	return (
		<Script
			src={UMAMI_SRC}
			strategy="afterInteractive"
			data-website-id={UMAMI_WEBSITE_ID}
		/>
	);
}
