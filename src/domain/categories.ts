import type { CategoryId } from './types';

export interface CategoryMeta {
  id: CategoryId;
  color: string; // marker fill
  tint: string; // soft background
}

export const CATEGORY_ORDER: CategoryId[] = ['flights', 'hotels', 'transport', 'attractions', 'car', 'insurance', 'checklist'];

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  flights: { id: 'flights', color: '#2f80ed', tint: '#e7f0fd' },
  hotels: { id: 'hotels', color: '#8b5cf6', tint: '#f1ebfe' },
  transport: { id: 'transport', color: '#16a34a', tint: '#e5f6ea' },
  attractions: { id: 'attractions', color: '#e11d48', tint: '#fde8ed' },
  car: { id: 'car', color: '#f97316', tint: '#feeee2' },
  insurance: { id: 'insurance', color: '#0d9488', tint: '#e2f4f2' },
  checklist: { id: 'checklist', color: '#7c3aed', tint: '#efe8fd' },
};
