import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '../../services/api';
import { formatCurrency } from '@printfection/shared';

interface PricingTier {
  _id: string;
  name: string;
  minQuantity: number;
  maxQuantity?: number;
  discountPercent: number;
  isActive: boolean;
}

interface PrintLocation {
  _id: string;
  name: string;
  code: string;
  maximumColours: number;
  isActive: boolean;
  sortOrder: number;
}

interface PrintPricingRule {
  _id: string;
  printLocation: { _id: string; name: string; code: string };
  colourCount: number;
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  setupCharge: number;
  isActive: boolean;
}

export function PricingPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'tiers' | 'locations' | 'rules'>('tiers');

  // Modals States
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<PrintLocation | null>(null);

  const [ruleModalOpen, setRuleModalOpen] = useState(false);

  // Form States - Tier
  const [tierName, setTierName] = useState('');
  const [tierMinQty, setTierMinQty] = useState(0);
  const [tierMaxQty, setTierMaxQty] = useState('');
  const [tierDiscount, setTierDiscount] = useState(0);
  const [tierIsActive, setTierIsActive] = useState(true);

  // Form States - Location
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locMaxColours, setLocMaxColours] = useState(8);
  const [locIsActive, setLocIsActive] = useState(true);

  // Form States - Rule
  const [ruleLocationId, setRuleLocationId] = useState('');
  const [ruleColourCount, setRuleColourCount] = useState(1);
  const [ruleMinQty, setRuleMinQty] = useState(25);
  const [rulePrice, setRulePrice] = useState(0);
  const [ruleSetup, setRuleSetup] = useState(0);

  const [error, setError] = useState('');

  // Queries
  const { data: tiers } = useQuery({
    queryKey: ['pricing-tiers'],
    queryFn: () => apiGet<PricingTier[]>('/pricing/tiers'),
  });

  const { data: locations } = useQuery({
    queryKey: ['print-locations-admin'],
    queryFn: () => apiGet<PrintLocation[]>('/pricing/print-locations', { activeOnly: false }),
  });

  const { data: rules } = useQuery({
    queryKey: ['print-pricing-rules'],
    queryFn: () => apiGet<PrintPricingRule[]>('/pricing/print-rules'),
  });

  // Mutations
  const createTierMutation = useMutation({
    mutationFn: (data: Partial<PricingTier>) => apiPost('/pricing/tiers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-tiers'] });
      closeTierModal();
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Error creating tier'),
  });

  const updateTierMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PricingTier> }) =>
      apiPut(`/pricing/tiers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-tiers'] });
      closeTierModal();
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Error updating tier'),
  });

  const createLocationMutation = useMutation({
    mutationFn: (data: Partial<PrintLocation>) => apiPost('/pricing/print-locations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-locations-admin'] });
      closeLocationModal();
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Error creating print location'),
  });

  const updateLocationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PrintLocation> }) =>
      apiPut(`/pricing/print-locations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-locations-admin'] });
      closeLocationModal();
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Error updating print location'),
  });

  const createRuleMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost('/pricing/print-rules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-pricing-rules'] });
      closeRuleModal();
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Error creating rule'),
  });

  // Modals Open / Close Helper Functions
  const openCreateTier = () => {
    setError('');
    setEditingTier(null);
    setTierName('');
    setTierMinQty(0);
    setTierMaxQty('');
    setTierDiscount(0);
    setTierIsActive(true);
    setTierModalOpen(true);
  };

  const openEditTier = (tier: PricingTier) => {
    setError('');
    setEditingTier(tier);
    setTierName(tier.name);
    setTierMinQty(tier.minQuantity);
    setTierMaxQty(tier.maxQuantity ? String(tier.maxQuantity) : '');
    setTierDiscount(tier.discountPercent);
    setTierIsActive(tier.isActive);
    setTierModalOpen(true);
  };

  const closeTierModal = () => {
    setTierModalOpen(false);
    setEditingTier(null);
  };

  const openCreateLocation = () => {
    setError('');
    setEditingLocation(null);
    setLocName('');
    setLocCode('');
    setLocMaxColours(8);
    setLocIsActive(true);
    setLocationModalOpen(true);
  };

  const openEditLocation = (loc: PrintLocation) => {
    setError('');
    setEditingLocation(loc);
    setLocName(loc.name);
    setLocCode(loc.code);
    setLocMaxColours(loc.maximumColours);
    setLocIsActive(loc.isActive);
    setLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    setLocationModalOpen(false);
    setEditingLocation(null);
  };

  const openCreateRule = () => {
    setError('');
    setRuleLocationId(locations && locations.length > 0 ? locations[0]._id : '');
    setRuleColourCount(1);
    setRuleMinQty(25);
    setRulePrice(0);
    setRuleSetup(0);
    setRuleModalOpen(true);
  };

  const closeRuleModal = () => {
    setRuleModalOpen(false);
  };

  // Submit Handlers
  const handleSaveTier = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: tierName,
      minQuantity: tierMinQty,
      maxQuantity: tierMaxQty ? parseInt(tierMaxQty, 10) : undefined,
      discountPercent: tierDiscount,
      isActive: tierIsActive,
    };

    if (editingTier) {
      updateTierMutation.mutate({ id: editingTier._id, data: payload });
    } else {
      createTierMutation.mutate(payload);
    }
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: locName,
      code: locCode.toUpperCase(),
      maximumColours: locMaxColours,
      isActive: locIsActive,
    };

    if (editingLocation) {
      updateLocationMutation.mutate({ id: editingLocation._id, data: payload });
    } else {
      createLocationMutation.mutate(payload);
    }
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!ruleLocationId) {
      setError('Please select a print location.');
      return;
    }
    const payload = {
      printLocation: ruleLocationId,
      colourCount: ruleColourCount,
      minQuantity: ruleMinQty,
      pricePerUnit: rulePrice,
      setupCharge: ruleSetup,
      isActive: true,
    };
    createRuleMutation.mutate(payload);
  };

  const toggleLocation = (loc: PrintLocation) => {
    updateLocationMutation.mutate({ id: loc._id, data: { isActive: !loc.isActive } });
  };

  const toggleTier = (tier: PricingTier) => {
    updateTierMutation.mutate({ id: tier._id, data: { isActive: !tier.isActive } });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pricing Management</h1>

      <div className="flex gap-2 mb-6">
        {(['tiers', 'locations', 'rules'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              tab === t ? 'bg-brand-dark text-white shadow-md' : 'bg-gray-100 text-brand-dark hover:bg-gray-200'
            }`}
          >
            {t === 'tiers' ? 'Quantity Tiers' : t === 'locations' ? 'Print Locations' : 'Print Pricing Rules'}
          </button>
        ))}
      </div>

      {tab === 'tiers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-brand-gray">Volume discount tiers applied to garment pricing</p>
            <button onClick={openCreateTier} className="btn-primary text-sm">Add Tier</button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-brand-dark">Name</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-dark">Min Qty</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-dark">Max Qty</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-dark">Discount</th>
                  <th className="text-center px-4 py-3 font-semibold text-brand-dark">Active</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tiers?.map((tier) => (
                  <tr key={tier._id} className={`border-b border-gray-100 transition-colors ${!tier.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-brand-dark">{tier.name}</td>
                    <td className="px-4 py-3 text-right text-brand-dark font-medium">{tier.minQuantity}</td>
                    <td className="px-4 py-3 text-right text-brand-dark font-medium">{tier.maxQuantity ?? '∞'}</td>
                    <td className="px-4 py-3 text-right text-brand-dark font-semibold">{tier.discountPercent}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${tier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {tier.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button onClick={() => openEditTier(tier)} className="text-xs text-brand-accent hover:underline font-semibold">Edit</button>
                      <button onClick={() => toggleTier(tier)} className="text-xs text-brand-gray hover:underline font-semibold">
                        {tier.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'locations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-brand-gray">Configurable print areas on garments</p>
            <button onClick={openCreateLocation} className="btn-primary text-sm">Add Location</button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-brand-dark">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-dark">Code</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-dark">Max Colours</th>
                  <th className="text-center px-4 py-3 font-semibold text-brand-dark">Active</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations?.map((loc) => (
                  <tr key={loc._id} className={`border-b border-gray-100 transition-colors ${!loc.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-brand-dark">{loc.name}</td>
                    <td className="px-4 py-3 text-brand-gray font-mono">{loc.code}</td>
                    <td className="px-4 py-3 text-right text-brand-dark font-medium">{loc.maximumColours}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${loc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {loc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button onClick={() => openEditLocation(loc)} className="text-xs text-brand-accent hover:underline font-semibold">Edit</button>
                      <button onClick={() => toggleLocation(loc)} className="text-xs text-brand-gray hover:underline font-semibold">
                        {loc.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'rules' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-brand-gray">Printing costs by location, colour count, and quantity</p>
            <button onClick={openCreateRule} className="btn-primary text-sm">Add Rule</button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-brand-dark">Location</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-dark">Colours</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-dark">Min Qty</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-dark">Price/Unit</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-dark">Setup</th>
                </tr>
              </thead>
              <tbody>
                {rules?.map((rule) => (
                  <tr key={rule._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-dark">{rule.printLocation?.name || '—'}</td>
                    <td className="px-4 py-3 text-right text-brand-dark font-medium">{rule.colourCount}</td>
                    <td className="px-4 py-3 text-right text-brand-dark font-medium">{rule.minQuantity}</td>
                    <td className="px-4 py-3 text-right text-brand-dark font-semibold">{formatCurrency(rule.pricePerUnit)}</td>
                    <td className="px-4 py-3 text-right text-brand-dark font-semibold">{formatCurrency(rule.setupCharge)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TIER MODAL */}
      {tierModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 bg-white shadow-2xl relative">
            <h3 className="text-lg font-bold text-brand-dark border-b pb-3 mb-4">
              {editingTier ? 'Edit Quantity Tier' : 'Add Quantity Tier'}
            </h3>
            <form onSubmit={handleSaveTier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Tier Name *</label>
                <input
                  required
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. 50–99"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Min Quantity *</label>
                  <input
                    type="number"
                    required
                    value={tierMinQty}
                    onChange={(e) => setTierMinQty(parseInt(e.target.value, 10) || 0)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Max Quantity (optional)</label>
                  <input
                    type="number"
                    value={tierMaxQty}
                    onChange={(e) => setTierMaxQty(e.target.value)}
                    className="input-field"
                    placeholder="Leave blank for ∞"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Discount Percent (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={tierDiscount}
                  onChange={(e) => setTierDiscount(parseFloat(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="tierIsActive"
                  checked={tierIsActive}
                  onChange={(e) => setTierIsActive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="tierIsActive" className="text-sm text-brand-dark font-medium cursor-pointer">Active and applied on calculations</label>
              </div>

              {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={closeTierModal}
                  className="px-4 py-2 border rounded-md text-sm font-semibold text-brand-gray hover:bg-gray-50 hover:text-brand-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTierMutation.isPending || updateTierMutation.isPending}
                  className="btn-primary"
                >
                  {createTierMutation.isPending || updateTierMutation.isPending ? 'Saving...' : 'Save Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCATION MODAL */}
      {locationModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 bg-white shadow-2xl relative">
            <h3 className="text-lg font-bold text-brand-dark border-b pb-3 mb-4">
              {editingLocation ? 'Edit Print Location' : 'Add Print Location'}
            </h3>
            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Location Name *</label>
                <input
                  required
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Left Sleeve"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Location Code *</label>
                <input
                  required
                  value={locCode}
                  onChange={(e) => setLocCode(e.target.value)}
                  disabled={!!editingLocation}
                  className="input-field uppercase font-mono"
                  placeholder="e.g. LEFT_SLEEVE"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Maximum Colours *</label>
                <input
                  type="number"
                  required
                  value={locMaxColours}
                  onChange={(e) => setLocMaxColours(parseInt(e.target.value, 10) || 8)}
                  className="input-field"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="locIsActive"
                  checked={locIsActive}
                  onChange={(e) => setLocIsActive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="locIsActive" className="text-sm text-brand-dark font-medium cursor-pointer">Active and visible to customers</label>
              </div>

              {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={closeLocationModal}
                  className="px-4 py-2 border rounded-md text-sm font-semibold text-brand-gray hover:bg-gray-50 hover:text-brand-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLocationMutation.isPending || updateLocationMutation.isPending}
                  className="btn-primary"
                >
                  {createLocationMutation.isPending || updateLocationMutation.isPending ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RULE MODAL */}
      {ruleModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 bg-white shadow-2xl relative">
            <h3 className="text-lg font-bold text-brand-dark border-b pb-3 mb-4">
              Add Print Pricing Rule
            </h3>
            <form onSubmit={handleSaveRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Print Location *</label>
                <select
                  required
                  value={ruleLocationId}
                  onChange={(e) => setRuleLocationId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Location</option>
                  {locations?.map((l) => (
                    <option key={l._id} value={l._id}>{l.name} ({l.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Colour Count *</label>
                  <input
                    type="number"
                    required
                    value={ruleColourCount}
                    onChange={(e) => setRuleColourCount(parseInt(e.target.value, 10) || 1)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Min Quantity *</label>
                  <input
                    type="number"
                    required
                    value={ruleMinQty}
                    onChange={(e) => setRuleMinQty(parseInt(e.target.value, 10) || 25)}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Price Per Unit (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={rulePrice}
                    onChange={(e) => setRulePrice(parseFloat(e.target.value) || 0)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase mb-1">Setup Charge (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ruleSetup}
                    onChange={(e) => setRuleSetup(parseFloat(e.target.value) || 0)}
                    className="input-field"
                  />
                </div>
              </div>

              {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={closeRuleModal}
                  className="px-4 py-2 border rounded-md text-sm font-semibold text-brand-gray hover:bg-gray-50 hover:text-brand-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRuleMutation.isPending}
                  className="btn-primary"
                >
                  {createRuleMutation.isPending ? 'Saving...' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
