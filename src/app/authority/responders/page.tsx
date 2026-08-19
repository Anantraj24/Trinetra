import { AppSurface, PageHeader } from '@/components/ui';

export default function AuthorityResponders() {
  return (
    <div className="flex-1 p-6 lg:p-12">
      <PageHeader 
        title="Responders" 
        subtitle="Directory of on-ground and medical units." 
      />
      <AppSurface>
        <div className="p-6 text-taupe h-64 flex items-center justify-center">
          Responders Directory Stub
        </div>
      </AppSurface>
    </div>
  );
}
