import type { ItineraryItem, MapMarker, Trip } from "../types/domain";

export const parisTrip: Trip = {
  id: "trip-paris-2027",
  name: "טיול לפריז",
  destinationCity: "Paris",
  country: "צרפת",
  countryCode: "FR",
  landmark: "eiffel-tower",
  startDate: "2027-04-12",
  endDate: "2027-04-17",
  timezone: "Europe/Paris",
  weatherTempC: 18,
};

export const parisMarkers: MapMarker[] = [
  { id: "m-flights", category: "flights", x: 18, y: 13, count: 2 },
  { id: "m-attractions", category: "attractions", x: 49, y: 50, count: 4 },
  { id: "m-transport", category: "transport", x: 55, y: 60, count: 3 },
  { id: "m-hotels", category: "hotels", x: 76, y: 72, count: 1 },
  { id: "m-carRental", category: "carRental", x: 90, y: 70, count: 1 },
  { id: "m-checklist", category: "checklist", x: 34, y: 86, count: 8 },
  { id: "m-insurance", category: "insurance", x: 16, y: 85, count: 1 },
];

export const parisItinerary: ItineraryItem[] = [
  {
    id: "it-1",
    tripId: parisTrip.id,
    date: "2027-04-12",
    startAt: "08:20",
    endAt: "10:55",
    itemType: "flights",
    title: "טיסה תל אביב – פריז",
    subtitle: "LY318 · טרמינל 3",
    statusLabel: "מאושר",
    isLocked: true,
    aiGenerated: false,
  },
  {
    id: "it-2",
    tripId: parisTrip.id,
    date: "2027-04-12",
    startAt: "12:45",
    itemType: "hotels",
    title: "צ'ק-אין במלון",
    subtitle: "Hotel Le Marais",
    statusLabel: "מאושר",
    isLocked: true,
    aiGenerated: false,
  },
  {
    id: "it-3",
    tripId: parisTrip.id,
    date: "2027-04-12",
    startAt: "15:00",
    endAt: "17:00",
    itemType: "attractions",
    title: "מגדל אייפל",
    subtitle: "כרטיסים הוזמנו",
    statusLabel: "מאושר",
    isLocked: true,
    aiGenerated: false,
  },
  {
    id: "it-4",
    tripId: parisTrip.id,
    date: "2027-04-12",
    startAt: "18:30",
    itemType: "attractions",
    title: "ארוחת ערב · Le Comptoir",
    subtitle: "הזמנה אושרה",
    statusLabel: "מאושר",
    isLocked: false,
    aiGenerated: true,
  },
  {
    id: "it-5",
    tripId: parisTrip.id,
    date: "2027-04-13",
    startAt: "09:30",
    endAt: "12:00",
    itemType: "attractions",
    title: "מוזיאון הלובר",
    subtitle: "כרטיסים הוזמנו",
    statusLabel: "מאושר",
    isLocked: false,
    aiGenerated: true,
  },
  {
    id: "it-6",
    tripId: parisTrip.id,
    date: "2027-04-13",
    startAt: "14:00",
    itemType: "transport",
    title: "רכבת לוורסאי",
    subtitle: "Paris → Versailles",
    isLocked: false,
    aiGenerated: true,
  },
];

export function itineraryDays(trip: Trip): string[] {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const days: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}
