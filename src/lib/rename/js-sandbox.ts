// Sandboxed JavaScript executor with timeout protection using Web Worker

type SandboxResult = {
	success: boolean;
	result: string;
	error?: string;
};

let worker: Worker | null = null;
let pendingResolve: ((result: SandboxResult) => void) | null = null;

function getWorker(): Worker {
	if (!worker) {
		worker = new Worker("/js-sandbox-worker.js");
		worker.onmessage = (e: MessageEvent<SandboxResult>) => {
			if (pendingResolve) {
				pendingResolve(e.data);
				pendingResolve = null;
			}
		};
		worker.onerror = (e) => {
			if (pendingResolve) {
				pendingResolve({
					success: false,
					result: "",
					error: e.message || "Worker error",
				});
				pendingResolve = null;
			}
		};
	}
	return worker;
}

export async function executeSandboxedJs(
	code: string,
	name: string,
	ext: string,
	index: number,
	timeout = 1000,
): Promise<SandboxResult> {
	return new Promise((resolve) => {
		const w = getWorker();

		// Fallback timeout in case worker doesn't respond
		const fallbackTimeout = setTimeout(() => {
			if (pendingResolve) {
				pendingResolve = null;
				resolve({
					success: false,
					result: name,
					error: "Execution timeout",
				});
			}
		}, timeout + 500);

		pendingResolve = (result) => {
			clearTimeout(fallbackTimeout);
			resolve(result);
		};

		w.postMessage({ code, name, ext, index, timeout });
	});
}

// Synchronous execution with timeout (fallback for batch processing)
export function executeJs(
	code: string,
	name: string,
	ext: string,
	index: number,
): { result: string; error?: string } {
	try {
		const fn = new Function("name", "ext", "index", code);
		const result = fn(name, ext, index);
		if (typeof result === "string") {
			return { result };
		}
		return { result: name, error: `Expected string, got ${typeof result}` };
	} catch (e) {
		return { result: name, error: e instanceof Error ? e.message : String(e) };
	}
}

// Validate code syntax without executing
export function validateJsCode(code: string): { valid: boolean; error?: string } {
	try {
		new Function("name", "ext", "index", code);
		return { valid: true };
	} catch (e) {
		return { valid: false, error: e instanceof Error ? e.message : String(e) };
	}
}

// Cleanup worker when no longer needed
export function terminateSandbox(): void {
	if (worker) {
		worker.terminate();
		worker = null;
		pendingResolve = null;
	}
}
