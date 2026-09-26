import { he } from '@/i18n/he';
import { Building2, FileText, Settings } from '@/ui/icons';

export type NavTab = 'city' | 'documents' | 'settings';
export function BottomNav({ badge, active = 'city', onChange }: { badge?: number; active?: NavTab; onChange?: (t: NavTab) => void }) {
  const items = [
    { id: 'city', label: he.nav.city, Icon: Building2, active: active === 'city' },
    { id: 'documents', label: he.nav.documents, Icon: FileText, active: active === 'documents', badge },
    { id: 'settings', label: he.nav.settings, Icon: Settings, active: active === 'settings' },
  ];
  return (
    <nav aria-label="ניווט ראשי" className="border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-lg justify-around">
        {items.map(({ id, label, Icon, active, badge: b }) => (
          <li key={id}>
            <button
              className={`relative flex min-h-[56px] min-w-[72px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${active ? 'text-brand' : 'text-ink-faint'}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => onChange?.(id as NavTab)}
            >
              <Icon size={21} aria-hidden />
              {label}
              {b ? <span className="absolute right-4 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-cat-attractions px-1 text-[9px] text-white">{b}</span> : null}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
