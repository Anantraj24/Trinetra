import { AppSurface, PageHeader } from '@/components/ui';

export default function AuthorityHazards() {
  return (
    <div className="flex-1 p-6 lg:p-12">
      <PageHeader 
        title="Hazards" 
        subtitle="Reported and verified environmental risks." 
      />
      <AppSurface>
        <div className="p-6 text-taupe h-64 flex items-center justify-center">
          Hazards Overview Stub
        </div>
      </AppSurface>
    </div>
  );
}
