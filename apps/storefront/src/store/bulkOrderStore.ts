import { create } from 'zustand';
import type { BulkOrderState, PrintLocationSelection, BulkColourState, BulkArtworkRef } from '../types';
import type { PricingBreakdown } from '@printfection/types';

interface BulkOrderStore extends BulkOrderState {
  alertMessage: string | null;
  alertTitle: string | null;
  showAlert: (message: string, title?: string) => void;
  closeAlert: () => void;
  setQuantity: (quantity: number) => void;
  setGarmentCategory: (id: string, name: string) => void;
  setProduct: (id: string, name: string, images: string[]) => void;
  toggleColour: (colour: { colourName: string; colourHex?: string; colourImage?: string }) => void;
  setColourQuantity: (colourName: string, size: string, quantity: number, variantId: string) => void;
  setPrintingMethod: (method: string) => void;
  togglePrintLocation: (location: Omit<PrintLocationSelection, 'colourCount'>) => void;
  setPrintColourCount: (locationId: string, count: number) => void;
  setDesignStudioData: (designId: string, designsData?: Record<string, any>) => void;
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
  targetQuantity: 50,
  garmentCategoryId: null,
  garmentCategoryName: '',
  productId: null,
  productName: '',
  productImages: [],
  selectedColours: [],
  printingMethod: 'SCREEN_PRINTING',
  selectedLocations: [],
  artworks: [],
  designId: null,
  designsData: undefined,
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

  setQuantity: (quantity) =>
    set({
      targetQuantity: Math.max(1, quantity),
    }),

  setGarmentCategory: (id, name) =>
    set((state) => {
      // If changing category, reset downstream product & specs
      if (state.garmentCategoryId !== id) {
        return {
          garmentCategoryId: id,
          garmentCategoryName: name,
          productId: null,
          productName: '',
          productImages: [],
          selectedColours: [],
          selectedLocations: [],
          artworks: [],
          designId: null,
          designsData: undefined,
          pricing: null,
          step: 3, // Auto advance to Product step
        };
      }
      return { garmentCategoryId: id, garmentCategoryName: name, step: 3 };
    }),

  setProduct: (id, name, images) =>
    set((state) => {
      if (state.productId !== id) {
        return {
          productId: id,
          productName: name,
          productImages: images,
          selectedColours: [],
          selectedLocations: [],
          artworks: [],
          designId: null,
          designsData: undefined,
          pricing: null,
          step: 4, // Auto advance to Colour step
        };
      }
      return { productId: id, productName: name, productImages: images, step: 4 };
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
            variantId,
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

  setPrintingMethod: (method) =>
    set({
      printingMethod: method,
      pricing: null,
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

  setDesignStudioData: (designId, designsData) =>
    set({
      designId,
      designsData,
    }),

  setArtworks: (artworks) => set({ artworks }),

  setPricing: (pricing) => set({ pricing }),

  setStep: (step) => set({ step: Math.min(10, Math.max(1, step)) }),

  reset: () => set({ ...initialState, alertMessage: null, alertTitle: null }),

  getTotalQuantity: () => {
    return get().selectedColours.reduce((total, c) => {
      return total + Object.values(c.sizeQuantities).reduce((sum, q) => sum + q, 0);
    }, 0);
  },

  getVariantsPayload: () => {
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

    const selectedLocations = (item.printLocations || []).map((loc: any) => ({
      locationId: loc.locationId,
      locationName: loc.locationName || (loc.locationId === 'FULL_FRONT' ? 'Full Front' : loc.locationId === 'FULL_BACK' ? 'Full Back' : 'Left Chest'),
      code: loc.locationId,
      colourCount: loc.colourCount,
      maximumColours: loc.maximumColours || 6,
    }));

    const totalQty = selectedColours.reduce((t: number, c: any) => t + Object.values(c.sizeQuantities).reduce((s: number, q: any) => s + (q as number), 0), 0);

    set({
      editItemIndex: index,
      targetQuantity: totalQty || 50,
      productId: item.productId,
      productName: item.productName,
      selectedColours,
      selectedLocations,
      artworks: item.artworks || [],
      designId: item.designId || null,
      step: 9,
    });
  },
}));
