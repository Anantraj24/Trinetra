export function MetricCard({ title, value, unit, icon: Icon }: { title: string; value: string | number; unit?: string; icon?: React.ElementType }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-sand-light flex flex-col gap-2">
      <div className="flex items-center gap-2 text-taupe font-medium">
        {Icon && <Icon size={18} />}
        {title}
      </div>
      <div className="text-3xl font-bold text-taupe-dark flex items-baseline gap-1">
        {value}
        {unit && <span className="text-lg text-taupe font-medium">{unit}</span>}
      </div>
    </div>
  );
}