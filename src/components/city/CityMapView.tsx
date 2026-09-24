import { useState } from "react";
import IsometricParis from "./IsometricParis";
import CategoryMarker from "./CategoryMarker";
import CategoryBottomSheet from "./CategoryBottomSheet";
import type { MapMarker } from "../../types/domain";

interface CityMapViewProps {
  markers: MapMarker[];
}

export default function CityMapView({ markers }: CityMapViewProps) {
  const [selected, setSelected] = useState<MapMarker | null>(null);

  return (
    <div className="absolute inset-0">
      <IsometricParis />
      {markers.map((marker, i) => (
        <CategoryMarker key={marker.id} marker={marker} index={i} onSelect={setSelected} />
      ))}
      <CategoryBottomSheet marker={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
