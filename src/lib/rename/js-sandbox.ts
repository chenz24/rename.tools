import { SANDBOX_WORKER_SOURCE } from "@/lib/rename/js-sandbox-worker-source";
import type { CustomJsOptions } from "@/lib/rename/types";

type SandboxResult = {
	success: boolean;
	result: string;
	error?: string;
};

const activeWorkers = new Set<Worker>();
const SANDBOX_WORKER_VERSION = "20260522-strict-iife";
const SANDBOX_WORKER_URL = `/js-sandbox-worker.js?v=${SANDBOX_WORKER_VERSION}`;

type WorkerHandle = {
	worker: Worker;
	objectUrl?: string;
};

function createSandboxWorker(): WorkerHandle {
	if (
		typeof Blob !== "undefined" &&
		typeof URL !== "undefined" &&
		typeof URL.createObjectURL === "function"
	) {
		const objectUrl = URL.createObjectURL(
			new Blob([SANDBOX_WORKER_SOURCE], { type: "text/javascript" }),
		);
		try {
			return { worker: new Worker(objectUrl), objectUrl };
		} catch {
			URL.revokeObjectURL(objectUrl);
		}
	}

	return { worker: new Worker(SANDBOX_WORKER_URL) };
}

export async function executeSandboxedRename(
	code: string,
	options: CustomJsOptions,
	timeout = 1000,
): Promise<SandboxResult> {
	if (typeof Worker === "undefined") {
		return {
			success: false,
			result: options.name,
			error: "Sandbox worker is not available",
		};
	}

	return new Promise((resolve) => {
		let handle: WorkerHandle;
		try {
			handle = createSandboxWorker();
		} catch (error) {
			resolve({
				success: false,
				result: options.name,
				error: error instanceof Error ? error.message : String(error),
			});
			return;
		}

		const { worker, objectUrl } = handle;
		activeWorkers.add(worker);

		let settled = false;

		const settle = (result: SandboxResult) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeoutId);
			worker.terminate();
			activeWorkers.delete(worker);
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
			resolve(result);
		};

		const timeoutId = setTimeout(() => {
			settle({
				success: false,
				result: options.name,
				error: "Execution timeout",
			});
		}, timeout);

		worker.onmessage = (e: MessageEvent<SandboxResult>) => {
			settle(e.data);
		};

		worker.onerror = (e) => {
			settle({
				success: false,
				result: options.name,
				error: e.message || "Worker error",
			});
		};

		worker.postMessage({ code, options });
	});
}

export async function executeSandboxedJs(
	code: string,
	name: string,
	ext: string,
	index: number,
	timeout = 1000,
): Promise<SandboxResult> {
	return executeSandboxedRename(
		code,
		{
			name,
			ext: ext.startsWith(".") ? ext.slice(1) : ext,
			fullName: ext ? `${name}${ext}` : name,
			index,
		},
		timeout,
	);
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
	for (const worker of activeWorkers) {
		worker.terminate();
	}
	activeWorkers.clear();
}
