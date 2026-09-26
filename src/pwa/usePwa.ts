import { useEffect, useState } from 'react';

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallState = 'installed' | 'available' | 'ios' | 'unavailable';

function detect(): InstallState {
  if (typeof window === 'undefined') return 'unavailable';
  if (window.matchMedia?.('(display-mode: standalone)').matches) return 'installed';
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return 'ios';
  return 'unavailable';
}

let deferred: InstallEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    window.dispatchEvent(new Event('tripcity:installable'));
  });
}

export function usePwa() {
  const [install, setInstall] = useState<InstallState>(() => (deferred ? 'available' : detect()));
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false));
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    const onInstallable = () => setInstall('available');
    const onInstalled = () => setInstall('installed');
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    const onUpdate = () => setUpdate(true);
    window.addEventListener('tripcity:installable', onInstallable);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    window.addEventListener('tripcity:update', onUpdate);
    return () => {
      window.removeEventListener('tripcity:installable', onInstallable);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      window.removeEventListener('tripcity:update', onUpdate);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    setInstall(outcome === 'accepted' ? 'installed' : detect());
    return outcome === 'accepted';
  };
  const applyUpdate = () => {
    navigator.serviceWorker?.getRegistration().then((r) => r?.waiting?.postMessage('skip-waiting'));
  };
  return { install, online, update, promptInstall, applyUpdate };
}
