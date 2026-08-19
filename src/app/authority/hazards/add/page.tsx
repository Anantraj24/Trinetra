'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSurface, PageHeader, PrimaryButton, SecondaryButton } from '@/components/ui';
import { TrustLevelBadge } from '@/components/ui/TrustLevelBadge';
import { hazardService, HazardFormData } from '@/services/hazardService';
import { HazardTrustLevel } from '@/types';
import { ArrowLeft, AlertTriangle, ShieldCheck, MapPin, CheckCircle2, Info } from 'lucide-react';

const REGION_OPTIONS = [
  { id: 'yuksom_valley', name: 'Yuksom Valley Corridor (Low Altitude)', coords: { latitude: 27.3714, longitude: 88.2226 } },
  { id: 'bakhim_river', name: 'Bakhim River Crossing & Bridge', coords: { latitude: 27.3820, longitude: 88.2050 } },
  { id: 'tsokha_ridge', name: 'Tsokha High Ridge Path', coords: { latitude: 27.3890, longitude: 88.1950 } },
  { id: 'dzongri_pass', name: 'Dzongri Glacial Pass (3,950m)', coords: { latitude: 27.3942, longitude: 88.1867 } },
];

export default function AddHazardPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showHighSeverityConfirm, setShowHighSeverityConfirm] = useState(false);

  const defaultExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultPublished = new Date().toISOString().slice(0, 16);

  const [formData, setFormData] = useState<HazardFormData>({
    type: '',
    severity: 0.75,
    trustLevel: HazardTrustLevel.VERIFIED,
    source: 'Sikkim Disaster Management Authority',
    publishedAt: defaultPublished,
    expiresAt: defaultExpires,
    description: '',
    region: 'Bakhim River Crossing & Bridge',
    distance: 2.0,
    coordinates: { latitude: 27.3820, longitude: 88.2050 },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.type.trim()) errs.type = 'Hazard type is required';
    if (!formData.source.trim()) errs.source = 'Source authority is required';
    if (!formData.description.trim()) errs.description = 'Incident description is required';
    if (!formData.expiresAt) errs.expiresAt = 'Expiration time is required';
    if (new Date(formData.expiresAt).getTime() <= new Date(formData.publishedAt).getTime()) {
      errs.expiresAt = 'Expiration must be after publication time';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const reg = REGION_OPTIONS.find(r => r.name === e.target.value);
    setFormData(prev => ({
      ...prev,
      region: e.target.value,
      coordinates: reg ? reg.coords : prev.coordinates,
    }));
  };

  const handleSubmitAsync = async () => {
    setSubmitting(true);
    try {
      await hazardService.createHazard({
        ...formData,
        publishedAt: new Date(formData.publishedAt).toISOString(),
        expiresAt: new Date(formData.expiresAt).toISOString(),
      });
      router.push('/authority/hazards');
    } catch (err) {
      console.error('Failed to create hazard:', err);
      alert('Failed to publish hazard. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (formData.severity >= 0.8 && !showHighSeverityConfirm) {
      setShowHighSeverityConfirm(true);
      return;
    }

    await handleSubmitAsync();
  };

  return (
    <div className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6">
      <button
        onClick={() => router.push('/authority/hazards')}
        className="flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-taupe-dark transition-colors w-fit"
      >
        <ArrowLeft size={16} /> Back to Hazards
      </button>

      <PageHeader
        title="Add Environmental Hazard"
        subtitle="Broadcast verified terrain risks and safety alerts to the TRINETRA network."
      />

      <AppSurface className="p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Row 1: Type & Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">
                Hazard Type *
              </label>
              <input
                type="text"
                placeholder="e.g. Flash Flood / Active Rockfall"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm focus:outline-none focus:border-forest"
              />
              {errors.type && <p className="text-alert text-xs mt-1">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">
                Source Authority *
              </label>
              <input
                type="text"
                placeholder="e.g. State Disaster Management / Forest Dept"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm focus:outline-none focus:border-forest"
              />
              {errors.source && <p className="text-alert text-xs mt-1">{errors.source}</p>}
            </div>
          </div>

          {/* Row 2: Trust Level & Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">
                Trust Level *
              </label>
              <select
                value={formData.trustLevel}
                onChange={e => setFormData({ ...formData, trustLevel: e.target.value as HazardTrustLevel })}
                className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm focus:outline-none focus:border-forest text-taupe-dark font-medium"
              >
                {Object.values(HazardTrustLevel).map(tl => (
                  <option key={tl} value={tl}>{tl}</option>
                ))}
              </select>
              <div className="mt-2">
                <TrustLevelBadge level={formData.trustLevel} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-taupe uppercase tracking-wider">
                  Severity: {Math.round(formData.severity * 100)}%
                </label>
                <span className={`text-xs font-bold ${formData.severity >= 0.8 ? 'text-alert' : formData.severity >= 0.5 ? 'text-orange-500' : 'text-forest'}`}>
                  {formData.severity >= 0.8 ? 'CRITICAL RISK' : formData.severity >= 0.5 ? 'ELEVATED RISK' : 'MODERATE'}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={formData.severity}
                onChange={e => setFormData({ ...formData, severity: parseFloat(e.target.value) })}
                className="w-full h-2 bg-sand-light rounded-lg appearance-none cursor-pointer accent-taupe-dark"
              />
              <p className="text-[11px] text-taupe mt-1">Severity scores above 80% automatically trigger high-alert protocol.</p>
            </div>
          </div>

          {/* Row 3: Predefined Region & SVG Area */}
          <div>
            <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">
              Region & Safe Corridor Sector *
            </label>
            <select
              value={formData.region}
              onChange={handleRegionChange}
              className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm focus:outline-none focus:border-forest text-taupe-dark font-medium"
            >
              {REGION_OPTIONS.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
            <div className="mt-3 p-3 bg-sand/15 rounded-xl flex items-center justify-between text-xs text-taupe">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-forest" />
                <span>Sector Coordinates: {formData.coordinates?.latitude.toFixed(4)}°N, {formData.coordinates?.longitude.toFixed(4)}°E</span>
              </div>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-sand-light">Corridor SVG Alpha</span>
            </div>
          </div>

          {/* Row 4: Published & Expiration Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">
                Published At *
              </label>
              <input
                type="datetime-local"
                value={formData.publishedAt}
                onChange={e => setFormData({ ...formData, publishedAt: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">
                Expires At (Auto-Retire) *
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm focus:outline-none focus:border-forest"
              />
              {errors.expiresAt && <p className="text-alert text-xs mt-1">{errors.expiresAt}</p>}
            </div>
          </div>

          {/* Row 5: Description */}
          <div>
            <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">
              Incident Context / Safe Action Recommendation *
            </label>
            <textarea
              rows={4}
              placeholder="Provide specific instructions (e.g. 'Use secondary suspension bypass trail. Do not attempt direct crossing')..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm focus:outline-none focus:border-forest resize-none"
            />
            {errors.description && <p className="text-alert text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-sand-light">
            <SecondaryButton onClick={() => router.push('/authority/hazards')} className="flex-1">
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Publishing...' : 'Publish Hazard Intel'}
            </PrimaryButton>
          </div>
        </form>
      </AppSurface>

      {/* High Severity Modal */}
      {showHighSeverityConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 bg-white rounded-3xl shadow-xl border-2 border-alert/30">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-alert flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-bold text-taupe-dark text-lg mb-2">Confirm High-Severity Hazard</h3>
            <p className="text-sm text-taupe mb-6 leading-relaxed">
              This hazard is rated at <strong className="text-alert">{Math.round(formData.severity * 100)}% severity</strong>. It will immediately elevate risk engine calculations and trigger proactive Safety Checks for tourists in the <strong>{formData.region}</strong> corridor.
            </p>
            <div className="flex gap-3">
              <SecondaryButton onClick={() => setShowHighSeverityConfirm(false)} className="flex-1">
                Revise Score
              </SecondaryButton>
              <PrimaryButton onClick={() => { setShowHighSeverityConfirm(false); handleSubmitAsync(); }} disabled={submitting} className="flex-1 bg-alert hover:bg-red-600">
                {submitting ? 'Broadcasting...' : 'Confirm & Broadcast'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
