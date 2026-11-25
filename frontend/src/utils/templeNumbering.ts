import { Temple } from '../types';

/**
 * Computes deterministic 1-based temple numbers ordered chronologically from oldest createdAt -> newest.
 * Tie-breaks deterministically by id so existing numbers (#1..#16) stay stable as catalog grows to 750+.
 * Pure read-only derivation: never mutates temple objects or modifies stored database records.
 */
export function buildTempleNumberMap(temples: Temple[]): Map<string, number> {
  const map = new Map<string, number>();
  if (!Array.isArray(temples) || temples.length === 0) {
    return map;
  }

  const sortedOldestFirst = [...temples].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    const safeA = Number.isFinite(timeA) ? timeA : 0;
    const safeB = Number.isFinite(timeB) ? timeB : 0;
    if (safeA !== safeB) {
      return safeA - safeB;
    }
    return (a.id || '').localeCompare(b.id || '');
  });

  sortedOldestFirst.forEach((temple, index) => {
    if (temple?.id) {
      map.set(temple.id, index + 1);
    }
  });

  return map;
}
