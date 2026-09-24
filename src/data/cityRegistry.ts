import type { CityVisual, MapMarker } from "../types/domain";
import parisCityBg from "../assets/paris-city-bg.png";

/**
 * One entry per supported destination. To add a new city once its clean
 * illustration file arrives (see spec: no baked-in category circles):
 *   1. Drop the image in src/assets and import it here.
 *   2. Add an entry keyed by the same slug Trip.cityKey will use.
 *   3. Calibrate each marker's x/y (% of the image) by eye against the file.
 * Cities not present here fall back to GENERIC_CITY automatically.
 */
const parisMarkers: MapMarker[] = [
  { id: "m-flights", category: "flights", x: 32, y: 17, count: 2 },
  { id: "m-hotels", category: "hotels", x: 65, y: 27, count: 1 },
  { id: "m-transport", category: "transport", x: 27, y: 36, count: 3 },
  { id: "m-attractions", category: "attractions", x: 72, y: 49, count: 4 },
  { id: "m-insurance", category: "insurance", x: 19, y: 75, count: 1 },
  { id: "m-carRental", category: "carRental", x: 87, y: 73, count: 1 },
  { id: "m-checklist", category: "checklist", x: 60, y: 86, count: 8 },
];

const GENERIC_MARKERS: MapMarker[] = [
  { id: "m-flights", category: "flights", x: 22, y: 20, count: 2 },
  { id: "m-hotels", category: "hotels", x: 70, y: 28, count: 1 },
  { id: "m-transport", category: "transport", x: 30, y: 46, count: 3 },
  { id: "m-attractions", category: "attractions", x: 60, y: 52, count: 4 },
  { id: "m-insurance", category: "insurance", x: 20, y: 72, count: 1 },
  { id: "m-carRental", category: "carRental", x: 80, y: 68, count: 1 },
  { id: "m-checklist", category: "checklist", x: 50, y: 84, count: 8 },
];

export const GENERIC_CITY: CityVisual = {
  key: "generic",
  label: "היעד שלך",
  backgroundImage: null,
  markers: GENERIC_MARKERS,
};

export const CITY_REGISTRY: Record<string, CityVisual> = {
  paris: {
    key: "paris",
    label: "Paris",
    backgroundImage: parisCityBg,
    hasBakedMarkers: true, // legacy asset — replace with a clean illustration when available
    markers: parisMarkers,
  },
};

export function getCityVisual(cityKey: string): CityVisual {
  return CITY_REGISTRY[cityKey] ?? GENERIC_CITY;
}
