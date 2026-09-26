import { describe, expect, it } from 'vitest';
import { destinationCity, extractionSchema, parseTravelText } from './extract';

describe('parseTravelText', () => {
  it('reads an El Al confirmation', () => {
    const e = parseTravelText(`El Al booking confirmation\nBooking reference: K7Q2LM\nFlight LY 381  TLV - CDG\n12/04/2027  Departure 10:30  Arrival 13:45\nTerminal 3`);
    expect(e.kind).toBe('flight');
    expect(e.flight_number).toBe('LY381');
    expect(e.airline).toBe('El Al');
    expect([e.origin, e.destination]).toEqual(['TLV', 'CDG']);
    expect(e.date).toBe('2027-04-12');
    expect([e.departure_time, e.arrival_time]).toEqual(['10:30', '13:45']);
    expect(e.booking_reference).toBe('K7Q2LM');
    expect(e.departure_terminal).toBe('3');
    expect(destinationCity(e)).toBe('paris');
    expect(extractionSchema.safeParse(e).success).toBe(true);
  });
  it('reads a bare flight number', () => {
    const e = parseTravelText('az 807'.toUpperCase());
    expect(e.flight_number).toBe('AZ807');
    expect(e.airline).toBe('ITA Airways');
  });
  it('reads a hotel confirmation and finds the city', () => {
    const e = parseTravelText(`Hotel Artemide\nVia Nazionale 22, 00184 Rome, Italy\nCheck-in: 20 Oct 2027\nCheck-out: 24 Oct 2027\nConfirmation number: 88412345`);
    expect(e.kind).toBe('hotel');
    expect(e.hotel_name).toBe('Hotel Artemide');
    expect([e.check_in, e.check_out]).toEqual(['2027-10-20', '2027-10-24']);
    expect(destinationCity(e)).toBe('rome');
  });
  it('returns unknown for unrelated text', () => {
    expect(parseTravelText('shopping list: milk, bread').kind).toBe('unknown');
  });
});
