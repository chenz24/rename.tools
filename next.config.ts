import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
	deploymentId: process.env.NEXT_DEPLOYMENT_ID,
	reactCompiler: true,
	turbopack: {
		root: process.cwd(),
	},
};

export default withNextIntl(nextConfig);
