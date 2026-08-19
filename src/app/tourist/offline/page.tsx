import { AppSurface, PageHeader } from '@/components/ui';

export default function TouristOffline() {
  return (
    <div className="flex-1 p-6 lg:p-12">
      <PageHeader 
        title="Offline Pack" 
        subtitle="Cached maps and emergency procedures." 
      />
      <AppSurface>
        <div className="p-6 text-taupe h-64 flex items-center justify-center">
          Offline Pack Stub
        </div>
      </AppSurface>
    </div>
  );
}
