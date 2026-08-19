import { AppSurface, GlassCard, PageHeader, SectionHeader, Pill, StatusPill, PrimaryButton, SecondaryButton, DangerButton, IconButton, BottomDock, DesktopSidebar, MetricCard, EmptyState, Skeleton, SafetyPulse, ConnectivityBadge } from '@/components/ui';
import { Bell, ArrowRight } from 'lucide-react';

export default function DesignSystem() {
  return (
    <AppSurface>
      <DesktopSidebar />
      <div className="flex-1 w-full pb-32 bg-ivory-warm">
        <PageHeader title="Design System" subtitle="TRINETRA Visual Language & Components" />
        
        <div className="px-6 flex flex-col gap-12">
          
          <section>
            <SectionHeader title="Cards & Surfaces" />
            <GlassCard className="p-6">
              <h3 className="font-semibold text-taupe-dark text-lg mb-2">Glass Card Example</h3>
              <p className="text-taupe">This is a translucent card with a soft shadow and ivory backing, meant to hover gracefully over maps or gradients.</p>
            </GlassCard>
          </section>

          <section>
            <SectionHeader title="Metrics" />
            <div className="grid grid-cols-2 gap-4">
              <MetricCard title="Risk Level" value="12" unit="%" />
              <MetricCard title="Checkpoints" value="4" unit="/ 5" />
            </div>
          </section>

          <section>
            <SectionHeader title="Buttons" />
            <div className="flex flex-col gap-4">
              <PrimaryButton>Start Journey <ArrowRight size={20}/></PrimaryButton>
              <SecondaryButton>Review Plan</SecondaryButton>
              <DangerButton>SOS Emergency</DangerButton>
              <div className="flex gap-4">
                <IconButton icon={Bell} />
              </div>
            </div>
          </section>

          <section>
            <SectionHeader title="Indicators & Pills" />
            <div className="flex flex-wrap gap-4 items-center">
              <Pill>Nomad Mode</Pill>
              <StatusPill status="success" label="Active" />
              <StatusPill status="alert" label="High Risk" />
              <StatusPill status="neutral" label="Pending" />
              <SafetyPulse status="active" />
              <SafetyPulse status="danger" />
              <ConnectivityBadge isOffline={false} />
              <ConnectivityBadge isOffline={true} />
            </div>
          </section>

          <section>
            <SectionHeader title="States" />
            <div className="flex flex-col gap-4">
              <EmptyState title="No active journeys" description="You don't have any ongoing safety contracts right now." />
              <div className="flex flex-col gap-2 p-6 bg-white rounded-3xl border border-sand-light">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </section>

        </div>
      </div>
      <BottomDock />
    </AppSurface>
  );
}
