'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppSurface, PageHeader, PrimaryButton, SecondaryButton, Skeleton, EmptyState } from '@/components/ui';
import { TrustLevelBadge } from '@/components/ui/TrustLevelBadge';
import { hazardService, HazardFormData } from '@/services/hazardService';
import { Hazard, HazardTrustLevel } from '@/types';
import { ArrowLeft, AlertTriangle, ShieldCheck, Clock, MapPin, Edit3, Ban, CheckCircle2 } from 'lucide-react';

export default function HazardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hazardId = params.hazardId as string;

  const [hazard, setHazard] = useState<Hazard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const [formData, setFormData] = useState<HazardFormData>({
    type: '',
    severity: 0.5,
    trustLevel: HazardTrustLevel.VERIFIED,
    source: '',
    publishedAt: '',
    expiresAt: '',
    description: '',
    region: '',
  });

  const loadData = useCallback(async () => {
    if (!hazardId) return;
    setLoading(true);
    try {
      const data = await hazardService.getHazardById(hazardId);
      if (data) {
        setHazard(data);
        setFormData({
          type: data.type,
          severity: data.severity,
          trustLevel: data.trustLevel,
          source: data.source,
          publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0, 16) : '',
          expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString().slice(0, 16) : '',
          description: data.description,
          region: data.region || 'Yuksom Valley Corridor',
          distance: data.distance,
          coordinates: data.coordinates,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [hazardId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hazardId) return;
    setSubmitting(true);
    try {
      await hazardService.updateHazard(hazardId, {
        ...formData,
        expiresAt: new Date(formData.expiresAt).toISOString(),
        publishedAt: new Date(formData.publishedAt).toISOString(),
      });
      setIsEditing(false);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to update hazard.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!hazardId) return;
    setSubmitting(true);
    try {
      await hazardService.deactivateHazard(hazardId);
      setShowDeactivateModal(false);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
        <Skeleton className="h-8 w-40 rounded-xl mb-6" />
        <Skeleton className="h-64 rounded-3xl mb-6" />
      </div>
    );
  }

  if (!hazard) {
    return (
      <div className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
        <EmptyState
          icon={AlertTriangle}
          title="Hazard Not Found"
          description={`Hazard with ID ${hazardId} does not exist.`}
        />
        <div className="flex justify-center mt-6">
          <SecondaryButton onClick={() => router.push('/authority/hazards')}>
            <ArrowLeft size={16} /> Back to Hazards
          </SecondaryButton>
        </div>
      </div>
    );
  }

  const isExpired = new Date(hazard.expiresAt).getTime() <= Date.now();
  const isDeactivated = hazard.active === false;
  const isActive = !isDeactivated && !isExpired;

  return (
    <div className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6">
      <button
        onClick={() => router.push('/authority/hazards')}
        className="flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-taupe-dark transition-colors w-fit"
      >
        <ArrowLeft size={16} /> Back to Hazards
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl lg:text-3xl font-black text-taupe-dark tracking-tight">{hazard.type}</h1>
            {isDeactivated ? (
              <span className="px-3 py-1 bg-zinc-200 text-zinc-700 text-xs font-bold rounded-full">DEACTIVATED</span>
            ) : isExpired ? (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">EXPIRED</span>
            ) : (
              <span className="px-3 py-1 bg-success-soft text-success text-xs font-bold rounded-full">ACTIVE</span>
            )}
          </div>
          <p className="text-xs font-mono text-taupe">{hazard.id}</p>
        </div>

        {!isEditing && isActive && (
          <div className="flex gap-2">
            <SecondaryButton onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-sm py-2">
              <Edit3 size={14} /> Edit Hazard
            </SecondaryButton>
            <button
              onClick={() => setShowDeactivateModal(true)}
              className="flex items-center gap-1.5 text-sm px-4 py-2 border border-alert/30 text-alert hover:bg-alert/10 rounded-full font-semibold transition-colors"
            >
              <Ban size={14} /> Deactivate
            </button>
          </div>
        )}
      </div>

      <AppSurface className="p-6 lg:p-8">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={e => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">Trust Level</label>
                <select
                  value={formData.trustLevel}
                  onChange={e => setFormData({ ...formData, trustLevel: e.target.value as HazardTrustLevel })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm font-medium text-taupe-dark"
                >
                  {Object.values(HazardTrustLevel).map(tl => (
                    <option key={tl} value={tl}>{tl}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">
                  Severity: {Math.round(formData.severity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={formData.severity}
                  onChange={e => setFormData({ ...formData, severity: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-sand-light rounded-lg accent-taupe-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">Published</label>
                <input
                  type="datetime-local"
                  value={formData.publishedAt}
                  onChange={e => setFormData({ ...formData, publishedAt: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">Expires At</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-sand-light rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-sand-light">
              <SecondaryButton onClick={() => setIsEditing(false)} className="flex-1">
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Saving...' : 'Save Changes'}
              </PrimaryButton>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-sand-light text-sm">
              <div>
                <div className="text-xs font-semibold text-taupe uppercase tracking-wider mb-1">Severity</div>
                <div className="text-2xl font-black text-taupe-dark">{Math.round(hazard.severity * 100)}%</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-taupe uppercase tracking-wider mb-1">Trust Level</div>
                <div className="mt-0.5"><TrustLevelBadge level={hazard.trustLevel} /></div>
              </div>
              <div>
                <div className="text-xs font-semibold text-taupe uppercase tracking-wider mb-1">Source</div>
                <div className="font-semibold text-taupe-dark">{hazard.source}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-taupe uppercase tracking-wider mb-1">Region</div>
                <div className="font-semibold text-taupe-dark flex items-center gap-1">
                  <MapPin size={13} className="text-forest shrink-0" /> {hazard.region || 'General Corridor'}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-taupe uppercase tracking-wider mb-2">Context & Safety Advisory</h3>
              <p className="text-sm text-taupe-dark leading-relaxed bg-sand/15 p-4 rounded-2xl">{hazard.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-taupe pt-2">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Published: {new Date(hazard.publishedAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Expires: {new Date(hazard.expiresAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </AppSurface>

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm p-6 bg-white rounded-3xl shadow-xl border border-sand-light">
            <h3 className="font-bold text-taupe-dark text-lg mb-2 text-alert">Deactivate Hazard?</h3>
            <p className="text-sm text-taupe mb-6">
              This hazard will be permanently marked inactive and removed from active tourist risk calculations.
            </p>
            <div className="flex gap-3">
              <SecondaryButton onClick={() => setShowDeactivateModal(false)} className="flex-1">Cancel</SecondaryButton>
              <PrimaryButton onClick={handleDeactivate} disabled={submitting} className="flex-1 bg-alert hover:bg-red-600">
                {submitting ? 'Deactivating...' : 'Confirm'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
