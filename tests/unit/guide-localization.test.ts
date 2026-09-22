import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { getAllGuides, getGuideBySlug, guides } from "@/lib/guides/content";
import { guideIndexCopy } from "@/lib/guides/copy";
import { GUIDE_LOCALES, getGuideLanguages } from "@/lib/guides/locales";
import { guideRecipes } from "@/lib/guides/recipes";
import { SITE_URL } from "@/lib/site";

const entries = sitemap();
const variables = (value: unknown) =>
	[...new Set(JSON.stringify(value).match(/\{[a-z][a-z.]*\}/g) ?? [])].sort();

describe.each(GUIDE_LOCALES)("%s guide publishing", (locale) => {
	it("has complete translated prose and preserves the executable examples", () => {
		const localized = getAllGuides(locale);
		expect(localized).toHaveLength(guides.length);
		for (const [i, guide] of localized.entries()) {
			const source = guides[i].content.en;
			expect(guide.locale).toBe(locale);
			expect(guide.sections).toHaveLength(source.sections.length);
			expect(variables(guide.sections)).toEqual(variables(source.sections));
			if (locale !== "en") {
				for (const key of ["title", "description", "intro"] as const) {
					expect(guide[key]).not.toBe(source[key]);
					expect(guide[key].trim().length).toBeGreaterThan(0);
				}
			}
			for (const [sectionIndex, section] of guide.sections.entries()) {
				const original = source.sections[sectionIndex];
				expect(section.body.length).toBeGreaterThan(0);
				// Existing Chinese prose has its own paragraph structure.
				if (locale !== "zh") {
					expect(section.body).toHaveLength(original.body.length);
					expect(section.steps?.length).toBe(original.steps?.length);
				}
				expect(section.examples?.map(({ before, after }) => ({ before, after })))
					.toEqual(original.examples?.map(({ before, after }) => ({ before, after })));
				if (locale !== "en") {
					expect(section.title).not.toBe(original.title);
					for (const text of [...section.body, ...(section.steps ?? [])]) {
						expect(text.trim().length).toBeGreaterThan(0);
						expect([...original.body, ...(original.steps ?? [])]).not.toContain(text);
					}
					for (const [exampleIndex, example] of (section.examples ?? []).entries()) {
						if (original.examples?.[exampleIndex].note) {
							expect(example.note).toBeTruthy();
							expect(example.note).not.toBe(original.examples[exampleIndex].note);
						}
					}
					if (section.image) {
						expect(section.image.alt).not.toBe(original.image?.alt);
						expect(section.image.caption).not.toBe(original.image?.caption);
					}
				}
			}
		}
	});

	it("publishes reciprocal language URLs and translated modification dates", () => {
		for (const suffix of ["", ...guides.map((g) => `/${g.slug}`)]) {
			const path = `/guides${suffix}`;
			const entry = entries.find((e) => e.url === `${SITE_URL}/${locale}${path}`);
			expect(entry).toBeDefined();
			expect(entry?.alternates?.languages).toEqual(getGuideLanguages(path));
			for (const alternate of Object.values(entry!.alternates!.languages!)) {
				expect(entries.some((e) => e.url === alternate)).toBe(true);
			}
			if (locale !== "en" && locale !== "zh") {
				expect(entry?.lastModified).toEqual(new Date("2026-09-22"));
			}
		}
	});

	it("localizes directory controls and the recipes used by the app", () => {
		for (const [key, text] of Object.entries(guideIndexCopy[locale])) {
			expect(text.trim()).not.toBe("");
			if (locale !== "en" && key !== "eyebrow") expect(text).not.toBe(guideIndexCopy.en[key as keyof typeof guideIndexCopy.en]);
		}
		for (const recipe of guideRecipes) {
			expect(getGuideBySlug(recipe.guideSlug, locale)?.locale).toBe(locale);
			expect(recipe.name[locale]).toBeTruthy();
			expect(recipe.note[locale]).toBeTruthy();
			if (locale !== "en") {
				expect(recipe.name[locale]).not.toBe(recipe.name.en);
				expect(recipe.note[locale]).not.toBe(recipe.note.en);
			}
		}
	});
});

it("keeps canonical sitemap URLs unique and rejects unknown guides", () => {
	expect(entries).toHaveLength(105);
	expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
	for (const locale of GUIDE_LOCALES) expect(getGuideBySlug("missing-guide", locale)).toBeUndefined();
});
