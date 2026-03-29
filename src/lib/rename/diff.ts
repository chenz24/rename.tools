// Simple LCS-based character diff for filename comparison

export interface DiffSegment {
	type: "equal" | "added" | "removed";
	text: string;
}

/**
 * Fast diff for long strings using prefix/suffix matching.
 * Avoids O(m×n) LCS computation for very long filenames.
 */
function simpleDiff(oldStr: string, newStr: string): DiffSegment[] {
	// Find common prefix
	let prefixLen = 0;
	const minLen = Math.min(oldStr.length, newStr.length);
	while (prefixLen < minLen && oldStr[prefixLen] === newStr[prefixLen]) {
		prefixLen++;
	}

	// Find common suffix (after prefix)
	let suffixLen = 0;
	const oldRemaining = oldStr.length - prefixLen;
	const newRemaining = newStr.length - prefixLen;
	const maxSuffix = Math.min(oldRemaining, newRemaining);
	while (
		suffixLen < maxSuffix &&
		oldStr[oldStr.length - 1 - suffixLen] === newStr[newStr.length - 1 - suffixLen]
	) {
		suffixLen++;
	}

	const segments: DiffSegment[] = [];

	// Common prefix
	if (prefixLen > 0) {
		segments.push({ type: "equal", text: oldStr.slice(0, prefixLen) });
	}

	// Middle part (different)
	const oldMiddle = oldStr.slice(prefixLen, oldStr.length - suffixLen);
	const newMiddle = newStr.slice(prefixLen, newStr.length - suffixLen);

	if (oldMiddle) {
		segments.push({ type: "removed", text: oldMiddle });
	}
	if (newMiddle) {
		segments.push({ type: "added", text: newMiddle });
	}

	// Common suffix
	if (suffixLen > 0) {
		segments.push({ type: "equal", text: oldStr.slice(oldStr.length - suffixLen) });
	}

	return segments;
}

/**
 * Compute character-level diff between two strings using LCS.
 * Returns segments tagged as equal/added/removed.
 * For very long strings (>80 chars), uses a faster prefix/suffix algorithm.
 */
export function charDiff(oldStr: string, newStr: string): DiffSegment[] {
	if (oldStr === newStr) return [{ type: "equal", text: oldStr }];
	if (!oldStr) return [{ type: "added", text: newStr }];
	if (!newStr) return [{ type: "removed", text: oldStr }];

	const m = oldStr.length;
	const n = newStr.length;

	// Fast path for very long strings: use simple prefix/suffix matching
	// to avoid O(m×n) LCS computation (e.g., 100×100 = 10,000 operations)
	if (m > 80 || n > 80) {
		return simpleDiff(oldStr, newStr);
	}

	// Build LCS table
	const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			dp[i][j] =
				oldStr[i - 1] === newStr[j - 1]
					? dp[i - 1][j - 1] + 1
					: Math.max(dp[i - 1][j], dp[i][j - 1]);
		}
	}

	// Backtrack to get diff segments
	const raw: { type: "equal" | "added" | "removed"; char: string }[] = [];
	let i = m;
	let j = n;
	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && oldStr[i - 1] === newStr[j - 1]) {
			raw.push({ type: "equal", char: oldStr[i - 1] });
			i--;
			j--;
		} else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
			raw.push({ type: "added", char: newStr[j - 1] });
			j--;
		} else {
			raw.push({ type: "removed", char: oldStr[i - 1] });
			i--;
		}
	}
	raw.reverse();

	// Merge consecutive same-type segments
	const segments: DiffSegment[] = [];
	for (const r of raw) {
		const last = segments[segments.length - 1];
		if (last && last.type === r.type) {
			last.text += r.char;
		} else {
			segments.push({ type: r.type, text: r.char });
		}
	}

	return segments;
}
