import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
	// Pages are prerendered at build time and refreshed on deployment, without ISR.
	// Read those results from ASSETS instead of rendering them again in the Worker.
	incrementalCache: staticAssetsIncrementalCache,
	enableCacheInterception: true,
});
