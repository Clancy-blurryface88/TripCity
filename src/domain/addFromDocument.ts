import type { Extraction } from '@/ai/extract';
import type { CityKey, DocumentMime, TripBundle } from './types';
import { resolveCityKey } from './cities';
import { zonedToIso } from './time';

const CITY_TZ: Partial<Record<CityKey, string>> = {
  paris: 'Europe/Paris', rome: 'Europe/Rome', london: 'Europe/London', amsterdam: 'Europe/Amsterdam', madrid: 'Europe/Madrid',
  lisbon: 'Europe/Lisbon', berlin: 'Europe/Berlin', vienna: 'Europe/Vienna', prague: 'Europe/Prague', budapest: 'Europe/Budapest',
  athens: 'Europe/Athens', dublin: 'Europe/Dublin', brussels: 'Europe/Brussels', copenhagen: 'Europe/Copenhagen', stockholm: 'Europe/Stockholm',
  oslo: 'Europe/Oslo', warsaw: 'Europe/Warsaw', bern: 'Europe/Zurich', helsinki: 'Europe/Helsinki', reykjavik: 'Atlantic/Reykjavik',
  tokyo: 'Asia/Tokyo', seoul: 'Asia/Seoul', bangkok: 'Asia/Bangkok', beijing: 'Asia/Shanghai', washington: 'America/New_York',
  ottawa: 'America/Toronto', 'mexico-city': 'America/Mexico_City', 'buenos-aires': 'America/Argentina/Buenos_Aires', cairo: 'Africa/Cairo', canberra: 'Australia/Sydney',
};
const AIRPORT_TZ: Record<string, string> = { TLV: 'Asia/Jerusalem', ETM: 'Asia/Jerusalem', HFA: 'Asia/Jerusalem' };

export function airportTz(iata: string | null, fallback: string): string {
  if (!iata) return fallback;
  return AIRPORT_TZ[iata] ?? CITY_TZ[resolveCityKey(iata)] ?? fallback;
}

let seq = 0;
const id = (p: string) => `${p}-new-${Date.now().toString(36)}-${seq++}`;

/** Pure: returns a new bundle with the confirmed flight/hotel and its document added. */
export function addFromDocument(b: TripBundle, e: Extraction, file?: { name: string; mime: string; size: number }): TripBundle {
  const tz = b.trip.timezone;
  const next: TripBundle = { ...b, flights: [...b.flights], hotels: [...b.hotels], documents: [...b.documents] };
  let linkedId: string;
  let linkedType: 'flight' | 'hotel_check_in';
  let title: string;
  if (e.kind === 'hotel') {
    linkedId = id('ht');
    linkedType = 'hotel_check_in';
    title = `אישור מלון ${e.hotel_name ?? ''}`.trim();
    next.hotels.push({
      id: linkedId, tripId: b.trip.id, name: e.hotel_name ?? 'מלון', address: e.address ?? '',
      checkInAt: zonedToIso(e.check_in!, '15:00', tz), checkOutAt: zonedToIso(e.check_out!, '11:00', tz), bookingNumber: e.booking_reference ?? undefined,
    });
  } else {
    linkedId = id('fl');
    linkedType = 'flight';
    title = `כרטיס טיסה ${e.flight_number ?? ''}`.trim();
    const depTz = airportTz(e.origin, tz);
    const arrTz = airportTz(e.destination, tz);
    const dep = zonedToIso(e.date!, e.departure_time!, depTz);
    let arr = e.arrival_time ? zonedToIso(e.date!, e.arrival_time, arrTz) : dep;
    if (arr < dep) arr = new Date(new Date(arr).getTime() + 86400000).toISOString();
    next.flights.push({
      id: linkedId, tripId: b.trip.id, airline: e.airline ?? '', flightNumber: e.flight_number ?? '', origin: e.origin ?? '', destination: e.destination ?? '',
      departureAt: dep, departureTimezone: depTz, arrivalAt: arr, arrivalTimezone: arrTz, departureTerminal: e.departure_terminal ?? undefined,
      gate: e.gate ?? undefined, bookingReference: e.booking_reference ?? undefined,
    });
  }
  const mime: DocumentMime = file?.mime === 'application/pdf' ? 'application/pdf' : file?.mime === 'image/png' ? 'image/png' : file?.mime === 'image/webp' ? 'image/webp' : file ? 'image/jpeg' : 'application/pdf';
  const docId = id('doc');
  next.documents.push({
    id: docId, tripId: b.trip.id, userId: b.trip.userId, title, mimeType: mime, sizeBytes: file?.size ?? 0,
    storagePath: `${b.trip.userId}/${b.trip.id}/${docId}`, linkedType, linkedId, createdAt: new Date().toISOString(),
  });
  if (e.kind === 'hotel') next.hotels[next.hotels.length - 1].documentId = docId;
  else next.flights[next.flights.length - 1].documentId = docId;
  return next;
}
