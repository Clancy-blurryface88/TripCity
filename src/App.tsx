import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CategoryId, TripBundle } from '@/domain/types';
import { summarize } from '@/domain/progress';
import { CATEGORY_ORDER } from '@/domain/categories';
import { he } from '@/i18n/he';
import { CityBoard } from '@/city/CityBoard';
import type { TransportTab } from '@/city/hotspots';
import { CityPicker } from '@/components/CityPicker';
import type { CityKey } from '@/domain/types';
import { CITIES } from '@/domain/cities';
import { TopBar } from '@/components/TopBar';
import { ModeToggle, type Mode } from '@/components/ModeToggle';
import { BottomNav, type NavTab } from '@/components/BottomNav';
import { DocumentsView } from '@/components/DocumentsView';
import { AddDocument, type AddMethod, type SaveResult } from '@/components/AddDocument';
import { addFromDocument } from '@/domain/addFromDocument';
import { AiFab } from '@/components/AiFab';
import { BottomSheet } from '@/components/BottomSheet';
import { CategoryDetail } from '@/components/CategoryDetail';
import { ItineraryView } from '@/components/ItineraryView';
import { TripProgress } from '@/components/TripProgress';
import { AiPlannerSheet } from '@/components/AiPlannerSheet';
import { useMediaQuery } from '@/ui/useMediaQuery';
import { AnimatePresence, motion } from '@/ui/motion';
import { MockTripRepository } from '@/services/mockRepository';
import type { TripRepository } from '@/services/ports';
import type { ChecklistItem } from '@/domain/types';
import { DEFAULT_PREFS, type NotificationPrefs } from '@/domain/reminders';
import { load, loadRaw, save } from '@/services/localStore';
import { SettingsView } from '@/components/SettingsView';
import { OfflineBar, Toast, type ToastMsg } from '@/components/Toast';
import { useReminderScheduler } from '@/pwa/useReminderScheduler';
import { usePwa } from '@/pwa/usePwa';
import { useAuth } from '@/services/auth';
import { loadCloudTrip, saveCloudTrip } from '@/services/cloudStore';
import { AccountButton, type SyncState } from '@/components/AccountButton';


function readParams() {
  const p = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const sheet = p.get('sheet') as CategoryId | null;
  return {
    mode: (p.get('mode') === 'itinerary' ? 'itinerary' : 'map') as Mode,
    sheet: sheet && CATEGORY_ORDER.includes(sheet) ? sheet : null,
    day: Math.max(1, Number(p.get('day') ?? 1) || 1),
    ai: p.get('ai') === '1',
    city: (p.get('city') as CityKey | null) ?? null,
    nav: (p.get('nav') === 'documents' ? 'documents' : p.get('nav') === 'settings' ? 'settings' : 'city') as NavTab,
    add: p.get('add') as AddMethod | 'choose' | null,
    tab: (p.get('tab') === 'taxi' ? 'taxi' : p.get('tab') === 'train' ? 'train' : undefined) as TransportTab | undefined,
  };
}

const defaultRepository = new MockTripRepository();

