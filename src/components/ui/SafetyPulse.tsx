export function SafetyPulse({ status = 'active' }: { status?: 'active' | 'warning' | 'danger' }) {
  const colors = {
    active: 'bg-success',
    warning: 'bg-[#F5A623]',
    danger: 'bg-alert',
  };
  return (
    <div className="relative flex h-4 w-4">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors[status]}`}></span>
      <span className={`relative inline-flex rounded-full h-4 w-4 ${colors[status]}`}></span>
    </div>
  );
}