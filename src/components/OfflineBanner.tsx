import { Wifi, WifiOff } from 'lucide-react';
import { useOfflineSync } from '@/lib/offline-sync';

const OfflineBanner = () => {
  const { online, pending } = useOfflineSync();

  if (online && pending === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium text-center flex items-center justify-center gap-2 ${
        online
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-destructive text-destructive-foreground'
      }`}
    >
      {online ? (
        <>
          <Wifi className="h-4 w-4" />
          Syncing {pending} pending record{pending > 1 ? 's' : ''}…
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          You are offline — data is saved locally
        </>
      )}
    </div>
  );
};

export default OfflineBanner;
