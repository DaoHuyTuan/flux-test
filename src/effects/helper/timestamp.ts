import { type SmiTimestamp } from '@scaffold';

/** True if moment `a` is the same time or later than `b` (compare seconds, then ms). */
export const tsGte = (a: SmiTimestamp, b: SmiTimestamp): boolean =>
  a[0] > b[0] || (a[0] === b[0] && a[1] >= b[1]);
