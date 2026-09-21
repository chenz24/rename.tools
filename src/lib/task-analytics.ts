import type { FileEntry } from "@/lib/rename/types";

// Keep this opt-in until all deployed analytics providers' automatic URL payloads
// have been reviewed. In particular, shared preset URLs can contain user data.
const enabled = process.env.NEXT_PUBLIC_TASK_ANALYTICS_ENABLED === "true";
const website = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const recipeIds = [
	"photo-date-sequence",
	"regex-date",
	"sequence-preserve",
	"prefix-suffix",
	"spaces-to-underscores",
];
const values = {
	recipe_id: recipeIds,
	entry: ["home", "guide", "direct"],
	mode: ["sample", "real", "mixed", "empty"],
	result: ["success", "partial", "failure", "cancelled"],
	platform: ["bash", "powershell", "undo"],
	capability: ["direct", "script"],
} as const;
const fields = {
	recipe_open: ["recipe_id", "entry"],
	recipe_apply: ["recipe_id", "mode"],
	preview_ready: ["mode", "capability"],
	rename_complete: ["mode", "result"],
	script_export: ["mode", "platform"],
} as const;
type EventName = keyof typeof fields;
type EventData = Partial<Record<keyof typeof values, string>>;

export function sanitizeTaskEvent(name: string, input: EventData): EventData | null {
	if (!Object.hasOwn(fields, name)) return null;
	const data: EventData = {};
	for (const key of fields[name as EventName]) {
		const value = input[key];
		if (!value || !(values[key] as readonly string[]).includes(value)) return null;
		data[key] = value;
	}
	return data;
}

export function taskMode(
	files: Pick<FileEntry, "handle">[],
): "sample" | "real" | "mixed" | "empty" {
	if (!files.length) return "empty";
	const count = files.filter((file) => file.handle).length;
	return count === files.length ? "real" : count === 0 ? "sample" : "mixed";
}

/** Explicit payload: never inherit Umami's automatic URL, referrer or document title. */
export function taskPayload(name: string, data: EventData, pathname: string, websiteId: string) {
	const safe = sanitizeTaskEvent(name, data);
	const match = /^\/(en|zh|de|es|fr|ja|ko)\/app\/?$/.exec(pathname);
	if (!safe || !match) return null;
	return {
		website: websiteId,
		url: `/${match[1]}/app`,
		title: "Rename.Tools",
		name,
		data: { ...safe, locale: match[1] },
	};
}

const seen = new Set<string>();
export function trackTaskEvent(name: EventName, data: EventData) {
	if (!enabled || !website || typeof window === "undefined") return;
	const payload = taskPayload(name, data, window.location.pathname, website);
	if (!payload) return;
	const client = (window as Window & { umami?: { track: (payload: object) => unknown } }).umami;
	if (!client) return; // No retries or persistent queue containing interaction data.
	const key = JSON.stringify(payload);
	try {
		if (seen.has(key) || sessionStorage.getItem(`task:${key}`)) return;
	} catch {
		/* Storage can be unavailable; memory deduplication still applies. */
	}
	try {
		const result = client.track(payload);
		seen.add(key);
		try {
			sessionStorage.setItem(`task:${key}`, "1");
		} catch {
			/* Optional storage. */
		}
		void Promise.resolve(result).catch(() => {});
	} catch {
		/* Analytics must never interrupt file operations. */
	}
}
