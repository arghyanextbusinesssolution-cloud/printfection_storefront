# Design Provider Integration

## Overview

The design studio uses an adapter pattern to support multiple commercial design tools without tight coupling.

## Supported Providers (Planned)

- **Fancy Product Designer** — via `FancyProductDesignerAdapter`
- **Lumise** — via `LumiseAdapter`
- **Placeholder** — current default for development

## Adapter Interface

```typescript
interface DesignProviderAdapter {
  createDesign(productId: string, config?: object): Promise<DesignReference>;
  loadDesign(designId: string): Promise<DesignReference>;
  saveDesign(designId: string, config: object): Promise<void>;
  exportDesign(designId: string): Promise<ExportResult>;
  getPreview(designId: string): Promise<string>;
}
```

## Configuration

```env
DESIGN_PROVIDER=fancy-product-designer  # or lumise
DESIGN_PROVIDER_LICENSE_KEY=your-license-key
```

## Storage

Design references are stored in the `Design` MongoDB collection with:
- Provider name
- External design ID
- Product reference
- Configuration JSON
- Preview/export URLs

## Current Status

Placeholder UI and integration layer are in place. Full provider integration pending license confirmation (Phase 2).
