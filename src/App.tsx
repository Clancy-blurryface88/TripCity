import CityHome from "./components/city/CityHome";
import { parisTrip, parisMarkers, parisItinerary } from "./data/mockParis";

export default function App() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 sm:py-6">
      <CityHome trip={parisTrip} markers={parisMarkers} items={parisItinerary} />
    </div>
  );
}
