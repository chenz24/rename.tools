import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const GUIDE_LOCALES = new Set<string>(["en", "zh"]);

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const locale = getPathLocale(pathname);

	if (!locale) {
		return redirectToDefaultLocale(request);
	}

	if (!GUIDE_LOCALES.has(locale) && isGuidePath(pathname, locale)) {
		const url = request.nextUrl.clone();
		url.pathname = `/${routing.defaultLocale}${pathname.slice(locale.length + 1)}`;
		return NextResponse.redirect(url, 308);
	}

	return intlMiddleware(request);
}

function getPathLocale(pathname: string): string | undefined {
	return routing.locales.find(
		(locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
	);
}

function redirectToDefaultLocale(request: NextRequest): NextResponse {
	const url = request.nextUrl.clone();
	url.pathname = `/${routing.defaultLocale}${url.pathname === "/" ? "" : url.pathname}`;
	return NextResponse.redirect(url, 308);
}

function isGuidePath(pathname: string, locale: string): boolean {
	const pathWithoutLocale = pathname.slice(locale.length + 1);
	return pathWithoutLocale === "/guides" || pathWithoutLocale.startsWith("/guides/");
}

export const config = {
	matcher: ["/((?!api|_next|icon|apple-icon|.*\\..*).*)"],
};
