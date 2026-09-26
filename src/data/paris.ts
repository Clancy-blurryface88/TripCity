import type { ItineraryItem, TripBundle } from '@/domain/types';

/**
 * Realistic SAMPLE data for a Paris trip (Phase 1 mock).
 * Not real bookings. Replaced by SupabaseTripRepository once a backend is connected.
 * Times are written in local wall-clock time with the explicit UTC offset for that date
 * (Paris is UTC+2 and Israel is UTC+3 in April 2027) and stored as UTC.
 */
const paris = (date: string, time: string) => new Date(`${date}T${time}:00+02:00`).toISOString();
const israel = (date: string, time: string) => new Date(`${date}T${time}:00+03:00`).toISOString();

const TRIP_ID = 'trip-paris-2027';
const USER_ID = 'user-demo';

let order = 0;
const item = (p: Omit<ItineraryItem, 'tripId' | 'orderIndex' | 'source' | 'aiGenerated'> & Partial<Pick<ItineraryItem, 'source' | 'aiGenerated'>>): ItineraryItem => ({
  tripId: TRIP_ID,
  orderIndex: order++,
  source: 'user',
  aiGenerated: false,
  ...p,
});

export const parisTrip: TripBundle = {
  trip: {
    id: TRIP_ID,
    userId: USER_ID,
    name: 'פריז באביב',
    destination: 'Paris',
    country: 'FR',
    cityKey: 'paris',
    startDate: '2027-04-12',
    endDate: '2027-04-16',
    timezone: 'Europe/Paris',
    status: 'upcoming',
    createdAt: '2026-09-24T09:00:00Z',
    updatedAt: '2026-09-24T09:00:00Z',
  },
  flights: [
    {
      id: 'fl-out',
      tripId: TRIP_ID,
      airline: 'El Al',
      flightNumber: 'LY381',
      origin: 'TLV',
      originName: 'נתב״ג',
      destination: 'CDG',
      destinationName: 'שארל דה גול',
      departureAt: israel('2027-04-12', '10:30'),
      departureTimezone: 'Asia/Jerusalem',
      arrivalAt: paris('2027-04-12', '13:45'),
      arrivalTimezone: 'Europe/Paris',
      departureTerminal: '3',
      arrivalTerminal: '2',
      bookingReference: 'K7Q2LM',
    },
    {
      id: 'fl-back',
      tripId: TRIP_ID,
      airline: 'El Al',
      flightNumber: 'LY382',
      origin: 'CDG',
      originName: 'שארל דה גול',
      destination: 'TLV',
      destinationName: 'נתב״ג',
      departureAt: paris('2027-04-16', '16:40'),
      departureTimezone: 'Europe/Paris',
      arrivalAt: israel('2027-04-16', '21:35'),
      arrivalTimezone: 'Asia/Jerusalem',
      departureTerminal: '2',
      arrivalTerminal: '3',
      bookingReference: 'K7Q2LM',
    },
  ],
  hotels: [
    {
      id: 'ht-1',
      tripId: TRIP_ID,
      name: 'Hôtel Rue de Turenne',
      address: '12 Rue de Turenne, 75004 Paris',
      location: { lat: 48.8553, lng: 2.3645 },
      checkInAt: paris('2027-04-12', '15:00'),
      checkOutAt: paris('2027-04-16', '11:00'),
      bookingNumber: 'HB-48213',
      phone: '+33 1 00 00 00 00',
      notes: 'ארוחת בוקר כלולה',
    },
  ],
  activities: [
    { id: 'ac-eiffel', tripId: TRIP_ID, name: 'מגדל אייפל', address: 'Champ de Mars, 5 Av. Anatole France', location: { lat: 48.8584, lng: 2.2945 }, date: '2027-04-12', startAt: paris('2027-04-12', '18:00'), durationMinutes: 120, ticketStatus: 'purchased', status: 'confirmed', price: { amount: 36.1, currency: 'EUR' } },
    { id: 'ac-louvre', tripId: TRIP_ID, name: 'הלובר', address: 'Rue de Rivoli, 75001', location: { lat: 48.8606, lng: 2.3376 }, date: '2027-04-13', startAt: paris('2027-04-13', '10:00'), durationMinutes: 180, ticketStatus: 'purchased', status: 'confirmed' },
    { id: 'ac-cruise', tripId: TRIP_ID, name: 'שייט על הסיין', address: 'Port de la Bourdonnais', location: { lat: 48.8599, lng: 2.2932 }, date: '2027-04-13', startAt: paris('2027-04-13', '19:30'), durationMinutes: 60, ticketStatus: 'purchased', status: 'confirmed' },
    { id: 'ac-versailles', tripId: TRIP_ID, name: 'ארמון ורסאי', address: "Place d'Armes, Versailles", location: { lat: 48.8049, lng: 2.1204 }, date: '2027-04-14', startAt: paris('2027-04-14', '10:00'), durationMinutes: 330, ticketStatus: 'purchased', status: 'confirmed' },
    { id: 'ac-orsay', tripId: TRIP_ID, name: 'מוזיאון אורסיי', address: "Esplanade Valéry Giscard d'Estaing", location: { lat: 48.86, lng: 2.3266 }, date: '2027-04-14', startAt: paris('2027-04-14', '15:00'), durationMinutes: 150, ticketStatus: 'needed', status: 'planned' },
    { id: 'ac-chapelle', tripId: TRIP_ID, name: 'סנט-שאפל', address: '10 Bd du Palais', location: { lat: 48.8554, lng: 2.345 }, durationMinutes: 75, ticketStatus: 'needed', status: 'planned', openingHours: { open: '09:00', close: '19:00' } },
    { id: 'ac-arc', tripId: TRIP_ID, name: 'שער הניצחון', address: 'Place Charles de Gaulle', location: { lat: 48.8738, lng: 2.295 }, durationMinutes: 60, ticketStatus: 'needed', status: 'planned', openingHours: { open: '10:00', close: '23:00' } },
    { id: 'ac-rodin', tripId: TRIP_ID, name: 'מוזיאון רודן', address: '77 Rue de Varenne', location: { lat: 48.8553, lng: 2.3159 }, durationMinutes: 105, ticketStatus: 'needed', status: 'planned', openingHours: { open: '10:00', close: '18:30', closedWeekdays: [1] } },
    { id: 'ac-pompidou', tripId: TRIP_ID, name: 'מרכז פומפידו', address: 'Place Georges-Pompidou', location: { lat: 48.8606, lng: 2.3522 }, durationMinutes: 120, ticketStatus: 'needed', status: 'planned', openingHours: { open: '11:00', close: '21:00', closedWeekdays: [2] } },
    { id: 'ac-luxembourg', tripId: TRIP_ID, name: 'גני לוקסמבורג', address: 'Rue de Médicis', location: { lat: 48.8462, lng: 2.3372 }, durationMinutes: 60, ticketStatus: 'none', status: 'planned', openingHours: { open: '07:30', close: '20:30' } },
    { id: 'ac-canal', tripId: TRIP_ID, name: 'תעלת סן-מרטן', address: 'Quai de Valmy', location: { lat: 48.871, lng: 2.365 }, durationMinutes: 75, ticketStatus: 'none', status: 'planned' },
    { id: 'ac-montmartre', tripId: TRIP_ID, name: 'מונמארטר וסקרה-קר', address: 'Parvis du Sacré-Cœur', location: { lat: 48.8867, lng: 2.3431 }, date: '2027-04-15', startAt: paris('2027-04-15', '10:00'), durationMinutes: 150, ticketStatus: 'none', status: 'planned' },
  ],
  events: [
    { id: 'ev-dinner1', tripId: TRIP_ID, kind: 'restaurant', name: 'ארוחת ערב במארה', location: 'Le Marais', geo: { lat: 48.8575, lng: 2.359 }, startAt: paris('2027-04-12', '21:00'), durationMinutes: 90, bookingReference: 'R-2210' },
    { id: 'ev-olympia', tripId: TRIP_ID, kind: 'show', name: 'הופעה באולימפיה', location: "28 Bd des Capucines", geo: { lat: 48.8702, lng: 2.3283 }, startAt: paris('2027-04-14', '20:30'), durationMinutes: 150, bookingReference: 'OLY-5541' },
  ],
  transport: [
    { id: 'tr-rerb-in', tripId: TRIP_ID, mode: 'train', origin: 'CDG טרמינל 2', destination: 'Châtelet', departureAt: paris('2027-04-12', '14:30'), arrivalAt: paris('2027-04-12', '15:10'), operator: 'RER B' },
    { id: 'tr-rerc', tripId: TRIP_ID, mode: 'train', origin: 'Champ de Mars', destination: 'Versailles Château', departureAt: paris('2027-04-14', '09:00'), arrivalAt: paris('2027-04-14', '09:45'), operator: 'RER C' },
    { id: 'tx-dinner', tripId: TRIP_ID, mode: 'taxi', origin: 'Hôtel Rue de Turenne', destination: 'Le Marais', departureAt: paris('2027-04-12', '20:40'), arrivalAt: paris('2027-04-12', '20:55'), operator: 'G7' },
    { id: 'tx-olympia', tripId: TRIP_ID, mode: 'taxi', origin: 'Olympia', destination: 'Hôtel Rue de Turenne', departureAt: paris('2027-04-14', '23:10'), arrivalAt: paris('2027-04-14', '23:30'), operator: 'G7' },
    { id: 'tr-rerb-out', tripId: TRIP_ID, mode: 'train', origin: 'Châtelet', destination: 'CDG טרמינל 2', departureAt: paris('2027-04-16', '13:00'), arrivalAt: paris('2027-04-16', '13:45'), operator: 'RER B' },
  ],
  carRentals: [],
  insurance: [
    { id: 'in-1', tripId: TRIP_ID, provider: 'ביטוח נסיעות לחו״ל', policyNumber: 'TRV-2027-5531', coverageStart: '2027-04-12', coverageEnd: '2027-04-16', emergencyPhone: '+972 3 000 0000' },
  ],
  documents: [
    { id: 'doc-fl', tripId: TRIP_ID, userId: USER_ID, title: 'כרטיס טיסה LY381', mimeType: 'application/pdf', sizeBytes: 182000, storagePath: `${USER_ID}/${TRIP_ID}/doc-fl.pdf`, linkedType: 'flight', linkedId: 'fl-out', createdAt: '2026-09-24T09:00:00Z' },
    { id: 'doc-ht', tripId: TRIP_ID, userId: USER_ID, title: 'אישור הזמנת מלון', mimeType: 'application/pdf', sizeBytes: 96000, storagePath: `${USER_ID}/${TRIP_ID}/doc-ht.pdf`, linkedType: 'hotel_check_in', linkedId: 'ht-1', createdAt: '2026-09-24T09:00:00Z' },
    { id: 'doc-ef', tripId: TRIP_ID, userId: USER_ID, title: 'כרטיס מגדל אייפל', mimeType: 'image/png', sizeBytes: 240000, storagePath: `${USER_ID}/${TRIP_ID}/doc-ef.png`, linkedType: 'activity', linkedId: 'ac-eiffel', createdAt: '2026-09-24T09:00:00Z' },
  ],
  checklist: [
    ['documents', 'דרכון', true],
    ['documents', 'כרטיסי טיסה', true],
    ['documents', 'אישור מלון', true],
    ['documents', 'ביטוח נסיעות', true],
    ['clothes', 'חולצות', true],
    ['clothes', 'מכנסיים', true],
    ['clothes', 'נעלי הליכה', false],
    ['clothes', 'מעיל קל', false],
    ['electronics', 'טלפון ומטען', true],
    ['electronics', 'מתאם חשמל (Type E)', false],
    ['electronics', 'סוללה ניידת', true],
    ['health', 'תרופות קבועות', false],
  ].map(([category, label, done], i) => ({
    id: `ck-${i}`,
    tripId: TRIP_ID,
    category: category as 'documents',
    label: label as string,
    done: done as boolean,
    orderIndex: i,
  })),
  itinerary: [
    // Day 1 - Mon 12.04
    item({ id: 'it-1', date: '2027-04-12', startAt: paris('2027-04-12', '13:45'), endAt: paris('2027-04-12', '14:15'), itemType: 'flight', referenceId: 'fl-out', title: 'נחיתה בפריז', subtitle: 'LY381 · טרמינל 2', isLocked: true, travelToNext: { minutes: 10, mode: 'walk' } }),
    item({ id: 'it-2', date: '2027-04-12', startAt: paris('2027-04-12', '14:30'), endAt: paris('2027-04-12', '15:10'), itemType: 'transport', referenceId: 'tr-rerb-in', title: 'RER B לעיר', subtitle: 'CDG → Châtelet', isLocked: false, travelToNext: { minutes: 15, mode: 'walk' } }),
    item({ id: 'it-3', date: '2027-04-12', startAt: paris('2027-04-12', '15:30'), endAt: paris('2027-04-12', '16:00'), itemType: 'hotel_check_in', referenceId: 'ht-1', title: "צ'ק-אין במלון", subtitle: 'Hôtel Rue de Turenne', isLocked: true, travelToNext: { minutes: 35, mode: 'metro' } }),
    item({ id: 'it-4', date: '2027-04-12', startAt: paris('2027-04-12', '18:00'), endAt: paris('2027-04-12', '20:00'), itemType: 'activity', referenceId: 'ac-eiffel', title: 'מגדל אייפל', subtitle: 'כרטיסים הוזמנו', isLocked: true, travelToNext: { minutes: 30, mode: 'metro' } }),
    item({ id: 'it-5', date: '2027-04-12', startAt: paris('2027-04-12', '21:00'), endAt: paris('2027-04-12', '22:30'), itemType: 'event', referenceId: 'ev-dinner1', title: 'ארוחת ערב במארה', subtitle: 'הזמנה אושרה', isLocked: true }),
    // Day 2 - Tue 13.04
    item({ id: 'it-6', date: '2027-04-13', startAt: paris('2027-04-13', '10:00'), endAt: paris('2027-04-13', '13:00'), itemType: 'activity', referenceId: 'ac-louvre', title: 'הלובר', subtitle: 'כניסה בשעה קבועה', isLocked: true, travelToNext: { minutes: 10, mode: 'walk' } }),
    item({ id: 'it-7', date: '2027-04-13', startAt: paris('2027-04-13', '13:15'), endAt: paris('2027-04-13', '14:30'), itemType: 'free_time', title: 'צהריים בגני טווילרי', isLocked: false, travelToNext: { minutes: 20, mode: 'walk' } }),
    item({ id: 'it-8', date: '2027-04-13', startAt: paris('2027-04-13', '15:00'), endAt: paris('2027-04-13', '18:00'), itemType: 'free_time', title: 'סיבוב חופשי במארה', isLocked: false, travelToNext: { minutes: 35, mode: 'metro' } }),
    item({ id: 'it-9', date: '2027-04-13', startAt: paris('2027-04-13', '19:30'), endAt: paris('2027-04-13', '20:30'), itemType: 'activity', referenceId: 'ac-cruise', title: 'שייט על הסיין', subtitle: 'יציאה מ-Port de la Bourdonnais', isLocked: true }),
    // Day 3 - Wed 14.04 (contains a deliberate overlap to show conflict detection)
    item({ id: 'it-10', date: '2027-04-14', startAt: paris('2027-04-14', '09:00'), endAt: paris('2027-04-14', '09:45'), itemType: 'transport', referenceId: 'tr-rerc', title: 'RER C לוורסאי', isLocked: false, travelToNext: { minutes: 10, mode: 'walk' } }),
    item({ id: 'it-11', date: '2027-04-14', startAt: paris('2027-04-14', '10:00'), endAt: paris('2027-04-14', '15:30'), itemType: 'activity', referenceId: 'ac-versailles', title: 'ארמון ורסאי', subtitle: 'כרטיס לשעה 10:00', isLocked: true, travelToNext: { minutes: 50, mode: 'train' } }),
    item({ id: 'it-12', date: '2027-04-14', startAt: paris('2027-04-14', '15:00'), endAt: paris('2027-04-14', '17:30'), itemType: 'activity', referenceId: 'ac-orsay', title: 'מוזיאון אורסיי', subtitle: 'עוד אין כרטיס', isLocked: false, travelToNext: { minutes: 25, mode: 'metro' } }),
    item({ id: 'it-13', date: '2027-04-14', startAt: paris('2027-04-14', '20:30'), endAt: paris('2027-04-14', '23:00'), itemType: 'event', referenceId: 'ev-olympia', title: 'הופעה באולימפיה', subtitle: 'כרטיסים הוזמנו', isLocked: true }),
    // Day 4 - Thu 15.04
    item({ id: 'it-14', date: '2027-04-15', startAt: paris('2027-04-15', '10:00'), endAt: paris('2027-04-15', '12:30'), itemType: 'activity', referenceId: 'ac-montmartre', title: 'מונמארטר וסקרה-קר', isLocked: false, travelToNext: { minutes: 15, mode: 'walk' } }),
    item({ id: 'it-15', date: '2027-04-15', startAt: paris('2027-04-15', '13:00'), endAt: paris('2027-04-15', '14:00'), itemType: 'free_time', title: 'צהריים באבס', isLocked: false, travelToNext: { minutes: 25, mode: 'metro' } }),
    item({ id: 'it-16', date: '2027-04-15', startAt: paris('2027-04-15', '16:00'), endAt: paris('2027-04-15', '18:00'), itemType: 'free_time', title: 'גלרי לאפייט וגג התצפית', isLocked: false }),
    // Day 5 - Fri 16.04
    item({ id: 'it-17', date: '2027-04-16', startAt: paris('2027-04-16', '09:30'), endAt: paris('2027-04-16', '10:45'), itemType: 'free_time', title: 'ארוחת בוקר ואריזה', isLocked: false, travelToNext: { minutes: 5, mode: 'walk' } }),
    item({ id: 'it-18', date: '2027-04-16', startAt: paris('2027-04-16', '11:00'), endAt: paris('2027-04-16', '11:15'), itemType: 'hotel_check_out', referenceId: 'ht-1', title: "צ'ק-אאוט", subtitle: 'עד 11:00', isLocked: true, travelToNext: { minutes: 15, mode: 'walk' } }),
    item({ id: 'it-19', date: '2027-04-16', startAt: paris('2027-04-16', '13:00'), endAt: paris('2027-04-16', '13:45'), itemType: 'transport', referenceId: 'tr-rerb-out', title: 'RER B לשדה התעופה', isLocked: false, travelToNext: { minutes: 150, mode: 'walk' } }),
    item({ id: 'it-20', date: '2027-04-16', startAt: paris('2027-04-16', '16:40'), itemType: 'flight', referenceId: 'fl-back', title: 'טיסה הביתה', subtitle: 'LY382 · טרמינל 2', isLocked: true }),
  ],
};
