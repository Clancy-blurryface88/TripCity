/**
 * Trip City domain model.
 * All instants are ISO-8601 strings in UTC ("2027-04-12T11:45:00Z").
 * All *display* happens in the trip's IANA timezone (Trip.timezone), never the device timezone.
 * Local trip dates ("2027-04-12") are calendar days in the trip timezone.
 */

export type ISODateTime = string;
export type LocalDate = string; // YYYY-MM-DD in trip timezone
export type UUID = string;

export type CategoryId =
  | 'flights'
  | 'hotels'
  | 'transport'
  | 'attractions'
  | 'car'
  | 'insurance'
  | 'checklist';

export type TripStatus = 'planning' | 'upcoming' | 'active' | 'completed' | 'archived';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Trip {
  id: UUID;
  userId: UUID;
  name: string;
  destination: string; // city, e.g. "Paris"
  country: string; // ISO 3166-1 alpha-2, e.g. "FR"
  cityKey: CityKey;
  startDate: LocalDate;
  endDate: LocalDate;
  timezone: string; // IANA, e.g. "Europe/Paris"
  status: TripStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type CityKey =
  | 'paris' | 'rome' | 'london' | 'amsterdam' | 'madrid' | 'lisbon' | 'berlin' | 'vienna' | 'prague' | 'budapest'
  | 'athens' | 'dublin' | 'brussels' | 'copenhagen' | 'stockholm' | 'oslo' | 'warsaw' | 'bern' | 'helsinki' | 'reykjavik'
  | 'tokyo' | 'seoul' | 'bangkok' | 'beijing' | 'washington' | 'ottawa' | 'mexico-city' | 'buenos-aires' | 'cairo' | 'canberra'
  | 'generic';

export interface Flight {
  id: UUID;
  tripId: UUID;
  airline: string;
  flightNumber: string;
  origin: string; // IATA
  originName?: string;
  destination: string; // IATA
  destinationName?: string;
  departureAt: ISODateTime;
  departureTimezone: string;
  arrivalAt: ISODateTime;
  arrivalTimezone: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  gate?: string;
  bookingReference?: string;
  documentId?: UUID;
}

export interface Hotel {
  id: UUID;
  tripId: UUID;
  name: string;
  address: string;
  location?: GeoPoint;
  checkInAt: ISODateTime;
  checkOutAt: ISODateTime;
  bookingNumber?: string;
  phone?: string;
  bookingUrl?: string;
  documentId?: UUID;
  notes?: string;
}

export type ActivityStatus = 'planned' | 'confirmed' | 'completed' | 'cancelled';
export type TicketStatus = 'none' | 'needed' | 'purchased';

export interface Activity {
  id: UUID;
  tripId: UUID;
  name: string;
  address?: string;
  location?: GeoPoint;
  date?: LocalDate;
  startAt?: ISODateTime; // absent = flexible, AI may place it
  durationMinutes?: number;
  price?: { amount: number; currency: string };
  ticketStatus: TicketStatus;
  status: ActivityStatus;
  /** Local opening hours in the trip timezone; closedWeekdays uses 0=Sunday. */
  openingHours?: { open: string; close: string; closedWeekdays?: number[] };
  documentId?: UUID;
  notes?: string;
}

export type EventKind = 'match' | 'show' | 'theatre' | 'restaurant' | 'museum' | 'other';

export interface TripEvent {
  id: UUID;
  tripId: UUID;
  kind: EventKind;
  name: string;
  location?: string;
  geo?: GeoPoint;
  startAt: ISODateTime;
  durationMinutes?: number;
  bookingReference?: string;
  documentId?: UUID;
  notes?: string;
}

export type TransportMode = 'train' | 'bus' | 'taxi' | 'metro' | 'rental_car';

export interface Transport {
  id: UUID;
  tripId: UUID;
  mode: TransportMode;
  origin: string;
  destination: string;
  departureAt: ISODateTime;
  arrivalAt: ISODateTime;
  operator?: string;
  seat?: string;
  bookingReference?: string;
  documentId?: UUID;
}

export interface CarRental {
  id: UUID;
  tripId: UUID;
  company: string;
  carModel?: string;
  pickupLocation: string;
  pickupAt: ISODateTime;
  dropoffLocation: string;
  dropoffAt: ISODateTime;
  bookingReference?: string;
  documentId?: UUID;
}

export interface InsurancePolicy {
  id: UUID;
  tripId: UUID;
  provider: string;
  policyNumber: string;
  coverageStart: LocalDate;
  coverageEnd: LocalDate;
  emergencyPhone?: string;
  documentId?: UUID;
}

export type DocumentMime = 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp';

export interface TripDocument {
  id: UUID;
  tripId: UUID;
  userId: UUID;
  title: string;
  mimeType: DocumentMime;
  sizeBytes: number;
  storagePath: string; // private bucket path: {user_id}/{trip_id}/{uuid}.{ext}
  linkedType?: ItineraryItemType;
  linkedId?: UUID;
  createdAt: ISODateTime;
}

export type ChecklistCategory = 'documents' | 'clothes' | 'electronics' | 'health' | 'other';

export interface ChecklistItem {
  id: UUID;
  tripId: UUID;
  category: ChecklistCategory;
  label: string;
  done: boolean;
  orderIndex: number;
}

export type ItineraryItemType =
  | 'flight'
  | 'hotel_check_in'
  | 'hotel_check_out'
  | 'transport'
  | 'activity'
  | 'event'
  | 'car_pickup'
  | 'car_dropoff'
  | 'free_time'
  | 'note';

export type ItinerarySource = 'user' | 'ai' | 'import';

export interface ItineraryItem {
  id: UUID;
  tripId: UUID;
  date: LocalDate;
  startAt: ISODateTime;
  endAt?: ISODateTime;
  itemType: ItineraryItemType;
  referenceId?: UUID;
  title: string;
  subtitle?: string;
  orderIndex: number;
  source: ItinerarySource;
  isLocked: boolean; // anchors: flights, booked trains, check-in/out, fixed-time tickets, matches, shows, booked restaurants
  aiGenerated: boolean;
  notes?: string;
  /** Estimated travel to the next item. Estimate only until a MapsProvider is connected. */
  travelToNext?: { minutes: number; mode: 'walk' | 'metro' | 'taxi' | 'train' | 'car' };
}

export interface TripBundle {
  trip: Trip;
  flights: Flight[];
  hotels: Hotel[];
  activities: Activity[];
  events: TripEvent[];
  transport: Transport[];
  carRentals: CarRental[];
  insurance: InsurancePolicy[];
  documents: TripDocument[];
  checklist: ChecklistItem[];
  itinerary: ItineraryItem[];
}
