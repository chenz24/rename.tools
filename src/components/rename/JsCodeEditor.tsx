"use client";

import {
	autocompletion,
	type Completion,
	type CompletionContext,
	closeBrackets,
	closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { type Diagnostic, linter } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView, highlightActiveLine, keymap, lineNumbers } from "@codemirror/view";
import { useEffect, useRef } from "react";

interface JsCodeEditorProps {
	value: string;
	onChange: (value: string) => void;
	onValidate?: (error: string | null) => void;
	placeholder?: string;
	className?: string;
	minHeight?: number;
	maxHeight?: number;
}

// Custom completions for rename context
const renameCompletions: Completion[] = [
	// Options object properties
	{
		label: "options",
		type: "variable",
		info: "The options object containing file info",
		detail: "object",
	},
	{
		label: "options.name",
		type: "property",
		info: "Filename without extension",
		detail: "string",
	},
	{
		label: "options.ext",
		type: "property",
		info: "File extension (without dot, e.g. 'jpg')",
		detail: "string",
	},
	{
		label: "options.fullName",
		type: "property",
		info: "Full filename with extension",
		detail: "string",
	},
	{
		label: "options.index",
		type: "property",
		info: "0-based index of the file",
		detail: "number",
	},
	{
		label: "options.size",
		type: "property",
		info: "File size in bytes",
		detail: "number | undefined",
	},
	{
		label: "options.modifiedTime",
		type: "property",
		info: "File last modified timestamp",
		detail: "number | undefined",
	},
	// Destructuring pattern
	{
		label: "const { name, ext, index } = options;",
		type: "text",
		info: "Destructure common options",
		detail: "pattern",
	},
	{
		label: "const { name, ext, fullName, index, size, modifiedTime } = options;",
		type: "text",
		info: "Destructure all options",
		detail: "pattern",
	},
	// Function template
	{
		label: "function rename(options) {\n  const { name } = options;\n  return name;\n}",
		type: "text",
		info: "Basic rename function template",
		detail: "template",
	},
	// Common string methods
	{
		label: "name.replace(",
		type: "method",
		info: "Replace part of the filename",
		detail: "(search, replace) => string",
	},
	{
		label: "name.slice(",
		type: "method",
		info: "Extract part of the filename",
		detail: "(start, end?) => string",
	},
	{
		label: "name.toLowerCase()",
		type: "method",
		info: "Convert to lowercase",
		detail: "() => string",
	},
	{
		label: "name.toUpperCase()",
		type: "method",
		info: "Convert to uppercase",
		detail: "() => string",
	},
	{
		label: "name.trim()",
		type: "method",
		info: "Remove whitespace from both ends",
		detail: "() => string",
	},
	{
		label: "name.split(",
		type: "method",
		info: "Split filename into array",
		detail: "(separator) => string[]",
	},
	{
		label: "name.match(",
		type: "method",
		info: "Match against regex pattern",
		detail: "(regex) => string[] | null",
	},
	{
		label: "name.padStart(",
		type: "method",
		info: "Pad the start of string",
		detail: "(length, char) => string",
	},
	// Common patterns
	{
		label: "String(index + 1).padStart(3, '0')",
		type: "text",
		info: "Format index as 001, 002, ...",
		detail: "pattern",
	},
	{
		label: "new Date().toISOString().slice(0, 10)",
		type: "text",
		info: "Current date as YYYY-MM-DD",
		detail: "pattern",
	},
	{
		label: "new Date(modifiedTime).toISOString().slice(0, 10)",
		type: "text",
		info: "File modified date as YYYY-MM-DD",
		detail: "pattern",
	},
];

function createCompletions(context: CompletionContext) {
	const word = context.matchBefore(/\w*/);
	if (!word || (word.from === word.to && !context.explicit)) {
		return null;
	}
	return {
		from: word.from,
		options: renameCompletions,
	};
}

// JavaScript syntax linter
function createJsLinter() {
	return linter((view) => {
		const diagnostics: Diagnostic[] = [];
		const code = view.state.doc.toString();

		try {
			new Function("name", "ext", "index", code);
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			// Try to extract line number from error
			const lineMatch = errorMsg.match(/line (\d+)/i);
			const line = lineMatch ? parseInt(lineMatch[1], 10) : 1;
			const lineStart = view.state.doc.line(Math.min(line, view.state.doc.lines)).from;

			diagnostics.push({
				from: lineStart,
				to: lineStart + 1,
				severity: "error",
				message: errorMsg,
			});
		}

		return diagnostics;
	});
}

