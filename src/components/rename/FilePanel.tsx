"use client";

import {
	ArrowDownAZ,
	Clapperboard,
	Database,
	FileUp,
	Filter,
	FlaskConical,
	FolderOpen,
	Loader2,
	Trash2,
	Upload,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { FileTree } from "@/components/rename/FileTree";
import { FilterPanel } from "@/components/rename/FilterPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { MetadataLoadProgress } from "@/hooks/useMetadataLoader";
import type { SortMode } from "@/hooks/useRenameStore";
import type { FileEntry, FilterCondition } from "@/lib/rename/types";

interface Props {
	allFiles: FileEntry[];
	filteredFiles: FileEntry[];
	onAddFiles: (
		names: string[],
		handles?: FileSystemFileHandle[],
		relativePaths?: string[],
	) => Promise<void>;
	onToggle: (id: string) => void;
	onSelectAll: (selected: boolean, filteredIds?: string[]) => void;
	onClear: () => void;
	onSortFiles: (mode: SortMode) => void;
	sortMode: SortMode;
	filterConditions: FilterCondition[];
	filterLogic: "AND" | "OR";
	onAddFilterCondition: () => void;
	onUpdateFilterCondition: (id: string, updates: Partial<FilterCondition>) => void;
	onRemoveFilterCondition: (id: string) => void;
	onSetFilterLogic: (logic: "AND" | "OR") => void;
	onClearFilter: () => void;
	onLoadMetadata?: () => void;
	metadataProgress?: MetadataLoadProgress;
	hasMetadata?: boolean;
	onOpenScraper?: () => void;
	scraperLoading?: boolean;
	hasScrapedData?: boolean;
	hasVideoFiles?: boolean;
}

export function FilePanel({
	allFiles,
	filteredFiles,
	onAddFiles,
	onToggle,
	onSelectAll,
	onClear,
	onSortFiles,
	sortMode,
	filterConditions,
	filterLogic,
	onAddFilterCondition,
	onUpdateFilterCondition,
	onRemoveFilterCondition,
	onSetFilterLogic,
	onClearFilter,
	onLoadMetadata,
	metadataProgress,
	hasMetadata,
	onOpenScraper,
	scraperLoading,
	hasScrapedData,
	hasVideoFiles,
}: Props) {
	const t = useTranslations("rename.files");
	const [sampleMode, setSampleMode] = useState(false);
	const [sampleText, setSampleText] = useState("");
	const [apiSupported, setApiSupported] = useState(false);
	const [filterOpen, setFilterOpen] = useState(false);
	const [isLoadingFiles, setIsLoadingFiles] = useState(false);
	const [loadingFileCount, setLoadingFileCount] = useState(0);

	useEffect(() => {
		setApiSupported("showOpenFilePicker" in window);
	}, []);
	const dropRef = useRef<HTMLDivElement>(null);
	const [dragging, setDragging] = useState(false);

	const importFiles = useCallback(async () => {
		try {
			const handles = await (window as any).showOpenFilePicker({
				multiple: true,
			});
			const names = await Promise.all(handles.map((h: FileSystemFileHandle) => h.name));
			setLoadingFileCount(names.length);
			setIsLoadingFiles(true);
			try {
				await onAddFiles(names, handles);
			} finally {
				setIsLoadingFiles(false);
			}
		} catch {}
	}, [onAddFiles]);

	const importFolder = useCallback(async () => {
		try {
			const dirHandle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
			const rootFolderName = dirHandle.name;
			const names: string[] = [];
			const handles: FileSystemFileHandle[] = [];
			const paths: string[] = [];

			setLoadingFileCount(0);
			setIsLoadingFiles(true);

			try {
				async function walkDir(dir: FileSystemDirectoryHandle, prefix: string) {
					for await (const entry of (dir as any).values()) {
						if (entry.kind === "file") {
							names.push(entry.name);
							handles.push(entry);
							paths.push(prefix ? `${prefix}/${entry.name}` : entry.name);
						} else if (entry.kind === "directory") {
							await walkDir(entry, prefix ? `${prefix}/${entry.name}` : entry.name);
						}
					}
				}

				await walkDir(dirHandle, rootFolderName);
				setLoadingFileCount(names.length);
				await onAddFiles(names, handles, paths);
			} finally {
				setIsLoadingFiles(false);
			}
		} catch {}
	}, [onAddFiles]);

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			setDragging(false);

			// Try to get FileSystemFileHandle for actual rename operations
			const items = Array.from(e.dataTransfer.items);
			if (items.length === 0) return;

			setLoadingFileCount(0);
			setIsLoadingFiles(true);

			try {
				// Check if getAsFileSystemHandle is supported
				if (items[0].getAsFileSystemHandle) {
					const handles: FileSystemFileHandle[] = [];
					const names: string[] = [];
					const paths: string[] = [];

					// Helper function to recursively walk directories
					async function walkDirectory(dirHandle: FileSystemDirectoryHandle, prefix: string) {
						for await (const entry of (dirHandle as any).values()) {
							if (entry.kind === "file") {
								handles.push(entry);
								names.push(entry.name);
								paths.push(prefix ? `${prefix}/${entry.name}` : entry.name);
							} else if (entry.kind === "directory") {
								await walkDirectory(entry, prefix ? `${prefix}/${entry.name}` : entry.name);
							}
						}
					}

					// Process each dropped item
					for (const item of items) {
						const handle = await item.getAsFileSystemHandle?.();
						if (!handle) continue;

						if (handle.kind === "file") {
							// Single file
							handles.push(handle as FileSystemFileHandle);
							names.push(handle.name);
							paths.push(handle.name);
						} else if (handle.kind === "directory") {
							// Directory - recursively walk it
							const dirHandle = handle as FileSystemDirectoryHandle;
							const rootFolderName = dirHandle.name;
							await walkDirectory(dirHandle, rootFolderName);
						}
					}

					if (names.length > 0) {
						setLoadingFileCount(names.length);
						await onAddFiles(names, handles, paths);
						setIsLoadingFiles(false);
						return;
					}
				}
			} catch (error) {
				// Fallback to File API if getAsFileSystemHandle fails
				console.warn("Failed to get file handles, falling back to File API:", error);
			}

			// Fallback: use File API (preview only, cannot rename)
			const files = Array.from(e.dataTransfer.files);
			if (files.length > 0) {
				setLoadingFileCount(files.length);
				await onAddFiles(files.map((f) => f.name));
			}
			setIsLoadingFiles(false);
		},
		[onAddFiles],
	);

	const applySamples = useCallback(() => {
		const lines = sampleText
			.split("\n")
			.map((s) => s.trim())
			.filter(Boolean);

		const names: string[] = [];
		const relativePaths: string[] = [];

		for (const line of lines) {
			const normalized = line.replaceAll("\\", "/");
			const lastSlash = normalized.lastIndexOf("/");
			if (lastSlash >= 0) {
				const base = normalized.slice(lastSlash + 1);
				if (!base) continue;
				names.push(base);
				relativePaths.push(normalized);
			} else {
				names.push(normalized);
				relativePaths.push(normalized);
			}
		}

		if (names.length > 0) onAddFiles(names, undefined, relativePaths);
	}, [sampleText, onAddFiles]);

	const generateRandomSamples = useCallback(() => {
		const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
		const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
		const pad = (n: number, len: number) => String(n).padStart(len, "0");

		const roots = ["Photos", "Downloads", "Docs", "Music", "Videos", "Work"];
		const years = ["2022", "2023", "2024", "2025"];
		const months = Array.from({ length: 12 }, (_, i) => pad(i + 1, 2));
		const docNames = [
			"Report (Final)",
			"Meeting Notes",
			"Budget",
			"Proposal",
			"Invoice",
			"Resume",
			"Design Draft",
			"Plan",
		];
		const imageExts = ["jpg", "png", "webp"];
		const docExts = ["pdf", "docx", "xlsx", "pptx", "txt"];
		const musicExts = ["mp3", "flac", "m4a"];
		const videoExts = ["mp4", "mkv", "mov"];

		const total = rand(12, 24);
		const lines: string[] = [];

		for (let i = 0; i < total; i++) {
			const root = pick(roots);
			const year = pick(years);
			const month = pick(months);

			const kind = rand(1, 100);
			if (kind <= 45) {
				const ext = pick(imageExts);
				const idx = pad(rand(1, 9999), 4);
				lines.push(
					`${root}/${year}/${month}/IMG_${year}${month}${pad(rand(1, 28), 2)}_${idx}.${ext}`,
				);
			} else if (kind <= 75) {
				const ext = pick(docExts);
				const base = pick(docNames);
				const v = rand(1, 5);
				lines.push(`${root}/${year}/${base}_v${v}.${ext}`);
			} else if (kind <= 90) {
				const ext = pick(musicExts);
				const track = pad(rand(1, 20), 2);
				lines.push(
					`${root}/${pick(["Album A", "Album B", "Live"])}/${track} - ${pick(["Intro", "Theme", "Finale", "Bonus"])}` +
						`.${ext}`,
				);
			} else {
				const ext = pick(videoExts);
				lines.push(
					`${root}/${pick(["Season 01", "Season 02"])}/S${pad(rand(1, 2), 2)}E${pad(rand(1, 12), 2)} - ${pick(
						["Pilot", "The Return", "Final Cut", "Reunion"],
					)}.${ext}`,
				);
			}
		}

		setSampleText(lines.join("\n"));
	}, []);

	const selectedCount = filteredFiles.filter((f) => f.selected).length;
	const hasActiveFilter = filterConditions.length > 0;

	return (
		<div className="flex h-full flex-col border-r">
			{/* Panel Header + Import Buttons */}
			<div className="border-b bg-muted/20 px-3 py-3 flex items-center gap-2">
				<h2 className="text-sm font-medium text-foreground">{t("title")}</h2>
				<div className="ml-auto flex items-center gap-1">
					{apiSupported && (
						<>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={importFiles}>
										<FileUp className="h-3.5 w-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>{t("importFiles")}</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size="sm"
										variant="outline"
										className="h-7 w-7 p-0"
										onClick={importFolder}
									>
										<FolderOpen className="h-3.5 w-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>{t("importFolder")}</p>
								</TooltipContent>
							</Tooltip>
						</>
					)}
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								variant={sampleMode ? "default" : "outline"}
								className="h-7 w-7 p-0"
								onClick={() => setSampleMode(!sampleMode)}
							>
								<FlaskConical className="h-3.5 w-3.5" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{t("sampleMode")}</p>
						</TooltipContent>
					</Tooltip>
					{allFiles.length > 0 && onLoadMetadata && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="sm"
									variant={hasMetadata ? "default" : "outline"}
									className="h-7 w-7 p-0"
									onClick={onLoadMetadata}
									disabled={metadataProgress?.state === "loading"}
								>
									{metadataProgress?.state === "loading" ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Database className="h-3.5 w-3.5" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>
									{metadataProgress?.state === "loading"
										? `${t("loadingMetadata")} (${metadataProgress.current}/${metadataProgress.total})`
										: t("loadMetadata")}
								</p>
							</TooltipContent>
						</Tooltip>
					)}
					{allFiles.length > 0 && hasVideoFiles && onOpenScraper && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="sm"
									variant={hasScrapedData ? "default" : "outline"}
									className="h-7 w-7 p-0"
									onClick={onOpenScraper}
									disabled={scraperLoading}
								>
									{scraperLoading ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Clapperboard className="h-3.5 w-3.5" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{t("scrapeMedia")}</p>
							</TooltipContent>
						</Tooltip>
					)}
					{allFiles.length > 0 && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button size="sm" variant="ghost" onClick={onClear} className="h-7 w-7 p-0">
									<Trash2 className="h-3.5 w-3.5 text-destructive" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{t("clear")}</p>
							</TooltipContent>
						</Tooltip>
					)}
				</div>
			</div>

			{/* Sample Mode */}
			{sampleMode && (
				<div className="border-b px-3 py-2 space-y-2 animate-fade-in">
					<p className="text-xs text-muted-foreground">{t("sampleHint")}</p>
					<Textarea
						value={sampleText}
						onChange={(e) => setSampleText(e.target.value)}
						placeholder={t("samplePlaceholder")}
						className="text-xs min-h-[80px]"
					/>
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={generateRandomSamples}
							className="flex-1 text-xs"
						>
							{t("sampleGenerate")}
						</Button>
						<Button size="sm" onClick={applySamples} className="flex-1 text-xs">
							{t("importFiles")}
						</Button>
					</div>
				</div>
			)}

			{/* Drop Zone & File List */}
			<section
				ref={dropRef}
				aria-label={t("title")}
				className={`flex-1 min-h-0 flex flex-col transition-all duration-200 ${
					dragging ? "bg-primary/5 ring-2 ring-inset ring-primary/30" : ""
				}`}
				onDragOver={(e) => {
					e.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={handleDrop}
			>
				{/* Select All + Sort + Filter */}
				{allFiles.length > 0 && (
					<div className="px-3 py-1.5 border-b">
						<div className="flex items-center gap-2">
							{filteredFiles.length > 0 && (
								// biome-ignore lint/a11y/useSemanticElements: <explanation>
								<div
									role="button"
									tabIndex={0}
									className="inline-flex items-center gap-1.5 text-xs h-7 px-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
									onClick={() =>
										onSelectAll(
											selectedCount !== filteredFiles.length,
											filteredFiles.map((f) => f.id),
										)
									}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											onSelectAll(
												selectedCount !== filteredFiles.length,
												filteredFiles.map((f) => f.id),
											);
										}
									}}
								>
									<Checkbox
										checked={filteredFiles.length > 0 && selectedCount === filteredFiles.length}
										onCheckedChange={() => {}}
									/>
									{selectedCount === filteredFiles.length ? t("deselectAll") : t("selectAll")}
								</div>
							)}

							<div className="flex-1" />

							{hasActiveFilter && (
								<span className="text-xs text-muted-foreground mr-2">
									{filteredFiles.length}/{allFiles.length}
								</span>
							)}

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
										<ArrowDownAZ className="h-3.5 w-3.5" />
										{t("sort")}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-48">
									<DropdownMenuRadioGroup
										value={sortMode}
										onValueChange={(v) => onSortFiles(v as SortMode)}
									>
										<DropdownMenuRadioItem value="import">
											{t("sortByImport")}
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="name-asc">
											{t("sortByNameAsc")}
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="name-desc">
											{t("sortByNameDesc")}
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="ext-asc">
											{t("sortByExtAsc")}
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="ext-desc">
											{t("sortByExtDesc")}
										</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuContent>
							</DropdownMenu>

							<Popover open={filterOpen} onOpenChange={setFilterOpen}>
								<PopoverTrigger asChild>
									<Button
										size="sm"
										variant={hasActiveFilter ? "default" : "outline"}
										className="gap-1.5 text-xs h-7 relative"
									>
										<Filter className="h-3.5 w-3.5" />
										{t("filter")}
										{hasActiveFilter && (
											<Badge
												variant="secondary"
												className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
											>
												{filterConditions.length}
											</Badge>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent align="end" className="w-[600px]">
									<FilterPanel
										conditions={filterConditions}
										logic={filterLogic}
										onAddCondition={onAddFilterCondition}
										onUpdateCondition={onUpdateFilterCondition}
										onRemoveCondition={onRemoveFilterCondition}
										onSetLogic={onSetFilterLogic}
										onClearAll={onClearFilter}
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				)}

				{/* Loading State */}
				{isLoadingFiles ? (
					<div className="flex-1 flex items-center justify-center p-6">
						<div className="flex flex-col items-center gap-3 text-center">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<p className="text-sm text-muted-foreground">
								{loadingFileCount > 0
									? t("loadingFiles", { count: loadingFileCount })
									: t("scanningFiles")}
							</p>
						</div>
					</div>
				) : /* Empty State */
				allFiles.length === 0 ? (
					<div className="flex-1 flex items-center justify-center p-6">
						<div
							className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
								dragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
							}`}
						>
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
								<Upload className="h-6 w-6 text-primary" />
							</div>
							<p className="text-sm text-muted-foreground">
								{apiSupported ? t("dropHint") : t("noFiles")}
							</p>
							{apiSupported && (
								<div className="flex gap-2 mt-2">
									<Button
										size="sm"
										variant="outline"
										className="gap-1.5 text-xs"
										onClick={importFiles}
									>
										<FileUp className="h-3.5 w-3.5" /> {t("importFiles")}
									</Button>
									<Button
										size="sm"
										variant="outline"
										className="gap-1.5 text-xs"
										onClick={importFolder}
									>
										<FolderOpen className="h-3.5 w-3.5" /> {t("importFolder")}
									</Button>
								</div>
							)}
							<Button
								variant="link"
								size="sm"
								className="gap-1.5 text-xs text-muted-foreground mt-1"
								onClick={() => setSampleMode(true)}
							>
								<FlaskConical className="h-3.5 w-3.5" /> {t("trySampleMode")}
							</Button>
						</div>
					</div>
				) : (
					<ScrollArea className="flex-1">
						<div className="px-1 py-1">
							<FileTree files={filteredFiles} onToggle={onToggle} />
						</div>
					</ScrollArea>
				)}
			</section>

			{/* Status Bar */}
			<div className="border-t bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground flex justify-between">
				<span>
					{t("total")} {allFiles.length} {t("items")}
					{hasActiveFilter && (
						<span className="ml-1 text-primary">
							({t("filtered")} {filteredFiles.length})
						</span>
					)}
				</span>
				<span>
					{t("selected")} {selectedCount} {t("items")}
				</span>
			</div>
		</div>
	);
}
