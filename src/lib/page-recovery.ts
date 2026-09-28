/** Small, dependency-free copy shared by the pre-hydration fallback and error UI. */
export const recoveryCopy = {
	en: {
		title: "The page couldn't load",
		description:
			"Try again, or repair the site's cached files. Saved presets and settings are kept; unsaved work may be lost when you reload.",
		retry: "Try again",
		repair: "Repair and reload",
		slow: "Taking longer than expected? You can repair and reload the page.",
	},
	zh: {
		title: "页面未能正常加载",
		description:
			"可以先重试，或修复本站缓存后重新加载。已保存的预设和设置会保留；重新加载可能丢失当前未保存的操作。",
		retry: "重试",
		repair: "修复并重新加载",
		slow: "页面加载时间较长，可以尝试修复并重新加载。",
	},
	ja: {
		title: "ページを読み込めませんでした",
		description:
			"再試行するか、キャッシュを修復してください。保存済みの設定とプリセットは保持されます。未保存の作業は失われる場合があります。",
		retry: "再試行",
		repair: "修復して再読み込み",
		slow: "読み込みに時間がかかっています。修復して再読み込みできます。",
	},
	ko: {
		title: "페이지를 불러오지 못했습니다",
		description:
			"다시 시도하거나 캐시를 복구하세요. 저장된 설정과 프리셋은 유지되지만 저장하지 않은 작업은 사라질 수 있습니다.",
		retry: "다시 시도",
		repair: "복구 후 새로고침",
		slow: "로딩이 지연되고 있습니다. 복구 후 새로고침할 수 있습니다.",
	},
	es: {
		title: "No se pudo cargar la página",
		description:
			"Inténtalo de nuevo o repara la caché. Los ajustes y preajustes guardados se conservan; el trabajo sin guardar puede perderse al recargar.",
		retry: "Reintentar",
		repair: "Reparar y recargar",
		slow: "La carga tarda más de lo esperado. Puedes reparar y recargar la página.",
	},
	fr: {
		title: "Impossible de charger la page",
		description:
			"Réessayez ou réparez le cache. Les réglages et préréglages enregistrés sont conservés ; le travail non enregistré peut être perdu.",
		retry: "Réessayer",
		repair: "Réparer et recharger",
		slow: "Le chargement prend du temps. Vous pouvez réparer et recharger la page.",
	},
	de: {
		title: "Die Seite konnte nicht geladen werden",
		description:
			"Versuche es erneut oder repariere den Cache. Gespeicherte Einstellungen und Vorlagen bleiben erhalten; ungespeicherte Arbeit kann beim Neuladen verloren gehen.",
		retry: "Erneut versuchen",
		repair: "Reparieren und neu laden",
		slow: "Das Laden dauert länger als erwartet. Du kannst die Seite reparieren und neu laden.",
	},
};

export function getRecoveryCopy(locale: string) {
	return recoveryCopy[locale as keyof typeof recoveryCopy] || recoveryCopy.en;
}

export function repairHref(path: string) {
	return `/repair.html?returnTo=${encodeURIComponent(path)}`;
}

// Inline in <head>: no React, imports, CSS files, storage, or network dependencies.
// Never refresh automatically: an error must not discard a user's rename session.
export function pageRecoveryBootstrap(locale: string) {
	const copy = JSON.stringify(getRecoveryCopy(locale)).replaceAll("<", "\\u003c");
	return `(() => {
if (window.__renameRecoveryInstalled) return;
window.__renameRecoveryInstalled = true;
const copy = ${copy};
let pending = false;
function show(slow) {
  if (!document.body) {
    if (!pending) { pending = true; document.addEventListener('DOMContentLoaded', () => { pending = false; show(slow); }, { once: true }); }
    return;
  }
  const existing = document.getElementById('rename-recovery');
  if (existing) { if (!slow) existing.dataset.slow = 'false'; return; }
  const box = document.createElement('aside');
  box.id = 'rename-recovery';
  box.dataset.slow = String(slow);
  box.setAttribute('role', 'alert');
  box.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:560px;margin:auto;padding:20px;background:#fff;color:#172033;border:1px solid #94a3b8;border-radius:12px;box-shadow:0 4px 24px #0003;z-index:2147483647;font:15px/1.6 system-ui';
  const title = document.createElement('strong');
  title.textContent = slow ? copy.slow : copy.title;
  const p = document.createElement('p');
  p.textContent = copy.description;
  const link = document.createElement('a');
  link.textContent = copy.repair;
  link.href = '/repair.html?returnTo=' + encodeURIComponent(location.pathname + location.search + location.hash);
  link.style.cssText = 'display:inline-block;padding:8px 16px;background:#1d4ed8;color:white;border-radius:6px;text-decoration:none';
  box.append(title, p, link);
  document.body.appendChild(box);
}
function isChunkError(value) {
  return /ChunkLoadError|Loading (?:CSS )?chunk|Failed to (?:fetch dynamically imported module|load chunk)|Importing a module script failed|module factory is not available/i.test(String(value && (value.message || value)));
}
window.addEventListener('error', (event) => {
  const target = event.target;
  const source = target && (target.src || target.href) || event.filename || '';
  let appAsset = false;
  try { const url = new URL(source, location.href); appAsset = url.origin === location.origin && url.pathname.startsWith('/_next/static/'); } catch {}
  if (appAsset || isChunkError(event.error || event.message)) show(false);
}, true);
window.addEventListener('unhandledrejection', (event) => { if (isChunkError(event.reason)) show(false); });
window.addEventListener('rename:ready', () => {
  window.__renameReady = true;
  const box = document.getElementById('rename-recovery');
  if (box && box.dataset.slow === 'true') box.remove();
});
setTimeout(() => {
  if (!window.__renameReady) {
    show(true);
  }
}, 20000);
})();`;
}
