"use client";

import { create } from "zustand";

interface DraftSession {
	baseCode: string;
	baseError: string | null;
	draftCode: string;
	draftError: string | null;
}

interface CustomJsDraftState {
	sessions: Record<string, DraftSession>;
	startSession: (ruleId: string, code: string, error?: string) => void;
	setDraftCode: (ruleId: string, code: string) => void;
	setDraftError: (ruleId: string, error: string | null) => void;
	confirmSession: (ruleId: string) => { code: string; lastError?: string } | null;
	cancelSession: (ruleId: string) => void;
	clearSession: (ruleId: string) => void;
}

export const useCustomJsDraftStore = create<CustomJsDraftState>((set, get) => ({
	sessions: {},
	startSession: (ruleId, code, error) => {
		set((state) => ({
			sessions: {
				...state.sessions,
				[ruleId]: {
					baseCode: code,
					baseError: error ?? null,
					draftCode: code,
					draftError: error ?? null,
				},
			},
		}));
	},
	setDraftCode: (ruleId, code) => {
		set((state) => {
			const session = state.sessions[ruleId];
			if (!session) return state;
			return {
				sessions: {
					...state.sessions,
					[ruleId]: {
						...session,
						draftCode: code,
					},
				},
			};
		});
	},
	setDraftError: (ruleId, error) => {
		set((state) => {
			const session = state.sessions[ruleId];
			if (!session) return state;
			return {
				sessions: {
					...state.sessions,
					[ruleId]: {
						...session,
						draftError: error,
					},
				},
			};
		});
	},
	confirmSession: (ruleId) => {
		const session = get().sessions[ruleId];
		if (!session) return null;
		return {
			code: session.draftCode,
			lastError: session.draftError || undefined,
		};
	},
	cancelSession: (_ruleId) => {
		// No-op: session data is discarded by clearSession
	},
	clearSession: (ruleId) => {
		set((state) => {
			if (!(ruleId in state.sessions)) return state;
			const next = { ...state.sessions };
			delete next[ruleId];
			return { sessions: next };
		});
	},
}));
