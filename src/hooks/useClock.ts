import { useEffect, useState } from 'react';

export function useClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  const yearStr = now.getFullYear();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return { now, timeStr, dateStr, yearStr, timezone };
}

export function useRelativeTime(timestamp: string): string {
  const [rel, setRel] = useState('');

  useEffect(() => {
    function compute() {
      const diff = (Date.now() - new Date(timestamp).getTime()) / 1000;
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) {
        const h = Math.floor(diff / 3600);
        return `${h}h ago`;
      }
      const d = Math.floor(diff / 86400);
      if (d === 1) return 'Yesterday';
      if (d < 7) return `${d} days ago`;
      return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
    setRel(compute());
    const iv = setInterval(() => setRel(compute()), 30000);
    return () => clearInterval(iv);
  }, [timestamp]);

  return rel;
}
