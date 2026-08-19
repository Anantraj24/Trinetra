'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSurface, PageHeader, Skeleton, EmptyState, StatusPill, SecondaryButton } from '@/components/ui';
import { incidentService } from '@/services/incidentService';
import { Incident } from '@/types/incident';
import { IncidentStatus } from '@/types';
import { ShieldAlert, ShieldCheck, ExternalLink, RefreshCw, Search } from 'lucide-react';

export default function AuthorityIncidents() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL_OPEN');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await incidentService.getAllIncidents();
      // Sort by severity descending, then by date
      all.sort((a, b) => {
        if (b.severity !== a.severity) return b.severity - a.severity;
        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      });
      setIncidents(all);
    } catch (err) {
      console.error(err);
      setError('Failed to load incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = incidents.filter(inc => {
    if (searchQuery && !inc.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter === 'ALL_OPEN' && inc.status === IncidentStatus.RESOLVED) return false;
    if (statusFilter !== 'ALL_OPEN' && statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    return true;
  });

  const getSeverityColor = (s: number) => {
    if (s >= 80) return 'text-red-700 bg-red-100 border-red-200';
    if (s >= 55) return 'text-orange-700 bg-orange-100 border-orange-200';
    return 'text-taupe-dark bg-sand border-sand-light';
  };

  const getStatusPill = (status: IncidentStatus) => {
    if (status === IncidentStatus.RESOLVED) return <StatusPill status="success" label={status} />;
    if (status === IncidentStatus.CREATED) return <StatusPill status="alert" label={status} />;
    return <StatusPill status="neutral" label={status} />;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="flex-1 p-4 lg:p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader 
          title="Incidents" 
          subtitle="Manage active and resolved emergencies." 
        />
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-sand-light rounded-xl font-medium text-taupe hover:bg-sand-light transition-colors disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <AppSurface className="flex flex-col flex-1 min-h-[400px]">
        {/* Filters */}
        <div className="p-4 lg:p-6 border-b border-sand-light flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" size={16} />
            <input
              type="text"
              placeholder="Search Incident ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-50 border border-sand-light rounded-xl text-sm focus:outline-none focus:border-forest w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-50 border border-sand-light rounded-xl text-sm focus:outline-none focus:border-forest text-taupe-dark font-medium"
          >
            <option value="ALL_OPEN">Open Incidents</option>
            <option value="ALL">All Incidents</option>
            {Object.values(IncidentStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
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
              title="No Incidents"
              description="No incidents match the current filters."
            />
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-taupe font-semibold bg-sand/30 border-b border-sand-light">
                  <th className="p-4">Incident ID</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reported</th>
                  <th className="p-4">Responder</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-light text-sm">
                {filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-sand-light/20 transition-colors cursor-pointer" onClick={() => router.push(`/authority/incidents/${inc.id}`)}>
                    <td className="p-4 font-mono text-xs text-taupe-dark">
                      <div className="truncate w-28" title={inc.id}>{inc.id}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-xs border ${getSeverityColor(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-4">{getStatusPill(inc.status)}</td>
                    <td className="p-4 text-taupe whitespace-nowrap">{formatTime(inc.reportedAt)}</td>
                    <td className="p-4 text-taupe-dark">
                      {inc.responderId ? (
                        <span className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded-md">{inc.responderId.substring(0, 12)}…</span>
                      ) : (
                        <span className="text-taupe italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ivory border border-sand-light hover:border-forest text-forest font-medium rounded-lg transition-colors text-xs">
                        Open <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AppSurface>
    </div>
  );
}
