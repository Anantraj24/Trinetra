import { AppSurface, PageHeader } from '@/components/ui';

export default function AuthorityNexus() {
  return (
    <div className="flex-1 p-6 lg:p-12">
      <PageHeader 
        title="Nexus" 
        subtitle="Global TRINETRA command center." 
      />
      <AppSurface>
        <div className="p-6 text-taupe h-64 flex items-center justify-center">
          Nexus Dashboard Stub
        </div>
      </AppSurface>
    </div>
  );
}
