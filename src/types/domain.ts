export type CategoryKey =
  | "flights"
  | "hotels"
  | "transport"
  | "carRental"
  | "attractions"
  | "insurance"
  | "checklist";

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  description: string;
  colorVar: string;
}

export const CATEGORY_ORDER: CategoryKey[] = [
  "flights",
  "hotels",
  "transport",
  "carRental",
  "attractions",
  "insurance",
  "checklist",
];

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  flights: {
    key: "flights",
    label: "טיסות",
    description: "כרטיסים, סטטוס, טרמינלים",
    colorVar: "var(--color-flights)",
  },
  hotels: {
    key: "hotels",
    label: "מלונות",
    description: "הזמנה, צ'ק-אין, צ'ק-אאוט",
    colorVar: "var(--color-hotels)",
  },
  transport: {
    key: "transport",
    label: "תחבורה",
    description: "רכבות, אוטובוסים, מוניות",
    colorVar: "var(--color-transport)",
  },
  carRental: {
    key: "carRental",
    label: "השכרת רכב",
    description: "הזמנה, פרטים, ביטול",
    colorVar: "var(--color-carRental)",
  },
  attractions: {
    key: "attractions",
    label: "אטרקציות",
    description: "כרטיסים, סיורים, אירועים",
    colorVar: "var(--color-attractions)",
  },
  insurance: {
    key: "insurance",
    label: "ביטוח",
    description: "פוליסה, כיסוי רפואי",
    colorVar: "var(--color-insurance)",
  },
  checklist: {
    key: "checklist",
    label: "צ'קליסט",
    description: "מה להביא לפני הטיסה",
    colorVar: "var(--color-checklist)",
  },
};

export interface Trip {
  id: string;
  name: string;
  destinationCity: string;
  country: string;
  countryCode: string;
  landmark: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  timezone: string;
  weatherTempC: number;
}

export type ViewMode = "map" | "itinerary";

export interface ItineraryItem {
  id: string;
  tripId: string;
  date: string; // ISO date
  startAt: string; // HH:mm
  endAt?: string; // HH:mm
  itemType: CategoryKey;
  title: string;
  subtitle?: string;
  statusLabel?: string;
  isLocked: boolean;
  aiGenerated: boolean;
}

export interface MapMarker {
  id: string;
  category: CategoryKey;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  count: number;
}
