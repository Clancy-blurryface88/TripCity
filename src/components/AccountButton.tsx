import { useEffect, useRef, useState } from 'react';
import { avatarUrl, displayName, type AuthState } from '@/services/auth';
import { Cloud, CloudOff, LogOut, RefreshCw } from '@/ui/icons';

export type SyncState = 'local' | 'loading' | 'saving' | 'saved' | 'error';

const SYNC_TEXT: Record<SyncState, string> = {
  local: 'נשמר רק במכשיר הזה',
  loading: 'טוען את הטיול מהענן…',
  saving: 'שומר בענן…',
  saved: 'הכל שמור בענן',
  error: 'השמירה בענן נכשלה. ננסה שוב בשינוי הבא',
};

function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function AccountButton({ auth, sync }: { auth: AuthState; sync: SyncState }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  if (!auth.available || auth.loading) {
    return <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-brand to-cat-hotels shadow-soft" aria-hidden />;
  }

  if (!auth.user) {
    const signIn = async () => {
      setBusy(true);
      setErr(null);
      try {
        await auth.signInWithGoogle();
      } catch {
        setErr('ההתחברות נכשלה. נסה שוב');
        setBusy(false);
      }
    };
    return (
      <div className="relative shrink-0">
        <button type="button" onClick={signIn} disabled={busy} className="flex min-h-[40px] items-center gap-2 rounded-full bg-white px-3 text-xs font-bold text-ink shadow-soft disabled:opacity-60">
          <GoogleG />
          {busy ? 'מתחבר…' : 'התחברות'}
        </button>
        {err && <p className="absolute start-0 top-12 z-40 w-max rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-soft">{err}</p>}
      </div>
    );
  }

  const user = auth.user;
  const name = displayName(user);
  const photo = avatarUrl(user);
  const SyncIcon = sync === 'error' ? CloudOff : sync === 'saving' || sync === 'loading' ? RefreshCw : Cloud;

  return (
    <div ref={ref} className="relative shrink-0">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`החשבון של ${name}`} className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand to-cat-hotels text-sm font-bold text-white shadow-soft">
        {photo ? <img src={photo} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : name.charAt(0)}
        <span className={`absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${sync === 'error' ? 'bg-rose-500' : sync === 'saved' ? 'bg-emerald-500' : 'bg-amber-400'}`} aria-hidden />
      </button>
      {open && (
        <div className="absolute start-0 top-12 z-40 w-64 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-slate-100">
          <p className="truncate text-sm font-extrabold text-ink">{name}</p>
          {user.email && (
            <p className="truncate text-xs text-ink-soft" dir="ltr">
              {user.email}
            </p>
          )}
          <p className={`mt-2 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold ${sync === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'}`}>
            <SyncIcon size={14} aria-hidden className={sync === 'saving' || sync === 'loading' ? 'animate-spin' : ''} />
            {SYNC_TEXT[sync]}
          </p>
          <button type="button" onClick={() => auth.signOut().then(() => setOpen(false))} className="mt-2 flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm font-bold text-ink">
            <LogOut size={16} aria-hidden /> התנתקות
          </button>
        </div>
      )}
    </div>
  );
}
