/**
 * Status effects on one actor (poison, stun, etc.).
 *
 * Scaffold (`entity.ts`) must keep exactly these exports — same names, same arity:
 *   - `StatusEffects` type
 *   - `createEffects()`
 *   - `resetEffects(effects)`
 *
 * Real work lives on `StatusEffects`. The `applyEffect(effects, …)` wrappers at the bottom
 * just forward to the class so README/tests stay happy. For flows involving several actors,
 * prefer calling methods on the instance (see DESIGN.md).
 */

import { type SmiTimestamp } from '@scaffold';
import { type EffectType } from './types';
import {
  EFFECT_SLOT_COUNT,
  type EffectSlot,
  emptySlot,
  idx,
  inRange,
  tsGte,
} from './helper';

/** One row from a tick: which type just expired, and its strength before we cleared it. */
export type ExpiredEffect = {
  effectType: EffectType;
  magnitude: number;
};

// --- One actor's full effect bar (data only) ---

export class StatusEffects {
  /** One bucket per effect type; order matches EFFECT_LABELS. */
  readonly slots: EffectSlot[];

  constructor() {
    this.slots = Array.from({ length: EFFECT_SLOT_COUNT }, emptySlot);
  }

  /** Turn everything off (same idea as the `resetEffects` helper). */
  reset(): void {
    for (let i = 0; i < this.slots.length; i += 1) {
      const s = this.slots[i];
      s.active = false;
      s.permanent = false;
      s.magnitude = 0;
      s.expiry[0] = 0;
      s.expiry[1] = 0;
    }
  }

  isEffectActive(effectType: EffectType): boolean {
    if (!inRange(effectType)) return false;
    return this.slots[idx(effectType)].active;
  }

  /** Strength while active; if inactive, treat as 0. */
  getEffectMagnitude(effectType: EffectType): number {
    if (!inRange(effectType)) return 0;
    const s = this.slots[idx(effectType)];
    return s.active ? s.magnitude : 0;
  }

  applyEffect(
    effectType: EffectType,
    magnitude: number,
    expiry: SmiTimestamp,
  ): void {
    if (!inRange(effectType)) return;
    const s = this.slots[idx(effectType)];
    s.active = true;
    s.permanent = false;
    s.magnitude = magnitude;
    s.expiry[0] = expiry[0];
    s.expiry[1] = expiry[1];
  }

  applyPermanentEffect(effectType: EffectType, magnitude: number): void {
    if (!inRange(effectType)) return;
    const s = this.slots[idx(effectType)];
    s.active = true;
    s.permanent = true;
    s.magnitude = magnitude;
  }

  clearEffect(effectType: EffectType): void {
    if (!inRange(effectType)) return;
    const s = this.slots[idx(effectType)];
    s.active = false;
    s.permanent = false;
    s.magnitude = 0;
    s.expiry[0] = 0;
    s.expiry[1] = 0;
  }

  /**
   * Each frame: drop timed effects that are due (skip inactive and permanent).
   * Returns what just expired so the reducer can emit events before state is gone.
   */
  tickEffects(now: SmiTimestamp): readonly ExpiredEffect[] {
    const expired: ExpiredEffect[] = [];
    for (let i = 0; i < this.slots.length; i += 1) {
      const s = this.slots[i];
      if (!s.active || s.permanent) continue;
      if (!tsGte(now, s.expiry)) continue;
      expired.push({ effectType: i as EffectType, magnitude: s.magnitude });
      s.active = false;
      s.permanent = false;
      s.magnitude = 0;
      s.expiry[0] = 0;
      s.expiry[1] = 0;
    }
    return expired;
  }
}

// --- Thin wrappers: README shape, easy to call as `applyEffect(actor.effects, …)` ---

/** Fresh container, nothing running. */
export const createEffects = (): StatusEffects => new StatusEffects();

/** Wipe an existing container (`Actor.reset` calls this). */
export const resetEffects = (effects: StatusEffects): void => {
  effects.reset();
};

/** Is that effect type on right now? */
export const isEffectActive = (
  effects: StatusEffects,
  effectType: EffectType,
): boolean => effects.isEffectActive(effectType);

/** Current strength; off means 0. */
export const getEffectMagnitude = (
  effects: StatusEffects,
  effectType: EffectType,
): number => effects.getEffectMagnitude(effectType);

/** Timed effect: strength + when it ends. */
export const applyEffect = (
  effects: StatusEffects,
  effectType: EffectType,
  magnitude: number,
  expiry: SmiTimestamp,
): void => effects.applyEffect(effectType, magnitude, expiry);

/** Stays on forever (tick won't clear it). */
export const applyPermanentEffect = (
  effects: StatusEffects,
  effectType: EffectType,
  magnitude: number,
): void => effects.applyPermanentEffect(effectType, magnitude);

/** Turn off one effect type. */
export const clearEffect = (
  effects: StatusEffects,
  effectType: EffectType,
): void => effects.clearEffect(effectType);

/** Same as class `tickEffects` — who expired this pass. */
export const tickEffects = (
  effects: StatusEffects,
  now: SmiTimestamp,
): readonly ExpiredEffect[] => effects.tickEffects(now);
