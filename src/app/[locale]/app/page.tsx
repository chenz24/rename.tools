"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Suspense, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { FilePanel } from "@/components/rename/FilePanel";
import { IntelligentSuggestions } from "@/components/rename/IntelligentSuggestions";
import { PresetLinkDialog } from "@/components/rename/PresetLinkDialog";
import { PreviewPanel } from "@/components/rename/PreviewPanel";
import { RenameHeader } from "@/components/rename/RenameHeader";
import { RulePanel } from "@/components/rename/RulePanel";
import { TaskMeasurement } from "@/components/rename/TaskMeasurement";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useMediaScraper } from "@/hooks/useMediaScraper";
import { useMetadataLoader } from "@/hooks/useMetadataLoader";
import { usePresetsStore } from "@/hooks/usePresetsStore";
import { useRenameStore } from "@/hooks/useRenameStore";
import { useTmdbConfig } from "@/hooks/useTmdbConfig";
import { getGuidanceState } from "@/lib/rename/guidance";

const MediaScraperDialog = dynamic(() =>
	import("@/components/rename/MediaScraperDialog").then((m) => m.MediaScraperDialog),
);

const TmdbApiKeyDialog = dynamic(() =>
	import("@/components/rename/TmdbApiKeyDialog").then((m) => m.TmdbApiKeyDialog),
);

const VIDEO_EXTS = new Set([".mp4", ".mov", ".avi", ".mkv", ".wmv", ".flv", ".webm", ".m4v"]);

