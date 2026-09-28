/**
 * Runs directly from the development HTML, before React can fail on stale chunks.
 * Keep this self-contained: a module import could itself come from the old cache.
 */
export const developmentServiceWorkerCleanup = `
(async () => {
  if (!("serviceWorker" in navigator)) return;
  const isOurWorker = (worker) => {
    if (!worker) return false;
    const url = new URL(worker.scriptURL);
    return url.origin === location.origin && url.pathname === "/sw.js";
  };
  try {
    const controlled = isOurWorker(navigator.serviceWorker.controller);
    const registrations = (await navigator.serviceWorker.getRegistrations()).filter(
      (registration) => registration.scope === location.origin + "/" &&
        [registration.active, registration.waiting, registration.installing].some(isOurWorker)
    );
    if (!controlled && registrations.length === 0) return;
    const removed = await Promise.all(registrations.map((registration) => registration.unregister()));
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name.startsWith("rename-tools-")).map((name) => caches.delete(name)));
    }
    // Unregistering doesn't release this document's controller until navigation.
    // The next document has no registration, so this does not create a reload loop.
    if (controlled && removed.every(Boolean)) location.reload();
  } catch (error) {
    console.warn("[SW] Development cache cleanup failed", error);
  }
})();
`;
