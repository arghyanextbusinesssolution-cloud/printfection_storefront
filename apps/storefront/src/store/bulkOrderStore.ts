import { create } from 'zustand';
import type { BulkOrderState, PrintLocationSelection } from '../types';
import type { PricingBreakdown } from '@printfection/types';

interface BulkOrderStore extends BulkOrderState {
  setProduct: (id: string, name: string) => void;
  setColour: (name: string, hex?: string) => void;
  setQuantity: (size: string, quantity: number) => void;
  togglePrintLocation: (location: PrintLocationSelection) => void;
  setPrintColourCount: (locationId: string, count: number) => void;
  setDesignId: (id: string | null) => void;
  setPricing: (pricing: PricingBreakdown | null) => void;
  setStep: (step: number) => void;
  reset: () => void;
  getTotalQuantity: () => number;
  getVariantsPayload: () => { variantId: string; size: string; quantity: number }[];
  getPrintLocationsPayload: () => { locationId: string; colourCount: number }[];
}

const initialState: BulkOrderState = {
  productId: null,
  productName: '',
  colourName: null,
  colourHex: null,
  quantities: {},
  printLocations: [],
  designId: null,
  pricing: null,
  step: 1,
};

export const useBulkOrderStore = create<BulkOrderStore>((set, get) => ({
  ...initialState,
  setProduct: (id, name) =>
    set({
      productId: id,
      productName: name,
      step: 2,
      colourName: null,
      quantities: {},
      printLocations: [],
      designId: null,
      pricing: null,
    }),
  setColour: (name, hex) =>
    set({ colourName: name, colourHex: hex ?? null, step: 3, quantities: {}, pricing: null }),
  setQuantity: (size, quantity) =>
    set((state) => ({
      quantities: { ...state.quantities, [size]: Math.max(0, quantity) },
      pricing: null,
    })),
  togglePrintLocation: (location) =>
    set((state) => {
      const exists = state.printLocations.find((l) => l.locationId === location.locationId);
      return {
        printLocations: exists
          ? state.printLocations.filter((l) => l.locationId !== location.locationId)
          : [...state.printLocations, { ...location, colourCount: 1 }],
        pricing: null,
      };
    }),
  setPrintColourCount: (locationId, count) =>
    set((state) => ({
      printLocations: state.printLocations.map((l) =>
        l.locationId === locationId ? { ...l, colourCount: count } : l
      ),
      pricing: null,
    })),
  setDesignId: (id) => set({ designId: id }),
  setPricing: (pricing) => set({ pricing }),
  setStep: (step) => set({ step }),
  reset: () => set(initialState),
  getTotalQuantity: () => Object.values(get().quantities).reduce((sum, q) => sum + q, 0),
  getVariantsPayload: () => {
    const state = get();
    return Object.entries(state.quantities)
      .filter(([, qty]) => qty > 0)
      .map(([size, quantity]) => ({
        variantId: '',
        size,
        quantity,
      }));
  },
  getPrintLocationsPayload: () =>
    get().printLocations.map((l) => ({ locationId: l.locationId, colourCount: l.colourCount })),
}));
