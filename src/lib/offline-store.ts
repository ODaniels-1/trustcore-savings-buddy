/**
 * Offline data layer — caches Supabase reads in localStorage
 * and queues writes for sync when connectivity returns.
 */

const CACHE_PREFIX = 'tc_cache_';
const QUEUE_KEY = 'tc_offline_queue';

// ---------- helpers ----------

export function isOnline(): boolean {
  return navigator.onLine;
}

// ---------- read cache ----------

export function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    // expire after 7 days
    if (Date.now() - ts > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, ts: Date.now() }),
    );
  } catch {
    // storage full — silently fail
  }
}

// ---------- offline mutation queue ----------

export interface QueuedMutation {
  id: string;
  table: string;
  type: 'insert';
  payload: Record<string, unknown>;
  createdAt: number;
}

function getQueue(): QueuedMutation[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQueue(q: QueuedMutation[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export function enqueue(table: string, payload: Record<string, unknown>): void {
  const q = getQueue();
  q.push({
    id: crypto.randomUUID(),
    table,
    type: 'insert',
    payload,
    createdAt: Date.now(),
  });
  saveQueue(q);
}

export function getPendingCount(): number {
  return getQueue().length;
}

/** Process the offline queue — call when connectivity returns. */
export async function flushQueue(
  insertFn: (table: string, payload: Record<string, unknown>) => Promise<boolean>,
): Promise<number> {
  const q = getQueue();
  if (q.length === 0) return 0;

  let synced = 0;
  const remaining: QueuedMutation[] = [];

  for (const item of q) {
    const ok = await insertFn(item.table, item.payload);
    if (ok) {
      synced++;
    } else {
      remaining.push(item);
    }
  }

  saveQueue(remaining);
  return synced;
}
