import { useState } from "react";
import parisCityBg from "../../assets/paris-city-bg.png";
import CategoryBottomSheet from "./CategoryBottomSheet";
import { CATEGORIES, type MapMarker } from "../../types/domain";

interface CityMapViewProps {
  markers: MapMarker[];
}

export default function CityMapView({ markers }: CityMapViewProps) {
  const [selected, setSelected] = useState<MapMarker | null>(null);

  return (
    <div className="absolute inset-0">
      <img
        src={parisCityBg}
        alt="איור איזומטרי של פריז עם מגדל אייפל ואזורי הטיול"
        className="h-full w-full object-cover"
      />

      {/* invisible hit-areas over the illustration's own markers */}
      {markers.map((marker) => {
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
      })}

      <CategoryBottomSheet marker={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
