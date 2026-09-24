import { useState } from "react";
import TopBar from "../layout/TopBar";
import ModeToggle from "../layout/ModeToggle";
import BottomNav from "../layout/BottomNav";
import FloatingAIButton from "../layout/FloatingAIButton";
import CityMapView from "./CityMapView";
import ItineraryTimeline from "./ItineraryTimeline";
import type { ItineraryItem, MapMarker, Trip, ViewMode } from "../../types/domain";

interface CityHomeProps {
  trip: Trip;
  markers: MapMarker[];
  items: ItineraryItem[];
}

export default function CityHome({ trip, markers, items }: CityHomeProps) {
  const [mode, setMode] = useState<ViewMode>("map");

  return (
    <div className="relative mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-white">
      <div className="relative flex-1 overflow-hidden">
        {mode === "map" ? (
          <CityMapView markers={markers} />
        ) : (
          <ItineraryTimeline trip={trip} items={items} />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0">
          <div className="pointer-events-auto">
            <TopBar trip={trip} />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-3">
          <div className="pointer-events-auto">
            <FloatingAIButton />
          </div>
          <div className="pointer-events-auto">
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