// Light theme for CodeMirror
const lightTheme = EditorView.theme({
	"&": {
		fontSize: "12px",
		backgroundColor: "transparent",
	},
	".cm-content": {
		fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
		padding: "8px 0",
	},
	".cm-gutters": {
		backgroundColor: "hsl(var(--muted) / 0.3)",
		borderRight: "1px solid hsl(var(--border))",
		color: "hsl(var(--muted-foreground))",
	},
	".cm-activeLineGutter": {
		backgroundColor: "hsl(var(--muted) / 0.5)",
	},
	".cm-activeLine": {
		backgroundColor: "hsl(var(--muted) / 0.3)",
	},
	".cm-selectionBackground": {
		backgroundColor: "hsl(var(--primary) / 0.2) !important",
	},
	"&.cm-focused .cm-selectionBackground": {
		backgroundColor: "hsl(var(--primary) / 0.3) !important",
	},
	".cm-cursor": {
		borderLeftColor: "hsl(var(--foreground))",
	},
	// Autocomplete tooltip styles
	".cm-tooltip": {
		backgroundColor: "white",
		border: "1px solid #e5e7eb",
		borderRadius: "8px",
		boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
		overflow: "hidden",
	},
	".cm-tooltip.cm-tooltip-autocomplete": {
		backgroundColor: "white",
		"& > ul": {
			fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
			fontSize: "12px",
			maxHeight: "200px",
		},
		"& > ul > li": {
			padding: "6px 12px",
			borderBottom: "1px solid #f3f4f6",
			display: "flex",
			alignItems: "center",
		},
		"& > ul > li:last-child": {
			borderBottom: "none",
		},
		"& > ul > li[aria-selected]": {
			backgroundColor: "#f3f4f6",
			color: "#111827",
		},
	},
	".cm-completionLabel": {
		flex: "1",
	},
	".cm-completionDetail": {
		color: "#6b7280",
		fontSize: "11px",
		marginLeft: "8px",
	},
	".cm-completionIcon": {
		marginRight: "8px",
		opacity: "0.7",
	},
	".cm-diagnostic-error": {
		borderBottom: "2px solid hsl(var(--destructive))",
	},
	".cm-lintRange-error": {
		backgroundImage: "none",
		borderBottom: "2px wavy hsl(var(--destructive))",
	},
});

export function JsCodeEditor({
	value,
	onChange,
	onValidate,
	className = "",
	minHeight = 120,
	maxHeight = 300,
}: JsCodeEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const lastEmittedValue = useRef(value);
	const onChangeRef = useRef(onChange);
	const onValidateRef = useRef(onValidate);
	const initialValueRef = useRef(value);
	const minHeightRef = useRef(minHeight);
	const maxHeightRef = useRef(maxHeight);

	// Keep refs updated
	onChangeRef.current = onChange;
	onValidateRef.current = onValidate;

	// Initialize editor once — never re-create on value/prop changes
	useEffect(() => {
		if (!editorRef.current || viewRef.current) return;

		const state = EditorState.create({
			doc: initialValueRef.current,
			extensions: [
				lineNumbers(),
				highlightActiveLine(),
				history(),
				bracketMatching(),
				closeBrackets(),
				syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
				javascript(),
				autocompletion({
					override: [createCompletions],
					activateOnTyping: true,
				}),
				createJsLinter(),
				lightTheme,
				keymap.of([...defaultKeymap, ...historyKeymap, ...closeBracketsKeymap]),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						const newValue = update.state.doc.toString();
						lastEmittedValue.current = newValue;
						onChangeRef.current(newValue);

						// Validate the code
						if (onValidateRef.current) {
							try {
								new Function("name", "ext", "index", newValue);
								onValidateRef.current(null);
							} catch (e) {
								onValidateRef.current(e instanceof Error ? e.message : String(e));
							}
						}
					}
				}),
				EditorView.theme({
					"&": {
						minHeight: `${minHeightRef.current}px`,
						maxHeight: `${maxHeightRef.current}px`,
						border: "1px solid hsl(var(--border))",
						borderRadius: "6px",
					},
					".cm-scroller": {
						minHeight: `${minHeightRef.current}px`,
						maxHeight: `${maxHeightRef.current}px`,
						overflow: "auto",
					},
				}),
				EditorView.lineWrapping,
			],
		});

		const view = new EditorView({
			state,
			parent: editorRef.current,
		});

		viewRef.current = view;

		return () => {
			view.destroy();
			viewRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Sync external value changes to editor (only for truly external changes)
	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;

		// Skip if this value came from the editor itself
		if (value === lastEmittedValue.current) return;

		const currentValue = view.state.doc.toString();
		if (currentValue !== value) {
			lastEmittedValue.current = value;
			view.dispatch({
				changes: {
					from: 0,
					to: currentValue.length,
					insert: value,
				},
			});
		}
	}, [value]);

	return <div ref={editorRef} className={className} />;
}