export default function RenameAppPage() {
	const tPresets = useTranslations("rename.presets");

	// ── Selector-based subscriptions for granular re-renders ──
	const {
		files,
		filteredFiles,
		addFiles,
		clearFiles,
		toggleFileSelection,
		selectAll,
		sortFiles,
		sortMode,
		filter,
		addFilterCondition,
		updateFilterCondition,
		removeFilterCondition,
		setFilterLogic,
		clearFilter,
		updateFileMetadata,
		hasMetadata,
	} = useRenameStore(
		useShallow((s) => ({
			files: s.files,
			filteredFiles: s.filteredFiles,
			addFiles: s.addFiles,
			clearFiles: s.clearFiles,
			toggleFileSelection: s.toggleFileSelection,
			selectAll: s.selectAll,
			sortFiles: s.sortFiles,
			sortMode: s.sortMode,
			filter: s.filter,
			addFilterCondition: s.addFilterCondition,
			updateFilterCondition: s.updateFilterCondition,
			removeFilterCondition: s.removeFilterCondition,
			setFilterLogic: s.setFilterLogic,
			clearFilter: s.clearFilter,
			updateFileMetadata: s.updateFileMetadata,
			hasMetadata: s.hasMetadata,
		})),
	);

	const {
		rules,
		extensionScope,
		addRule,
		addRulesFromTemplate,
		updateRule,
		removeRule,
		reorderRules,
		cloneRule,
		setExtensionScope,
		clearRules,
	} = useRenameStore(
		useShallow((s) => ({
			rules: s.rules,
			extensionScope: s.extensionScope,
			addRule: s.addRule,
			addRulesFromTemplate: s.addRulesFromTemplate,
			updateRule: s.updateRule,
			removeRule: s.removeRule,
			reorderRules: s.reorderRules,
			cloneRule: s.cloneRule,
			setExtensionScope: s.setExtensionScope,
			clearRules: s.clearRules,
		})),
	);

	const {
		preview,
		isPreviewComputing,
		applyAutoFix,
		resetAutoFix,
		hasAutoFix,
		executionLog,
		executionProgress,
		isExecuting,
		needsUserActivation,
		clearExecutionLog,
		confirmUserActivation,
		execute,
		undo,
		redo,
		canUndo,
		canRedo,
	} = useRenameStore(
		useShallow((s) => ({
			preview: s.preview,
			isPreviewComputing: s.isPreviewComputing,
			applyAutoFix: s.applyAutoFix,
			resetAutoFix: s.resetAutoFix,
			hasAutoFix: s.hasAutoFix,
			executionLog: s.executionLog,
			executionProgress: s.executionProgress,
			isExecuting: s.isExecuting,
			needsUserActivation: s.needsUserActivation,
			clearExecutionLog: s.clearExecutionLog,
			confirmUserActivation: s.confirmUserActivation,
			execute: s.execute,
			undo: s.undo,
			redo: s.redo,
			canUndo: s.canUndo,
			canRedo: s.canRedo,
		})),
	);

	const savePreset = usePresetsStore((state) => state.savePreset);
	const metadataLoader = useMetadataLoader();
	const tmdbConfig = useTmdbConfig();
	const scraper = useMediaScraper();

	const [scraperOpen, setScraperOpen] = useState(false);
	const [scraperLoaded, setScraperLoaded] = useState(false);
	const [apiKeyDialogLoaded, setApiKeyDialogLoaded] = useState(false);
	const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);

	const hasVideoFiles = useMemo(
		() => files.some((f) => VIDEO_EXTS.has(f.extension.toLowerCase())),
		[files],
	);

	const handleOpenScraper = useCallback(() => {
		if (!tmdbConfig.isConfigured) {
			setApiKeyDialogLoaded(true);
			setApiKeyDialogOpen(true);
		} else {
			setScraperLoaded(true);
			setScraperOpen(true);
		}
	}, [tmdbConfig.isConfigured]);

	const handleApiKeySaved = useCallback(
		async (key: string) => {
			const valid = await tmdbConfig.saveApiKey(key);
			if (valid) {
				setApiKeyDialogOpen(false);
				setScraperLoaded(true);
				setScraperOpen(true);
			}
			return valid;
		},
		[tmdbConfig.saveApiKey],
	);

	const guidanceState = getGuidanceState({
		files,
		selectedCount: filteredFiles.filter((file) => file.selected).length,
		rules,
		preview,
		isExecuting,
		isPreviewComputing,
	});
	const isDemo = files.some((file) => file.isDemo);

	return (
		<div className="flex h-screen flex-col bg-background">
			<RenameHeader />
			<Suspense fallback={null}>
				<PresetLinkDialog />
				<TaskMeasurement />
			</Suspense>
			<ResizablePanelGroup orientation="horizontal" className="flex-1 min-h-0">
				<ResizablePanel defaultSize={20} minSize={12}>
					<FilePanel
						allFiles={files}
						onTryDemo={
							files.length === 0 && rules.length === 0
								? useRenameStore.getState().loadDemo
								: undefined
						}
						isDemo={isDemo}
						filteredFiles={filteredFiles}
						onAddFiles={addFiles}
						onToggle={toggleFileSelection}
						onSelectAll={selectAll}
						onClear={clearFiles}
						onSortFiles={sortFiles}
						sortMode={sortMode}
						filterConditions={filter.conditions}
						filterLogic={filter.logic}
						onAddFilterCondition={addFilterCondition}
						onUpdateFilterCondition={updateFilterCondition}
						onRemoveFilterCondition={removeFilterCondition}
						onSetFilterLogic={setFilterLogic}
						onClearFilter={clearFilter}
						onLoadMetadata={() => metadataLoader.loadMetadata(files, updateFileMetadata)}
						metadataProgress={metadataLoader.progress}
						hasMetadata={hasMetadata}
						onOpenScraper={handleOpenScraper}
						scraperLoading={scraper.state === "searching"}
						hasScrapedData={scraper.matchResults.length > 0}
						hasVideoFiles={hasVideoFiles}
					/>
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel defaultSize={25} minSize={15}>
					<div className="flex h-full flex-col">
						{!isDemo && (
							<IntelligentSuggestions
								files={filteredFiles}
								onApplySuggestion={addRulesFromTemplate}
								onOpenScraper={handleOpenScraper}
							/>
						)}
						<div className="flex-1 min-h-0">
							<RulePanel
								rules={rules}
								extensionScope={extensionScope}
								onAddRule={addRule}
								onAddRulesFromTemplate={addRulesFromTemplate}
								onUpdateRule={updateRule}
								onRemoveRule={removeRule}
								onReorderRules={reorderRules}
								onCloneRule={cloneRule}
								onSetExtensionScope={setExtensionScope}
								onClearRules={clearRules}
								onSavePreset={(name, options) => {
									const _presetId = savePreset(
										name,
										rules.filter((r) => r.enabled).map((r) => r.ruleConfig),
										{ ...options, extensionScope },
									);
									toast.success(tPresets("saveSuccess"), {
										description: tPresets("saveSuccessDesc", { name }),
									});
								}}
								hasMetadata={hasMetadata}
							/>
						</div>
					</div>
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel defaultSize={55} minSize={20}>
					<PreviewPanel
						preview={preview}
						guidanceState={guidanceState}
						isPreviewComputing={isPreviewComputing}
						applyAutoFix={applyAutoFix}
						resetAutoFix={resetAutoFix}
						hasAutoFix={hasAutoFix}
						log={executionLog}
						progress={executionProgress}
						isExecuting={isExecuting}
						needsUserActivation={needsUserActivation}
						onClearLog={clearExecutionLog}
						onConfirmActivation={confirmUserActivation}
						onExecute={execute}
						onUndo={undo}
						onRedo={redo}
						canUndo={canUndo}
						canRedo={canRedo}
					/>
				</ResizablePanel>
			</ResizablePanelGroup>

			{/* Media Scraper Dialogs */}
			{apiKeyDialogLoaded && (
				<TmdbApiKeyDialog
					open={apiKeyDialogOpen}
					onOpenChange={setApiKeyDialogOpen}
					onSave={handleApiKeySaved}
					isValidating={tmdbConfig.isValidating}
				/>
			)}
			{scraperLoaded && tmdbConfig.apiKey && (
				<MediaScraperDialog
					open={scraperOpen}
					onOpenChange={setScraperOpen}
					files={filteredFiles}
					scraper={scraper}
					apiKey={tmdbConfig.apiKey}
					onApplyResults={addRulesFromTemplate}
				/>
			)}
		</div>
	);
}
