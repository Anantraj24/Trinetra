import { AppSurface, PageHeader } from '@/components/ui';

export default function AuthorityHistory() {
  return (
    <div className="flex-1 p-6 lg:p-12">
      <PageHeader 
        title="History" 
        subtitle="Audit logs and past incidents." 
      />
      <AppSurface>
        <div className="p-6 text-taupe h-64 flex items-center justify-center">
          History Logs Stub
        </div>
      </AppSurface>
    </div>
  );
}
