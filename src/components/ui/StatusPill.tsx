export function StatusPill({ status, label }: { status: 'success' | 'alert' | 'neutral'; label: string }) {
  const styles = {
    success: 'bg-success-soft text-success',
    alert: 'bg-alert-soft text-alert',
    neutral: 'bg-sand-light text-taupe-dark',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
      {label}
    </span>
  );
}