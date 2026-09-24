import {
  Plane,
  BedDouble,
  Bus,
  Car,
  Star,
  ShieldCheck,
  Luggage,
  type LucideIcon,
} from "lucide-react";
import type { CategoryKey } from "../../types/domain";

export const CATEGORY_ICONS: Record<CategoryKey, LucideIcon> = {
  flights: Plane,
  hotels: BedDouble,
  transport: Bus,
  carRental: Car,
  attractions: Star,
  insurance: ShieldCheck,
  checklist: Luggage,
};
