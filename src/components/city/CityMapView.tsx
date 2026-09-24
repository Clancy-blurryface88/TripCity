import { useState } from "react";
import CategoryMarker from "./CategoryMarker";
import CategoryBottomSheet from "./CategoryBottomSheet";
import GenericCityBackground from "./GenericCityBackground";
import { CATEGORIES, type CityVisual, type MapMarker } from "../../types/domain";

interface CityMapViewProps {
  city: CityVisual;
}

export default function CityMapView({ city }: CityMapViewProps) {
  const [selected, setSelected] = useState<MapMarker | null>(null);

  return (
    <div className="absolute inset-0">
      {city.backgroundImage ? (
        <img
          src={city.backgroundImage}
          alt={`איור איזומטרי של ${city.label} ואזורי הטיול`}
          className="h-full w-full object-cover"
        />
      ) : (
        <GenericCityBackground />
      )}

      {city.hasBakedMarkers
        ? // legacy asset: the circles are already drawn into the image —
          // just place invisible, clickable hit-areas on top of them
          city.markers.map((marker) => {
            const meta = CATEGORIES[marker.category];
            return (
              <button
                key={marker.id}
                type="button"
                onClick={() => setSelected(marker)}
                className="absolute h-[13%] w-[19%] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                aria-label={meta.label}
              />
            );
          })
        : city.markers.map((marker, i) => (
            <CategoryMarker key={marker.id} marker={marker} index={i} onSelect={setSelected} />
          ))}

      <CategoryBottomSheet marker={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
