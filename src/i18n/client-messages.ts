import type { AbstractIntlMessages } from "next-intl";

/** Nested providers replace messages, so include the shared UI namespaces too. */
export function getClientMessages(messages: AbstractIntlMessages, namespaces: string[] = []) {
	return Object.fromEntries(
		["header", "footer", "error", "notFound", "guideLinks", ...namespaces].map((key) => [
			key,
			messages[key],
		]),
	);
}
