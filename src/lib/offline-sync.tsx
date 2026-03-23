import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { flushQueue, getPendingCount, isOnline } from './offline-store';
import { toast } from 'sonner';

/**
 * Hook that listens for online/offline events,
 * shows a banner when offline, and syncs queued mutations
 * when connectivity returns.
 */
export function useOfflineSync() {
  const [online, setOnline] = useState(isOnline());
  const [pending, setPending] = useState(getPendingCount());
  const syncing = useRef(false);

  const sync = async () => {
    if (syncing.current || !navigator.onLine) return;
    syncing.current = true;
    const count = await flushQueue(async (table, payload) => {
      const { error } = await supabase.from(table as any).insert(payload as any);
      return !error;
    });
    if (count > 0) {
      toast.success(`Synced ${count} offline record${count > 1 ? 's' : ''}`);
    }
    setPending(getPendingCount());
    syncing.current = false;
  };

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      toast.success('You are back online');
      sync();
    };
    const goOffline = () => {
      setOnline(false);
      toast.warning('You are offline — changes will sync when reconnected');
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    // try sync on mount
    sync();
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // periodically check pending count
  useEffect(() => {
    const interval = setInterval(() => setPending(getPendingCount()), 3000);
    return () => clearInterval(interval);
  }, []);

  return { online, pending };
}