export function App({ repository = defaultRepository, tripId = 'trip-paris-2027' }: { repository?: TripRepository; tripId?: string }) {
  const [bundle, setBundle] = useState<TripBundle | null>(null);
  const initial = useMemo(readParams, []);
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [selected, setSelected] = useState<CategoryId | null>(initial.sheet);
  const [day, setDay] = useState(initial.day);
  const [aiOpen, setAiOpen] = useState(initial.ai);
  const [tab, setTab] = useState<TransportTab | undefined>(initial.tab);
  const [cityOverride, setCityOverride] = useState<CityKey | null>(
    initial.city && (initial.city === 'generic' || CITIES.some((c) => c.key === initial.city)) ? initial.city : null,
  );
  const [nav, setNav] = useState<NavTab>(initial.nav);
  const [adding, setAdding] = useState<AddMethod | 'choose' | null>(initial.add);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [prefs, setPrefsState] = useState<NotificationPrefs>(() => {
    const p = load<NotificationPrefs>('prefs', DEFAULT_PREFS);
    return { ...p, kinds: { ...DEFAULT_PREFS.kinds, ...p.kinds } };
  });
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const { online } = usePwa();
  const setPrefs = useCallback((p: NotificationPrefs) => {
    setPrefsState(p);
    save('prefs', p);
  }, []);
  const showToast = useCallback((title: string, body: string) => setToast({ id: String(Date.now()), title, body }), []);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);
  const onChecklist = useCallback((checklist: ChecklistItem[]) => setBundle((b) => (b ? { ...b, checklist } : b)), []);

  // Persistence: the whole trip is kept on this device, and in the cloud once the user signs in with Google.
  const auth = useAuth();
  const userId = auth.user?.id ?? null;
  const loaded = bundle !== null;
  const [sync, setSync] = useState<SyncState>('local');
  const bundleRef = useRef(bundle);
  bundleRef.current = bundle;
  const cloudUser = useRef<string | null>(null); // user whose cloud copy has been loaded
  const skipCloudSave = useRef(false);

  useEffect(() => {
    if (bundle) save(`bundle:${tripId}`, bundle);
  }, [bundle, tripId]);

  useEffect(() => {
    cloudUser.current = null;
    if (!userId || !loaded) {
      setSync('local');
      return;
    }
    let alive = true;
    setSync('loading');
    loadCloudTrip(userId, tripId)
      .then(async (remote) => {
        if (!alive) return;
        if (remote?.trip) {
          skipCloudSave.current = true;
          setBundle(remote);
        } else if (bundleRef.current) {
          await saveCloudTrip(userId, tripId, bundleRef.current);
        }
        if (!alive) return;
        cloudUser.current = userId;
        setSync('saved');
      })
      .catch(() => alive && setSync('error'));
    return () => {
      alive = false;
    };
  }, [userId, loaded, tripId]);

  useEffect(() => {
    if (!bundle || !userId || cloudUser.current !== userId) return;
    if (skipCloudSave.current) {
      skipCloudSave.current = false;
      return;
    }
    setSync('saving');
    const t = window.setTimeout(() => {
      saveCloudTrip(userId, tripId, bundle).then(
        () => setSync('saved'),
        () => setSync('error'),
      );
    }, 800);
    return () => window.clearTimeout(t);
  }, [bundle, userId, tripId]);

  const account = <AccountButton auth={auth} sync={sync} />;
  const desktop = useMediaQuery('(min-width: 1024px)');
  const startAdd = useCallback((m: AddMethod | 'choose' = 'choose') => {
    setSelected(null);
    setAdding(m);
  }, []);
  const onSave = useCallback((r: SaveResult) => {
    setBundle((b) => {
      if (!b) return b;
      const next = addFromDocument(b, r.extraction, r.file);
      const newDoc = next.documents[next.documents.length - 1];
      setFresh((f) => new Set(f).add(newDoc.id));
      return next;
    });
    if (r.city) setCityOverride(r.city);
  }, []);
  const closeAdd = useCallback(() => setAdding(null), []);
  const onItems = useCallback((itinerary: TripBundle['itinerary']) => setBundle((b) => (b ? { ...b, itinerary } : b)), []);

  useEffect(() => {
    let alive = true;
    repository.getTrip(tripId).then((b) => {
      if (!alive || !b) return;
      const local = loadRaw<TripBundle>(`bundle:${tripId}`);
      if (local?.trip) return setBundle(local);
      const saved = loadRaw<ChecklistItem[]>(`checklist:${b.trip.id}`); // pre-0.7 storage
      setBundle(Array.isArray(saved) ? { ...b, checklist: saved } : b);
    });
    return () => {
      alive = false;
    };
  }, [repository, tripId]);

  const summary = useMemo(() => (bundle ? summarize(bundle) : null), [bundle]);
  const counts = useMemo(() => {
    const c = {} as Record<CategoryId, number>;
    for (const id of CATEGORY_ORDER) c[id] = summary?.[id].count ?? 0;
    return c;
  }, [summary]);
  const onSelect = useCallback((id: CategoryId, t?: TransportTab) => {
    setTab(t);
    setSelected(id);
  }, []);
  const closeSheet = useCallback(() => setSelected(null), []);
  const openDocs = useCallback(() => {
    setSelected(null);
    setNav('documents');
  }, []);
  const closeAi = useCallback(() => setAiOpen(false), []);
  const onAiDone = useCallback(() => {
    setAiOpen(false);
    setNav('city');
    setMode('itinerary');
  }, []);
  const onDoneAdd = useCallback(() => {
    setAdding(null);
    setNav('city');
    setMode('map');
  }, []);

  useReminderScheduler(bundle, prefs, (r) => showToast(r.title, r.body));

  if (!bundle || !summary) {
    return <div className="grid min-h-[100dvh] place-items-center text-ink-soft">טוען את העיר…</div>;
  }

  const city = cityOverride ?? bundle.trip.cityKey;
  const scene = (
    <>
      <CityBoard city={city} counts={counts} selected={selected} onSelect={onSelect} insetTop={desktop ? 0 : 118} />
      <div className={desktop ? 'absolute left-4 top-4' : 'absolute left-3 top-[84px]'}>
        <CityPicker value={city} onChange={setCityOverride} />
      </div>
    </>
  );

  if (desktop) {
    return (
      <div className="flex h-[100dvh] flex-col bg-[#eef4fb]">
        <div className="flex items-center justify-between pe-4">
          <TopBar trip={bundle.trip} account={account} />
          <ModeToggle mode={mode} onChange={setMode} />
        </div>
        <main className="grid min-h-0 flex-1 grid-cols-[3fr_2fr] gap-4 px-4 pb-4">
          <section className="relative overflow-hidden rounded-4xl shadow-soft" aria-label="מפת הטיול">
            {scene}
            <div className="absolute bottom-4 left-4">
              <AiFab onClick={() => setAiOpen(true)} />
            </div>
            <span className="absolute right-4 top-4 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-ink-soft">{he.sample}</span>
          </section>
          <aside className="min-h-0 overflow-y-auto rounded-4xl bg-white/70 p-4 shadow-soft">
            <AnimatePresence mode="wait">
              <motion.div key={selected ?? mode} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }}>
                {selected ? (
                  <div className="rounded-3xl bg-white p-4">
                    <button onClick={closeSheet} className="mb-3 text-xs font-semibold text-brand">
                      → חזרה
                    </button>
                    <CategoryDetail id={selected} bundle={bundle} count={counts[selected]} tab={tab} city={city} onAdd={startAdd} onChecklist={onChecklist} onOpenDocs={openDocs} />
                  </div>
                ) : mode === 'itinerary' ? (
                  <div className="-mx-4">
                    <ItineraryView bundle={bundle} day={day} onDay={setDay} onItems={onItems} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <TripProgress summary={summary} onSelect={onSelect} />
                    <div className="-mx-4">
                      <ItineraryView bundle={bundle} day={day} onDay={setDay} onItems={onItems} />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </aside>
        </main>
        <BottomSheet open={adding !== null} onClose={closeAdd} title="הוספת מסמך">
          {adding !== null && <AddDocument key={String(adding)} initial={adding} onSave={onSave} onDone={onDoneAdd} />}
        </BottomSheet>
        <BottomSheet open={aiOpen} onClose={closeAi} title={he.ai.title}>
          <AiPlannerSheet key={String(aiOpen)} bundle={bundle} onApply={onItems} onDone={onAiDone} city={city} />
        </BottomSheet>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#eaf3ff]">
      <div className="sticky top-0 z-30 bg-gradient-to-b from-[#eaf3ff] via-[#eaf3ff]/90 to-transparent">
        <OfflineBar online={online} />
        <TopBar trip={bundle.trip} account={account} />
      </div>
      <Toast msg={toast} onClose={() => setToast(null)} />
      {nav === 'documents' ? (
        <main className="flex-1">
          <DocumentsView bundle={bundle} onAdd={() => startAdd()} fresh={fresh} city={city} />
        </main>
      ) : nav === 'settings' ? (
        <main className="flex-1">
          <SettingsView city={city} bundle={bundle} prefs={prefs} onPrefs={setPrefs} onTest={showToast} />
        </main>
      ) : mode === 'map' ? (
        <main className="relative -mt-16 h-[calc(100dvh-56px)] min-h-[520px] overflow-hidden" aria-label="מפת הטיול" style={{ touchAction: 'manipulation' }}>
          {scene}
          <span className="absolute bottom-[86px] right-3 rounded-full bg-white/75 px-2 py-0.5 text-[10px] font-semibold text-ink-soft">{he.sample}</span>
        </main>
      ) : (
        <main className="flex-1 pb-28 pt-2">
          <ItineraryView bundle={bundle} day={day} onDay={setDay} onItems={onItems} city={city} />
        </main>
      )}
      {nav === 'city' && <div className="pointer-events-none fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 flex items-center justify-between px-4">
        <div className="pointer-events-auto">
          <ModeToggle mode={mode} onChange={setMode} />
        </div>
        <div className="pointer-events-auto">
          <AiFab onClick={() => setAiOpen(true)} compact />
        </div>
      </div>}
      <div className="fixed inset-x-0 bottom-0 z-30">
        <BottomNav badge={bundle.documents.length} active={nav} onChange={setNav} />
      </div>
      <BottomSheet open={selected !== null} onClose={closeSheet} title={selected ? he.categories[selected] : ''}>
        {selected && <CategoryDetail id={selected} bundle={bundle} count={counts[selected]} tab={tab} city={city} onAdd={startAdd} onChecklist={onChecklist} onOpenDocs={openDocs} />}
      </BottomSheet>
      <BottomSheet open={adding !== null} onClose={closeAdd} title="הוספת מסמך">
        {adding !== null && <AddDocument key={String(adding)} initial={adding} onSave={onSave} onDone={onDoneAdd} />}
      </BottomSheet>
      <BottomSheet open={aiOpen} onClose={closeAi} title={he.ai.title}>
        <AiPlannerSheet key={String(aiOpen)} bundle={bundle} onApply={onItems} onDone={onAiDone} city={city} />
      </BottomSheet>
    </div>
  );
}
