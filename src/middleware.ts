import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const locale = getPathLocale(pathname);

	if (!locale) {
		return redirectToDefaultLocale(request);
	}

	// Keep previously crawled metadata image URLs working without runtime image rendering.
	if (pathname === `/${locale}/opengraph-image`) {
		const url = request.nextUrl.clone();
		url.pathname = "/opengraph-image.png";
		url.search = "";
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

export const config = {
	matcher: ["/((?!api|_next|icon|apple-icon|.*\\..*).*)"],
};
