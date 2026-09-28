"use client";

import type { Driver } from "driver.js";
import { CircleHelp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { useRenameStore } from "@/hooks/useRenameStore";
import { nextTourStep, RENAME_TOUR_STORAGE_KEY, type TourStep } from "@/lib/rename/tour";
import "driver.js/dist/driver.css";
import "./rename-tour.css";

const OPEN_LAYER = ["dialog", "alert-dialog", "dropdown-menu", "select", "popover"]
	.map((name) => `[data-slot="${name}-content"][data-state="open"]`)
	.join(",");

function hasOpenLayer() {
	return !!document.querySelector(OPEN_LAYER);
}

export function RenameTour() {
	const t = useTranslations("rename.tour");
	const [active, setActive] = useState(false);
	const [step, setStep] = useState<TourStep>(0);
	const [instance, setInstance] = useState<Driver | null>(null);
	const [suspended, setSuspended] = useState(false);
	const trigger = useRef<HTMLButtonElement>(null);
	const stepRef = useRef<TourStep>(0);
	const ruleEdited = useRef(false);
	const { files, rules, preview, isPreviewComputing, isExecuting } = useRenameStore(
		useShallow((state) => ({
			files: state.files,
			rules: state.rules,
			preview: state.preview,
			isPreviewComputing: state.isPreviewComputing,
			isExecuting: state.isExecuting,
		})),
	);
	const hasChanges = preview.some((row) => row.hasChange);
	const hasConflicts = preview.some((row) => row.conflict);
	const canPreview = hasChanges && !isPreviewComputing;
	const changedIds = new Set(preview.filter((row) => row.hasChange).map((row) => row.fileId));
	const previewOnly = !files.some((file) => changedIds.has(file.id) && file.handle);

	const moveTo = useCallback((next: TourStep) => {
		ruleEdited.current = false;
		stepRef.current = next;
		setStep(next);
	}, []);

	const finish = useCallback(() => {
		setActive(false);
		try {
			localStorage.setItem(RENAME_TOUR_STORAGE_KEY, "seen");
		} catch {
			/* Optional preference. */
		}
	}, []);

	const start = useCallback(() => {
		if (useRenameStore.getState().isExecuting) return;
		moveTo(useRenameStore.getState().files.length ? 1 : 0);
		setSuspended(hasOpenLayer());
		setActive(true);
	}, [moveTo]);

	useEffect(() => {
		// Shared presets have their own first-run review. Do not cover that dialog.
		const params = new URLSearchParams(window.location.search);
		if (params.has("preset") || params.has("recipe")) return;
		try {
			if (localStorage.getItem(RENAME_TOUR_STORAGE_KEY)) return;
		} catch {
			return;
		}
		const timer = window.setTimeout(() => {
			try {
				if (localStorage.getItem(RENAME_TOUR_STORAGE_KEY)) return;
			} catch {
				return;
			}
			const state = useRenameStore.getState();
			if (!state.files.length && !state.rules.length && !hasOpenLayer()) start();
		}, 700);
		return () => window.clearTimeout(timer);
	}, [start]);

	useEffect(() => {
		if (!active) return;
		let cancelled = false;
		let tour: Driver | undefined;
		import("driver.js")
			.then(({ driver }) => {
				if (cancelled) return;
				tour = driver({
					animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
					duration: 220,
					overlayColor: "#0f172a",
					overlayOpacity: 0.24,
					stagePadding: 5,
					stageRadius: 10,
					popoverOffset: 14,
					popoverClass: "rename-tour",
					allowKeyboardControl: false,
					disableActiveInteraction: false,
					onDestroyStarted: finish,
				});
				setInstance(tour);
			})
			.catch(() => {
				if (!cancelled) {
					setActive(false);
					toast.error(t("loadError"));
				}
			});
		return () => {
			cancelled = true;
			tour?.destroy();
			setInstance(null);
		};
	}, [active, finish, t]);

	useEffect(() => {
		if (!active) return;
		let previous = useRenameStore.getState();
		let blurTimer: ReturnType<typeof setTimeout> | undefined;
		const update = () => {
			const state = useRenameStore.getState();
			if (
				stepRef.current === 1 &&
				(previous.rules !== state.rules || previous.extensionScope !== state.extensionScope)
			)
				ruleEdited.current = true;
			previous = state;
			// Let users finish typing before moving the spotlight away from their input.
			const typing = document.activeElement?.matches("input, textarea, [contenteditable=true]");
			const next = nextTourStep(
				stepRef.current,
				{
					fileCount: state.files.length,
					ruleCount: state.rules.length,
					hasChanges: state.preview.some((row) => row.hasChange),
					computing: state.isPreviewComputing,
				},
				ruleEdited.current && !typing,
			);
			if (next !== stepRef.current) {
				moveTo(next);
			}
		};
		const unsubscribe = useRenameStore.subscribe(update);
		const onBlur = () => {
			clearTimeout(blurTimer);
			blurTimer = setTimeout(update, 0);
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !hasOpenLayer()) {
				event.preventDefault();
				event.stopPropagation();
				finish();
				trigger.current?.focus();
			}
		};
		const onClick = (event: MouseEvent) => {
			if (
				event.target instanceof Element &&
				event.target.closest('[data-tour="execute"]') &&
				event.target.closest("button:not(:disabled)") &&
				useRenameStore.getState().preview.some((row) => row.hasChange)
			)
				finish();
		};
		const observer = new MutationObserver(() => setSuspended(hasOpenLayer()));
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["data-state"],
		});
		document.addEventListener("focusout", onBlur);
		// Check for an open menu before Radix handles Escape and closes it.
		document.addEventListener("keydown", onKey, true);
		document.addEventListener("click", onClick, true);
		return () => {
			unsubscribe();
			observer.disconnect();
			clearTimeout(blurTimer);
			document.removeEventListener("focusout", onBlur);
			document.removeEventListener("keydown", onKey, true);
			document.removeEventListener("click", onClick, true);
		};
	}, [active, finish, moveTo]);

	const noRules = rules.length === 0;
	const canDemo = files.length === 0 && noRules;
	useEffect(() => {
		if (!instance || !active) return;
		if (suspended || isExecuting) {
			instance.destroy();
			return;
		}
		const target =
			step === 0
				? "files"
				: step === 1
					? "rules"
					: step === 2
						? "preview"
						: previewOnly
							? "files"
							: "execute";
		const element = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
		if (!element) return;
		const focusedInput =
			document.activeElement instanceof HTMLElement &&
			element.contains(document.activeElement) &&
			document.activeElement.matches("input, textarea, [contenteditable=true]")
				? document.activeElement
				: null;
		const titleKey = [
			"importTitle",
			"rulesTitle",
			"previewTitle",
			previewOnly ? "demoDoneTitle" : "executeTitle",
		][step];
		const bodyKey =
			step === 0
				? "importBody"
				: step === 1
					? noRules
						? "addRuleBody"
						: "editRuleBody"
					: step === 2
						? hasConflicts
							? "conflictBody"
							: "previewBody"
						: previewOnly
							? "demoDoneBody"
							: "executeBody";
		const nextLabel =
			step === 0
				? "tryDemo"
				: step === 1
					? noRules
						? "addNumbering"
						: "seePreview"
					: step === 2
						? hasConflicts
							? "editRules"
							: "next"
						: "done";
		const nextDisabled = step === 0 ? !canDemo : step === 1 ? !noRules && !canPreview : false;
		instance.highlight({
			element,
			popover: {
				title: t(titleKey),
				description: t(bodyKey),
				side: step === 3 && !previewOnly ? "top" : step === 2 ? "left" : "right",
				align: "start",
				showButtons: step === 0 && !canDemo ? ["previous", "close"] : ["previous", "next", "close"],
				disableButtons: nextDisabled ? ["next"] : [],
				showProgress: true,
				progressText: `${step + 1} / 4`,
				prevBtnText: t("skip"),
				nextBtnText: t(nextLabel),
				onPrevClick: finish,
				onCloseClick: finish,
				onNextClick: () => {
					if (nextDisabled) return;
					if (step === 0) void useRenameStore.getState().loadDemo();
					else if (step === 1 && noRules) useRenameStore.getState().addRule("sequence");
					else if (step === 1) moveTo(2);
					else if (step === 2) moveTo(hasConflicts ? 1 : 3);
					else {
						finish();
						trigger.current?.focus();
					}
				},
				onPopoverRender: (popover) => {
					popover.closeButton.setAttribute("aria-label", t("skip"));
					// Updating preview availability should not steal focus mid-edit.
					if (focusedInput) {
						queueMicrotask(() => {
							if (focusedInput.isConnected && popover.wrapper.contains(document.activeElement)) {
								focusedInput.focus({ preventScroll: true });
							}
						});
					}
				},
			},
		});
		const resize = new ResizeObserver(() => instance.refresh());
		resize.observe(element);
		return () => resize.disconnect();
	}, [
		instance,
		active,
		suspended,
		isExecuting,
		step,
		previewOnly,
		noRules,
		canDemo,
		canPreview,
		hasConflicts,
		t,
		finish,
		moveTo,
	]);

	return (
		<Button
			ref={trigger}
			variant="ghost"
			size="sm"
			onClick={start}
			disabled={isExecuting}
			className="h-8 gap-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100"
			aria-label={t("start")}
		>
			<CircleHelp className="size-4" />
			<span className="hidden sm:inline">{t("start")}</span>
		</Button>
	);
}
