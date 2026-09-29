import { useState } from 'react';
import { boardImage } from '@/city/boardImages';
import type { AuthState } from '@/services/auth';
import { GoogleG } from './AccountButton';
import { Plane, BedDouble, CalendarDays, FileText } from '@/ui/icons';

const FEATURES = [
  { Icon: Plane, text: 'טיסות' },
  { Icon: BedDouble, text: 'מלונות' },
  { Icon: CalendarDays, text: 'מסלול יומי' },
  { Icon: FileText, text: 'מסמכים' },
];

/** First screen for signed-out users: the trip is saved to their Google account from the start. */
export function LoginScreen({ auth }: { auth: AuthState }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const bg = boardImage('paris').url;

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
    <div className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden bg-[#eaf3ff] lg:items-center lg:justify-center">
      <img src={bg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-top lg:blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#eaf3ff] via-[#eaf3ff]/60 to-transparent lg:bg-[#eaf3ff]/40" aria-hidden />

      <main className="relative mx-4 mb-[max(1.5rem,env(safe-area-inset-bottom))] rounded-4xl bg-white/95 p-6 shadow-soft backdrop-blur lg:mb-0 lg:w-full lg:max-w-md">
        <h1 className="text-3xl font-extrabold leading-tight text-ink">עיר חופשה</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">כל הטיול שלך בעיר אחת. מעלים כרטיס טיסה, והעיר של היעד נבנית סביב הטיול.</p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {FEATURES.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
              <Icon size={14} aria-hidden /> {text}
            </li>
          ))}
        </ul>

        <button type="button" onClick={signIn} disabled={busy} className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-base font-bold text-ink shadow-sm transition active:scale-[0.99] disabled:opacity-60">
          <GoogleG />
          {busy ? 'מתחבר…' : 'המשך עם Google'}
        </button>
        {err && <p className="mt-2 text-center text-sm font-semibold text-rose-600">{err}</p>}

        <p className="mt-4 text-center text-[11px] leading-relaxed text-ink-faint">הטיול נשמר בחשבון שלך ומסונכרן בין הטלפון למחשב.</p>
      </main>
    </div>
  );
}
