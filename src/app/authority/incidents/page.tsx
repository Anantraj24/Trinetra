import { AppSurface, PageHeader } from '@/components/ui';

export default function AuthorityIncidents() {
  return (
    <div className="flex-1 p-6 lg:p-12">
      <PageHeader 
        title="Incidents" 
        subtitle="Manage active and resolved emergencies." 
      />
      <AppSurface>
        <div className="p-6 text-taupe h-64 flex items-center justify-center">
          Incidents Management Stub
        </div>
      </AppSurface>
    </div>
  );
}
