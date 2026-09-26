import type { Reminder } from '@/domain/reminders';

export type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function permission(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as PermissionState;
}

export async function requestPermission(): Promise<PermissionState> {
  if (permission() === 'unsupported') return 'unsupported';
  try {
    return (await Notification.requestPermission()) as PermissionState;
  } catch {
    return permission();
  }
}

/**
 * Show a system notification. Android Chrome only allows notifications through a service worker,
 * so prefer registration.showNotification and fall back to the constructor on desktop.
 * Returns false when the platform refuses, so the caller can show an in-app banner instead.
 */
export async function showSystem(r: Pick<Reminder, 'id' | 'title' | 'body'>): Promise<boolean> {
  if (permission() !== 'granted') return false;
  const opts: NotificationOptions = { body: r.body, tag: r.id, icon: '/icon-192.png', badge: '/icon-192.png', lang: 'he', dir: 'rtl' };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(r.title, opts);
      return true;
    }
    new Notification(r.title, opts);
    return true;
  } catch {
    return false;
  }
}
