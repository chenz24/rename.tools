"use client";

import { useCallback, useEffect, useState } from "react";
import { type ApiKeyValidationResult, validateApiKey } from "@/lib/media-scraper/tmdb";

const STORAGE_KEY = "rename-tools:tmdb-api-key";

export type SaveApiKeyResult = {
	success: boolean;
	error?: "invalid" | "network" | "timeout" | "unknown";
};

export function useTmdbConfig() {
	const [apiKey, setApiKey] = useState<string | null>(null);
	const [isValidating, setIsValidating] = useState(false);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) setApiKey(stored);
		} catch {
			// localStorage not available
		}
	}, []);

	const saveApiKey = useCallback(async (key: string): Promise<SaveApiKeyResult> => {
		setIsValidating(true);
		try {
			const result: ApiKeyValidationResult = await validateApiKey(key);
			if (result.valid) {
				localStorage.setItem(STORAGE_KEY, key);
				setApiKey(key);
				return { success: true };
			}
			return { success: false, error: result.error };
		} catch {
			return { success: false, error: "unknown" };
		} finally {
			setIsValidating(false);
		}
	}, []);

	const clearApiKey = useCallback(() => {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// ignore
		}
		setApiKey(null);
	}, []);

	return {
		apiKey,
		isConfigured: !!apiKey,
		isValidating,
		saveApiKey,
		clearApiKey,
	};
}
