'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSurface, PageHeader, PrimaryButton, SecondaryButton, Skeleton, EmptyState } from '@/components/ui';
import { TrustLevelBadge } from '@/components/ui/TrustLevelBadge';
import { hazardService } from '@/services/hazardService';
import { Hazard, HazardTrustLevel } from '@/types';
import { AlertTriangle, Plus, RefreshCw, Search, ShieldCheck, ShieldAlert, Clock, MapPin, Eye, Edit2, Ban, CheckCircle2 } from 'lucide-react';

export default function AuthorityHazards() {
  const router = useRouter();
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [trustFilter, setTrustFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [deactivateConfirmId, setDeactivateConfirmId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hazardService.getAllHazards();
      setHazards(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load hazards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeactivate = async (id: string) => {
    setDeactivatingId(id);
    try {
      await hazardService.deactivateHazard(id);
      setDeactivateConfirmId(null);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeactivatingId(null);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt).getTime() <= Date.now();
  };

  const getSeverityBadge = (sev: number) => {
    const percent = Math.round(sev * 100);
    if (sev >= 0.8) return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700 border border-red-200">{percent}% Critical</span>;
    if (sev >= 0.5) return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">{percent}% High</span>;
    return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-sand text-taupe-dark">{percent}% Moderate</span>;
  };

  const filtered = hazards.filter(h => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchType = h.type.toLowerCase().includes(q);
      const matchSource = h.source.toLowerCase().includes(q);
      const matchDesc = h.description.toLowerCase().includes(q);
      if (!matchType && !matchSource && !matchDesc) return false;
    }

    if (trustFilter !== 'ALL' && h.trustLevel !== trustFilter) return false;

    const expired = isExpired(h.expiresAt);
    const isActive = h.active !== false && !expired;

    if (statusFilter === 'ACTIVE' && !isActive) return false;
    if (statusFilter === 'INACTIVE' && (h.active !== false)) return false;
    if (statusFilter === 'EXPIRED' && !expired) return false;

    return true;
  });

  const activeCount = hazards.filter(h => h.active !== false && !isExpired(h.expiresAt)).length;
  const verifiedCount = hazards.filter(h => h.trustLevel === HazardTrustLevel.VERIFIED && h.active !== false && !isExpired(h.expiresAt)).length;
  const criticalCount = hazards.filter(h => h.severity >= 0.8 && h.active !== false && !isExpired(h.expiresAt)).length;

  return (
    <div className="flex-1 p-4 lg:p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader 
          title="Hazard Intelligence" 
          subtitle="Authority environmental risk oversight & real-time telemetry." 
        />
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-sand-light rounded-xl font-medium text-taupe hover:bg-sand-light transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <PrimaryButton 
            onClick={() => router.push('/authority/hazards/add')}
            className="py-2.5 px-4 text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Hazard
          </PrimaryButton>
        </div>
      </div>

      {/* Top Stat Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-sand-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-taupe-dark">{loading ? '-' : activeCount}</div>
            <div className="text-xs font-semibold text-taupe uppercase tracking-wider">Active Regional Hazards</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-taupe-dark">{loading ? '-' : verifiedCount}</div>
            <div className="text-xs font-semibold text-taupe uppercase tracking-wider">Verified Authority Risks</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-alert/10 flex items-center justify-center text-alert">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-alert">{loading ? '-' : criticalCount}</div>
            <div className="text-xs font-semibold text-taupe uppercase tracking-wider">Critical Severity (≥80%)</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <AppSurface className="flex flex-col flex-1 min-h-[420px]">
        {/* Filters */}
        <div className="p-4 lg:p-6 border-b border-sand-light flex flex-col md:flex-row gap-3 justify-between md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" size={16} />
            <input
              type="text"
              placeholder="Search type, source, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-50 border border-sand-light rounded-xl text-sm focus:outline-none focus:border-forest w-full sm:w-72"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <select
              value={trustFilter}
              onChange={(e) => setTrustFilter(e.target.value)}
              className="px-3.5 py-2 bg-zinc-50 border border-sand-light rounded-xl text-sm text-taupe-dark font-medium focus:outline-none"
            >
              <option value="ALL">All Trust Levels</option>
              {Object.values(HazardTrustLevel).map(tl => (
                <option key={tl} value={tl}>{tl}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-zinc-50 border border-sand-light rounded-xl text-sm text-taupe-dark font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Deactivated</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="p-6 flex flex-col gap-4">
              <Skeleton className="w-full h-12 rounded-xl" />
              <Skeleton className="w-full h-12 rounded-xl" />
              <Skeleton className="w-full h-12 rounded-xl" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No Hazards Found"
              description="No environmental hazards match the selected criteria."
            />
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-taupe font-semibold bg-sand/30 border-b border-sand-light">
                  <th className="p-4">Type / Description</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Trust Level</th>
                  <th className="p-4">Source / Region</th>
                  <th className="p-4">Status / Expiry</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-light text-sm">
                {filtered.map((hazard) => {
                  const expired = isExpired(hazard.expiresAt);
                  const isDeactivated = hazard.active === false;
                  const isActive = !isDeactivated && !expired;

                  return (
                    <tr key={hazard.id} className={`hover:bg-sand-light/20 transition-colors ${!isActive ? 'opacity-60 bg-zinc-50/50' : ''}`}>
                      <td className="p-4 max-w-[280px]">
                        <div className="font-bold text-taupe-dark flex items-center gap-2">
                          <AlertTriangle size={15} className={hazard.severity >= 0.8 ? 'text-alert shrink-0' : 'text-orange-500 shrink-0'} />
                          <span className="truncate">{hazard.type}</span>
                        </div>
                        <p className="text-xs text-taupe line-clamp-1 mt-0.5">{hazard.description}</p>
                      </td>
                      <td className="p-4">
                        {getSeverityBadge(hazard.severity)}
                      </td>
                      <td className="p-4">
                        <TrustLevelBadge level={hazard.trustLevel} />
                      </td>
                      <td className="p-4 text-xs text-taupe">
                        <div className="font-medium text-taupe-dark">{hazard.source}</div>
                        {hazard.region && (
                          <div className="flex items-center gap-1 mt-0.5 text-taupe">
                            <MapPin size={11} /> {hazard.region}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          {isDeactivated ? (
                            <span className="px-2 py-0.5 bg-zinc-200 text-zinc-700 rounded-full font-bold text-[10px]">DEACTIVATED</span>
                          ) : expired ? (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-bold text-[10px]">EXPIRED</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-success-soft text-success rounded-full font-bold text-[10px]">ACTIVE</span>
                          )}
                        </div>
                        <div className="text-taupe flex items-center gap-1">
                          <Clock size={11} /> {new Date(hazard.expiresAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => router.push(`/authority/hazards/${hazard.id}`)}
                            title="View & Edit Details"
                            className="p-1.5 text-taupe hover:text-forest hover:bg-sand-light rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          {isActive && (
                            <button
                              onClick={() => setDeactivateConfirmId(hazard.id)}
                              title="Deactivate Hazard"
                              className="p-1.5 text-taupe hover:text-alert hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </AppSurface>

      {/* Deactivate Modal */}
      {deactivateConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm p-6 bg-white rounded-3xl shadow-xl border border-sand-light">
            <h3 className="font-bold text-taupe-dark text-lg mb-2 flex items-center gap-2 text-alert">
              <AlertTriangle size={20} /> Deactivate Hazard?
            </h3>
            <p className="text-sm text-taupe mb-6 leading-relaxed">
              This will mark the hazard inactive. It will no longer contribute to tourist risk calculations across active journey corridors.
            </p>
            <div className="flex gap-3">
              <SecondaryButton onClick={() => setDeactivateConfirmId(null)} className="flex-1">
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={() => handleDeactivate(deactivateConfirmId)}
                disabled={deactivatingId === deactivateConfirmId}
                className="flex-1 bg-alert hover:bg-red-600"
              >
                {deactivatingId === deactivateConfirmId ? 'Deactivating...' : 'Confirm'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
