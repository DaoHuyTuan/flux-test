/**
 * All effect kinds we know about. README asks for at least POISONED.
 */

export enum EffectType {
  POISONED = 0,
  STUNNED = 1,
}

/** Command didn't pick a type yet. */
export const NO_EFFECT_TYPE = -1 as EffectType;

/**
 * Human-readable names for the UI. narrative.ts does `EFFECT_LABELS[type]`.
 * Keep array order in sync with the enum numbers (0, 1, …).
 */
export const EFFECT_LABELS: readonly string[] = ['Poison', 'Stun'];
