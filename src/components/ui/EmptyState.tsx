import { FileQuestion } from 'lucide-react';
export function EmptyState({ title, description, icon: Icon = FileQuestion }: { title: string; description: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-sand-light/30 rounded-3xl border border-dashed border-sand">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-taupe mb-4 shadow-sm">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-semibold text-taupe-dark mb-1">{title}</h3>
      <p className="text-taupe">{description}</p>
    </div>
  );
}