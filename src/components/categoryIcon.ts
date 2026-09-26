import type { CategoryId } from '@/domain/types';
import { BedDouble, Car, Luggage, Plane, ShieldCheck, Ticket, TrainFront, type LucideIcon } from '@/ui/icons';

export const CATEGORY_ICON: Record<CategoryId, LucideIcon> = {
  flights: Plane,
  hotels: BedDouble,
  transport: TrainFront,
  attractions: Ticket,
  car: Car,
  insurance: ShieldCheck,
  checklist: Luggage,
};
