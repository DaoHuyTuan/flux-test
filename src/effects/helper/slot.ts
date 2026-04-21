import { type SmiTimestamp } from '@scaffold';
import { type EffectType, EFFECT_LABELS } from '../types';

/** How many slots we have — same count as EFFECT_LABELS. */
export const EFFECT_SLOT_COUNT = EFFECT_LABELS.length;

/** One cell: on/off, runs forever or not, how strong, when it ends. */
export type EffectSlot = {
  active: boolean;
  permanent: boolean;
  magnitude: number;
  expiry: SmiTimestamp;
};

/** Blank cell — for startup or after a full reset. */
export const emptySlot = (): EffectSlot => ({
  active: false,
  permanent: false,
  magnitude: 0,
  expiry: [0, 0],
});

/** Enum value → array index (0, 1, …). */
export const idx = (effectType: EffectType): number => effectType as number;

/** Guard so we never read past the end of the slots array. */
export const inRange = (effectType: EffectType): boolean => {
  const i = idx(effectType);
  return i >= 0 && i < EFFECT_SLOT_COUNT;
};
