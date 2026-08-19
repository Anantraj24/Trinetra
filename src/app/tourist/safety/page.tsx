import { AppSurface, PageHeader } from '@/components/ui';

export default function TouristSafety() {
  return (
    <div className="flex-1 p-6 lg:p-12">
      <PageHeader 
        title="Safety Pass" 
        subtitle="Your verified medical and emergency profile." 
      />
      <AppSurface>
        <div className="p-6 text-taupe h-64 flex items-center justify-center">
          Safety Pass Stub
        </div>
      </AppSurface>
    </div>
  );
}
