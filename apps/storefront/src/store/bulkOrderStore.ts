import { create } from 'zustand';
import type { BulkOrderState, PrintLocationSelection, BulkColourState, BulkArtworkRef } from '../types';
import type { PricingBreakdown } from '@printfection/types';

interface BulkOrderStore extends BulkOrderState {
  alertMessage: string | null;
  alertTitle: string | null;
  showAlert: (message: string, title?: string) => void;
  closeAlert: () => void;
  setGarmentCategory: (id: string, name: string) => void;
  setProduct: (id: string, name: string, images: string[]) => void;
  toggleColour: (colour: { colourName: string; colourHex?: string; colourImage?: string }) => void;
  setColourQuantity: (colourName: string, size: string, quantity: number, variantId: string) => void;
  togglePrintLocation: (location: Omit<PrintLocationSelection, 'colourCount'>) => void;
  setPrintColourCount: (locationId: string, count: number) => void;
  setArtworks: (artworks: BulkArtworkRef[]) => void;
  setPricing: (pricing: PricingBreakdown | null) => void;
  setStep: (step: number) => void;
  setEditItemIndex: (index: number | null) => void;
  loadCartItem: (item: any, index: number) => void;
  reset: () => void;
  getTotalQuantity: () => number;
  getVariantsPayload: () => { variantId: string; size: string; quantity: number }[];
  getPrintLocationsPayload: () => { locationId: string; colourCount: number }[];
}

const initialState: BulkOrderState = {
  garmentCategoryId: null,
  garmentCategoryName: '',
  productId: null,
  productName: '',
  productImages: [],
  selectedColours: [],
  selectedLocations: [],
  artworks: [],
  pricing: null,
  step: 1,
  editItemIndex: null,
};

export const useBulkOrderStore = create<BulkOrderStore>((set, get) => ({
  ...initialState,
  alertMessage: null,
  alertTitle: null,
  showAlert: (message, title = 'Notification') => set({ alertMessage: message, alertTitle: title }),
  closeAlert: () => set({ alertMessage: null, alertTitle: null }),

  setGarmentCategory: (id, name) =>
    set({
      ...initialState,
      garmentCategoryId: id,
      garmentCategoryName: name,
      step: 2,
    }),

  setProduct: (id, name, images) =>
    set({
      productId: id,
      productName: name,
      productImages: images,
      step: 3,
      selectedColours: [],
      selectedLocations: [],
      artworks: [],
      pricing: null,
    }),

  toggleColour: (colour) =>
    set((state) => {
      const exists = state.selectedColours.find((c) => c.colourName === colour.colourName);
      let newColours: BulkColourState[];
      if (exists) {
        newColours = state.selectedColours.filter((c) => c.colourName !== colour.colourName);
      } else {
        newColours = [
          ...state.selectedColours,
          {
            colourName: colour.colourName,
            colourHex: colour.colourHex,
            colourImage: colour.colourImage,
            variants: [] as BulkColourState['variants'],
            sizeQuantities: {},
          },
        ];
      }
      return {
        selectedColours: newColours,
        pricing: null,
      };
    }),

  setColourQuantity: (colourName, size, quantity, variantId) =>
    set((state) => {
      const newColours = state.selectedColours.map((c) => {
        if (c.colourName !== colourName) return c;

        const sizeQuantities = { ...c.sizeQuantities, [size]: Math.max(0, quantity) };
        const variants = Object.entries(sizeQuantities)
          .filter(([, qty]) => qty > 0)
          .map(([sz, qty]) => ({
            variantId, // In practice, size selection maps to specific variantId from product
            size: sz,
            quantity: qty,
          }));

        return {
          ...c,
          sizeQuantities,
          variants,
        };
      });

      return {
        selectedColours: newColours,
        pricing: null,
      };
    }),

  togglePrintLocation: (location) =>
    set((state) => {
      const exists = state.selectedLocations.find((l) => l.locationId === location.locationId);
      return {
        selectedLocations: exists
          ? state.selectedLocations.filter((l) => l.locationId !== location.locationId)
          : [...state.selectedLocations, { ...location, colourCount: 1 }],
        pricing: null,
      };
    }),

  setPrintColourCount: (locationId, count) =>
    set((state) => ({
      selectedLocations: state.selectedLocations.map((l) =>
        l.locationId === locationId ? { ...l, colourCount: count } : l
      ),
      pricing: null,
    })),

  setArtworks: (artworks) => set({ artworks }),

  setPricing: (pricing) => set({ pricing }),

  setStep: (step) => set({ step }),

  reset: () => set({ ...initialState, alertMessage: null, alertTitle: null }),

  getTotalQuantity: () => {
    return get().selectedColours.reduce((total, c) => {
      return total + Object.values(c.sizeQuantities).reduce((sum, q) => sum + q, 0);
    }, 0);
  },

  getVariantsPayload: () => {
    // Pricing calculation needs flat list of all active variant inputs
    const variants: { variantId: string; size: string; quantity: number }[] = [];
    get().selectedColours.forEach((c) => {
      c.variants.forEach((v) => {
        variants.push(v);
      });
    });
    return variants;
  },

  getPrintLocationsPayload: () =>
    get().selectedLocations.map((l) => ({ locationId: l.code, locationName: l.locationName, colourCount: l.colourCount })),

  setEditItemIndex: (index) => set({ editItemIndex: index }),

  loadCartItem: (item, index) => {
    // Parse colours and sizeQuantities back from cart item structure
    const selectedColours = (item.colours || []).map((col: any) => {
      const sizeQuantities: Record<string, number> = {};
      (col.variants || []).forEach((v: any) => {
        sizeQuantities[v.size] = v.quantity;
      });
      return {
        colourName: col.colourName,
        colourHex: col.colourHex,
        colourImage: col.colourImage,
        variants: col.variants || [],
        sizeQuantities,
      };
    });

    // Parse printLocations back
    const selectedLocations = (item.printLocations || []).map((loc: any) => ({
      locationId: loc.locationId,
      locationName: loc.locationName || (loc.locationId === 'FULL_FRONT' ? 'Full Front' : loc.locationId === 'FULL_BACK' ? 'Full Back' : 'Left Chest'),
      code: loc.locationId,
      colourCount: loc.colourCount,
      maximumColours: loc.maximumColours || 6,
    }));

    set({
      editItemIndex: index,
      productId: item.productId,
      productName: item.productName,
      selectedColours,
      selectedLocations,
      artworks: item.artworks || [],
      step: 7, // Go straight to summary step, but clickable header allows navigation to any step
    });
  },
}));
