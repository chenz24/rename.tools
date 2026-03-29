"use client";

import { useCallback, useState } from "react";
import {
	buildParsedGroups,
	type FileMatchResult,
	matchFiles,
	type ParsedGroup,
	type ScraperState,
	searchGroups,
} from "@/lib/media-scraper";
import { formatScrapedName } from "@/lib/media-scraper/matcher";
import { DEFAULT_NAMING_TEMPLATES } from "@/lib/media-scraper/types";
import type { FileEntry } from "@/lib/rename/types";

export interface UseMediaScraperReturn {
	state: ScraperState;
	groups: ParsedGroup[];
	matchResults: FileMatchResult[];
	progress: { current: number; total: number };
	selectedTemplate: string;
	error: string | null;

	startParsing: (files: FileEntry[]) => void;
	startSearching: (apiKey: string, language?: string) => Promise<ParsedGroup[]>;
	updateGroupTitle: (groupId: string, title: string) => void;
	selectTmdbResult: (groupId: string, tmdbId: number) => void;
	fetchMatches: (
		files: FileEntry[],
		apiKey: string,
		groups?: ParsedGroup[],
		language?: string,
	) => Promise<void>;
	toggleMatch: (fileId: string) => void;
	toggleAllMatches: (selected: boolean) => void;
	setSelectedTemplate: (template: string) => void;
	getFormattedResults: () => Array<{ fileId: string; newName: string; extension: string }>;
	reset: () => void;
}

export function useMediaScraper(): UseMediaScraperReturn {
	const [state, setState] = useState<ScraperState>("idle");
	const [groups, setGroups] = useState<ParsedGroup[]>([]);
	const [matchResults, setMatchResults] = useState<FileMatchResult[]>([]);
	const [progress, setProgress] = useState({ current: 0, total: 0 });
	const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_NAMING_TEMPLATES[0].template);
	const [error, setError] = useState<string | null>(null);

	const startParsing = useCallback((files: FileEntry[]) => {
		setState("parsing");
		setError(null);
		const parsed = buildParsedGroups(files);
		setGroups(parsed);
		setProgress({ current: 0, total: parsed.length });
		setState(parsed.length > 0 ? "parsing" : "idle");
	}, []);

	const startSearching = useCallback(
		async (apiKey: string, language = "en-US"): Promise<ParsedGroup[]> => {
			setState("searching");
			setError(null);
			try {
				const total = groups.length;
				setProgress({ current: 0, total });

				const updated = await searchGroups(groups, apiKey, language);

				setGroups(updated);
				setProgress({ current: total, total });
				setState("searching");
				return updated;
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : "Search failed";
				setError(message);
				setState("error");
				return groups;
			}
		},
		[groups],
	);

	const updateGroupTitle = useCallback((groupId: string, title: string) => {
		setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, title } : g)));
	}, []);

	const selectTmdbResult = useCallback((groupId: string, tmdbId: number) => {
		setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, selectedTmdbId: tmdbId } : g)));
	}, []);

	const fetchMatches = useCallback(
		async (files: FileEntry[], apiKey: string, groupsToUse?: ParsedGroup[], language = "en-US") => {
			setState("searching");
			setError(null);
			try {
				const effectiveGroups = groupsToUse ?? groups;
				const results = await matchFiles(files, effectiveGroups, apiKey, language);
				setMatchResults(results);
				setState("matched");
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : "Match failed";
				setError(message);
				setState("error");
			}
		},
		[groups],
	);

	const toggleMatch = useCallback((fileId: string) => {
		setMatchResults((prev) =>
			prev.map((r) => (r.fileId === fileId ? { ...r, selected: !r.selected } : r)),
		);
	}, []);

	const toggleAllMatches = useCallback((selected: boolean) => {
		setMatchResults((prev) => prev.map((r) => (r.match ? { ...r, selected } : r)));
	}, []);

	const getFormattedResults = useCallback(() => {
		return matchResults
			.filter((r) => r.selected && r.match)
			.map((r) => {
				const newName = formatScrapedName(r.match!, selectedTemplate);
				const lastDot = r.fileName.lastIndexOf(".");
				const extension = lastDot > 0 ? r.fileName.slice(lastDot) : "";
				return {
					fileId: r.fileId,
					newName: newName + extension,
					extension,
				};
			});
	}, [matchResults, selectedTemplate]);

	const reset = useCallback(() => {
		setState("idle");
		setGroups([]);
		setMatchResults([]);
		setProgress({ current: 0, total: 0 });
		setError(null);
	}, []);

	return {
		state,
		groups,
		matchResults,
		progress,
		selectedTemplate,
		error,
		startParsing,
		startSearching,
		updateGroupTitle,
		selectTmdbResult,
		fetchMatches,
		toggleMatch,
		toggleAllMatches,
		setSelectedTemplate,
		getFormattedResults,
		reset,
	};
}
