import { create } from 'zustand';
import type { CartData } from '../types';

interface CartStore {
  cart: CartData | null;
  setCart: (data: CartData) => void;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  setCart: (data) => set({ cart: data }),
  itemCount: () => get().cart?.totals.itemCount ?? 0,
}));
