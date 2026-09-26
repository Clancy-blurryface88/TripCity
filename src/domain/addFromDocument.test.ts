import { describe, expect, it } from 'vitest';
import { parisTrip } from '@/data/paris';
import { parseTravelText } from '@/ai/extract';
import { addFromDocument } from './addFromDocument';
import { zonedToIso } from './time';

describe('addFromDocument', () => {
  it('converts wall clock in a zone to UTC', () => {
    expect(zonedToIso('2027-04-12', '10:30', 'Asia/Jerusalem')).toBe('2027-04-12T07:30:00.000Z');
    expect(zonedToIso('2027-01-10', '10:30', 'Europe/Rome')).toBe('2027-01-10T09:30:00.000Z');
  });
  it('adds a confirmed flight with its document, using airport time zones', () => {
    const e = parseTravelText('Booking reference: R8M4TZ\nFlight LY 385 TLV - FCO\n20/10/2027 Departure 07:15 Arrival 10:05');
    const next = addFromDocument(parisTrip, e, { name: 'ticket.pdf', mime: 'application/pdf', size: 1000 });
    const f = next.flights[next.flights.length - 1];
    expect(f.flightNumber).toBe('LY385');
    expect(f.departureAt).toBe('2027-10-20T04:15:00.000Z');
    expect(f.arrivalAt).toBe('2027-10-20T08:05:00.000Z');
    const d = next.documents[next.documents.length - 1];
    expect(d.linkedId).toBe(f.id);
    expect(f.documentId).toBe(d.id);
    expect(parisTrip.flights.length).toBe(next.flights.length - 1);
  });
});
