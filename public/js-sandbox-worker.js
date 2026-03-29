// Web Worker for sandboxed JavaScript execution with timeout protection
let executionTimeout = null;

self.onmessage = function (e) {
	const { code, name, ext, index, timeout = 1000 } = e.data;

	// Clear any existing timeout
	if (executionTimeout) {
		clearTimeout(executionTimeout);
	}

	// Set timeout protection
	executionTimeout = setTimeout(() => {
		self.postMessage({
			success: false,
			error: "Execution timeout: code took too long to execute",
			result: name,
		});
	}, timeout);

	try {
		// Create a sandboxed function
		const fn = new Function("name", "ext", "index", code);
		const result = fn(name, ext, index);

		clearTimeout(executionTimeout);

		if (typeof result === "string") {
			self.postMessage({ success: true, result });
		} else {
			self.postMessage({
				success: false,
				error: `Expected string return value, got ${typeof result}`,
				result: name,
			});
		}
	} catch (error) {
		clearTimeout(executionTimeout);
		self.postMessage({
			success: false,
			error: error.message || String(error),
			result: name,
		});
	}
};
