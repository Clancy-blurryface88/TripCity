/** Registers /sw.js in production and signals when a new version is waiting. */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        const announce = () => reg.waiting && navigator.serviceWorker.controller && window.dispatchEvent(new Event('tripcity:update'));
        announce();
        reg.addEventListener('updatefound', () => reg.installing?.addEventListener('statechange', announce));
      })
      .catch(() => undefined);
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  });
}
