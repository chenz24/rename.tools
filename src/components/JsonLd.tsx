import type { Thing, WithContext } from "schema-dts";

type JsonLdProps = {
	data: WithContext<Thing>;
};

function serializeJsonLd(data: WithContext<Thing>): string {
	// 转义 HTML 特殊字符防止 XSS
	return JSON.stringify(data)
		.replace(/</g, "\\u003c")
		.replace(/>/g, "\\u003e")
		.replace(/&/g, "\\u0026");
}

export function JsonLd({ data }: JsonLdProps) {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON is properly escaped to prevent XSS
			dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
		/>
	);
}
