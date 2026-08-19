import { AppSurface, PageHeader } from '@/components/ui';

export default function TouristHome() {
  return (
    <div className="flex-1 p-6 lg:p-12">
      <PageHeader 
        title="Tourist Home" 
        subtitle="Welcome to TRINETRA. Your journey starts here." 
      />
      <AppSurface>
        <div className="p-6 text-taupe h-64 flex items-center justify-center">
          Dashboard Content Stub
        </div>
      </AppSurface>
    </div>
  );
}
