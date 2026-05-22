export const SANDBOX_WORKER_SOURCE = String.raw`
self.onmessage = function (e) {
	const { code, options } = e.data;
	const fallbackName = options?.name || "";

	try {
		const frozenOptions = Object.freeze({ ...options });
		const blockedGlobalNames = [
			"globalThis",
			"self",
			"window",
			"document",
			"navigator",
			"localStorage",
			"sessionStorage",
			"indexedDB",
			"caches",
			"fetch",
			"XMLHttpRequest",
			"WebSocket",
			"EventSource",
			"importScripts",
			"postMessage",
			"close",
			"Function",
			"eval",
		];
		const body = [
			"return (() => {",
			'"use strict";',
			code,
			'if (typeof rename === "function") {',
			"return rename(options);",
			"}",
			"return options.name;",
			"})();",
		].join("\n");
		const fn = new Function("options", ...blockedGlobalNames, body);
		const result = fn(frozenOptions, ...new Array(blockedGlobalNames.length).fill(undefined));

		if (typeof result === "string") {
			self.postMessage({ success: true, result });
		} else {
			self.postMessage({
				success: false,
				error: "Expected string return value, got " + typeof result,
				result: fallbackName,
			});
		}
	} catch (error) {
		self.postMessage({
			success: false,
			error: error.message || String(error),
			result: fallbackName,
		});
	}
};
`;
