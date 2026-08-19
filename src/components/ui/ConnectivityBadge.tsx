import { Wifi, WifiOff } from 'lucide-react';
export function ConnectivityBadge({ isOffline }: { isOffline: boolean }) {
  if (!isOffline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-soft text-success text-xs font-semibold">
        <Wifi size={14} /> ONLINE
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-alert-soft text-alert text-xs font-semibold">
      <WifiOff size={14} /> OFFLINE
    </div>
  );
}