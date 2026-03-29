"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
	PresetCategory,
	PresetPinned,
	PresetSortMode,
	RuleConfig,
	UserPreset,
} from "@/lib/rename/types";

let nextPresetId = 1;
function generatePresetId() {
	return `preset_${Date.now()}_${nextPresetId++}`;
}

interface PresetsState {
	presets: UserPreset[];
	pinned: PresetPinned[];
	sortMode: PresetSortMode;
	searchQuery: string;
	categoryFilter: PresetCategory | "all";
	setSortMode: (mode: PresetSortMode) => void;
	setSearchQuery: (query: string) => void;
	setCategoryFilter: (filter: PresetCategory | "all") => void;
	savePreset: (
		name: string,
		rules: RuleConfig[],
		options?: {
			description?: string;
			tags?: string[];
			category?: PresetCategory;
		},
	) => string;
	updatePreset: (id: string, updates: Partial<Omit<UserPreset, "id" | "createdAt">>) => void;
	deletePreset: (id: string) => void;
	incrementUsage: (id: string) => void;
	togglePin: (type: "system" | "user", id: string) => void;
	isPinned: (type: "system" | "user", id: string) => boolean;
	exportPresets: (ids?: string[]) => void;
	importPresets: (file: File) => Promise<number>;
	generateShareUrl: (id: string) => string;
	importFromUrl: (encoded: string) => string | null;
}

export const usePresetsStore = create<PresetsState>()(
	persist(
		(set, get) => ({
			presets: [],
			pinned: [],
			sortMode: "recent",
			searchQuery: "",
			categoryFilter: "all",

			setSortMode: (mode) => set({ sortMode: mode }),
			setSearchQuery: (query) => set({ searchQuery: query }),
			setCategoryFilter: (filter) => set({ categoryFilter: filter }),

			savePreset: (name, rules, options) => {
				const newPreset: UserPreset = {
					id: generatePresetId(),
					name,
					description: options?.description,
					tags: options?.tags,
					category: options?.category,
					rules,
					createdAt: Date.now(),
					lastUsedAt: Date.now(),
					usageCount: 0,
				};

				set((state) => ({
					presets: [...state.presets, newPreset],
				}));

				return newPreset.id;
			},

			updatePreset: (id, updates) => {
				set((state) => ({
					presets: state.presets.map((p) => (p.id === id ? { ...p, ...updates } : p)),
				}));
			},

			deletePreset: (id) => {
				set((state) => ({
					presets: state.presets.filter((p) => p.id !== id),
					pinned: state.pinned.filter((p) => !(p.type === "user" && p.id === id)),
				}));
			},

			incrementUsage: (id) => {
				set((state) => ({
					presets: state.presets.map((p) =>
						p.id === id ? { ...p, lastUsedAt: Date.now(), usageCount: p.usageCount + 1 } : p,
					),
				}));
			},

			togglePin: (type, id) => {
				set((state) => {
					const existingIndex = state.pinned.findIndex((p) => p.type === type && p.id === id);

					if (existingIndex >= 0) {
						return {
							pinned: state.pinned.filter((_, i) => i !== existingIndex),
						};
					} else {
						return {
							pinned: [...state.pinned, { type, id, pinnedAt: Date.now() }],
						};
					}
				});
			},

			isPinned: (type, id) => {
				return get().pinned.some((p) => p.type === type && p.id === id);
			},

			exportPresets: (ids) => {
				const { presets } = get();
				const toExport = ids ? presets.filter((p) => ids.includes(p.id)) : presets;
				const data = JSON.stringify(toExport, null, 2);
				const blob = new Blob([data], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `rename-presets-${new Date().toISOString().slice(0, 10)}.json`;
				a.click();
				URL.revokeObjectURL(url);
			},

			importPresets: (file) => {
				return new Promise<number>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = (e) => {
						try {
							const imported = JSON.parse(e.target?.result as string) as UserPreset[];
							if (!Array.isArray(imported)) {
								throw new Error("Invalid preset format");
							}

							const newPresets = imported.map((p) => ({
								...p,
								id: generatePresetId(),
								createdAt: Date.now(),
								lastUsedAt: Date.now(),
								usageCount: 0,
							}));

							set((state) => ({
								presets: [...state.presets, ...newPresets],
							}));

							resolve(newPresets.length);
						} catch (err) {
							reject(err);
						}
					};
					reader.onerror = () => reject(new Error("Failed to read file"));
					reader.readAsText(file);
				});
			},

			generateShareUrl: (id) => {
				const preset = get().presets.find((p) => p.id === id);
				if (!preset) return "";

				const exportData = {
					name: preset.name,
					description: preset.description,
					tags: preset.tags,
					category: preset.category,
					rules: preset.rules,
				};

				const encoded = btoa(encodeURIComponent(JSON.stringify(exportData)));
				return `${window.location.origin}${window.location.pathname}?preset=${encoded}`;
			},

			importFromUrl: (encoded) => {
				try {
					const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
					const preset: UserPreset = {
						id: generatePresetId(),
						name: decoded.name || "Imported Preset",
						description: decoded.description,
						tags: decoded.tags,
						category: decoded.category,
						rules: decoded.rules,
						createdAt: Date.now(),
						lastUsedAt: Date.now(),
						usageCount: 0,
					};

					set((state) => ({
						presets: [...state.presets, preset],
					}));

					return preset.id;
				} catch (err) {
					console.error("Failed to import from URL:", err);
					return null;
				}
			},
		}),
		{
			name: "renametools:presets-storage",
			partialize: (state) => ({
				presets: state.presets,
				pinned: state.pinned,
			}),
		},
	),
);

// Selector hook for filtered and sorted presets
export function useFilteredPresets() {
	const presets = usePresetsStore((state) => state.presets);
	const searchQuery = usePresetsStore((state) => state.searchQuery);
	const categoryFilter = usePresetsStore((state) => state.categoryFilter);
	const sortMode = usePresetsStore((state) => state.sortMode);

	let result = [...presets];

	if (searchQuery) {
		const query = searchQuery.toLowerCase();
		result = result.filter(
			(p) =>
				p.name.toLowerCase().includes(query) ||
				p.description?.toLowerCase().includes(query) ||
				p.tags?.some((t) => t.toLowerCase().includes(query)),
		);
	}

	if (categoryFilter !== "all") {
		result = result.filter((p) => p.category === categoryFilter);
	}

	switch (sortMode) {
		case "recent":
			result.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
			break;
		case "frequent":
			result.sort((a, b) => b.usageCount - a.usageCount);
			break;
		case "name":
			result.sort((a, b) => a.name.localeCompare(b.name));
			break;
		case "created":
			result.sort((a, b) => b.createdAt - a.createdAt);
			break;
	}

	return result;
}
