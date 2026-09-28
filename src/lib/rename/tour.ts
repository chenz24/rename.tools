export const RENAME_TOUR_STORAGE_KEY = "rename-tools:tour:v1";

export type TourStep = 0 | 1 | 2 | 3 | 4;

export interface TourSnapshot {
	fileCount: number;
	ruleCount: number;
	hasChanges: boolean;
	computing: boolean;
}

// Advance on completed work, never on opening a picker or clicking an import button.
export function nextTourStep(step: TourStep, state: TourSnapshot, ruleEdited: boolean): TourStep {
	if (!state.fileCount) return 0;
	if (step === 0) return 1;
	if (state.computing) return step;
	if (step === 1 && ruleEdited && state.hasChanges) return 2;
	if (step > 1 && (!state.ruleCount || !state.hasChanges)) return 1;
	return step;
}
