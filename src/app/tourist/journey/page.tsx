import { AppSurface, PageHeader } from '@/components/ui';

export default function TouristJourney() {
  return (
    <div className="flex-1 p-6 lg:p-12">
      <PageHeader 
        title="Live Journey" 
        subtitle="Active trip monitoring and checkpoints." 
      />
      <AppSurface>
        <div className="p-6 text-taupe h-64 flex items-center justify-center">
          Journey Tracking Stub
        </div>
      </AppSurface>
    </div>
  );
}
