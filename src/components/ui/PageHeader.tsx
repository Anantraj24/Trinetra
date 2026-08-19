export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-1 px-6 pt-12 pb-6">
      <h1 className="text-3xl font-bold tracking-tight text-taupe-dark">{title}</h1>
      {subtitle && <p className="text-taupe text-lg">{subtitle}</p>}
    </div>
  );
}