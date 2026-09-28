import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
	if (!GA_MEASUREMENT_ID) return null;

	// Queue initialization during hydration, then load the large SDK after load/idle.
	return (
		<>
			<Script
				src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
				strategy="lazyOnload"
			/>
			<Script id="google-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', '${GA_MEASUREMENT_ID}');
				`}
			</Script>
		</>
	);
}
