/**
 * Tests for the effects system.
 *
 * Starter tests are provided below. You should add more -- edge cases,
 * boundary conditions, and verification that expired effect data is
 * communicated correctly to the caller.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  type ActorID,
  type CommandID,
  type SmiTimestamp,
  EffectType,
  EventType,
  createTransformerContext,
} from '../scaffold';

import {
  createEffects,
  resetEffects,
  applyEffect,
  applyPermanentEffect,
  clearEffect,
  isEffectActive,
  getEffectMagnitude,
  tickEffects,
  type StatusEffects,
} from './effects';
import { EffectDidStart, EffectDidEnd } from './events';
import { renderEffectStart, renderEffectEnd } from '../narrative';

const ACTOR_ID: ActorID = 1;
const TRACE: CommandID = [1, 0, 0, 0];

const NOW_SEC = 1_740_000_060;
const NOW_MS = 500;
const NOW: SmiTimestamp = [NOW_SEC, NOW_MS];

describe('effects data structure', () => {
  let effects: StatusEffects;

  beforeEach(() => {
    effects = createEffects();
  });

  describe('createEffects', () => {
    it('should return a container where all effect types are inactive', () => {
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
      expect(isEffectActive(effects, EffectType.STUNNED)).toBe(false);
    });

    it('should return a new container on each call (no shared state)', () => {
      const a = createEffects();
      const b = createEffects();
      expect(a).not.toBe(b);
      expect(a.slots).not.toBe(b.slots);
    });
  });

  describe('applyEffect', () => {
    it('should make the effect active with the given magnitude', () => {
      const expiry: SmiTimestamp = [NOW_SEC + 30, 0];
      applyEffect(effects, EffectType.POISONED, 5, expiry);
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(true);
      expect(getEffectMagnitude(effects, EffectType.POISONED)).toBe(5);
    });

    it('should not disturb other effect types', () => {
      const expiry: SmiTimestamp = [NOW_SEC + 30, 0];
      applyEffect(effects, EffectType.POISONED, 5, expiry);
      expect(isEffectActive(effects, EffectType.STUNNED)).toBe(false);
      expect(getEffectMagnitude(effects, EffectType.STUNNED)).toBe(0);
    });

    it('should overwrite a previously applied effect', () => {
      applyEffect(effects, EffectType.POISONED, 3, [NOW_SEC + 10, 0]);
      applyEffect(effects, EffectType.POISONED, 9, [NOW_SEC + 20, 0]);
      expect(getEffectMagnitude(effects, EffectType.POISONED)).toBe(9);
    });
  });

  describe('applyPermanentEffect', () => {
    it('should make the effect active with no expiry', () => {
      applyPermanentEffect(effects, EffectType.POISONED, 4);
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(true);
      expect(getEffectMagnitude(effects, EffectType.POISONED)).toBe(4);
      expect(tickEffects(effects, [NOW_SEC + 1_000_000, 0])).toEqual([]);
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(true);
    });
  });

  describe('clearEffect', () => {
    it('should make the effect inactive', () => {
      applyEffect(effects, EffectType.POISONED, 7, [NOW_SEC + 30, 0]);
      clearEffect(effects, EffectType.POISONED);
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
      expect(getEffectMagnitude(effects, EffectType.POISONED)).toBe(0);
    });

    it('should be idempotent on an already-inactive effect', () => {
      clearEffect(effects, EffectType.POISONED);
      clearEffect(effects, EffectType.POISONED);
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
    });

    it('should not disturb other effect types', () => {
      applyEffect(effects, EffectType.POISONED, 1, [NOW_SEC + 30, 0]);
      applyEffect(effects, EffectType.STUNNED, 2, [NOW_SEC + 30, 0]);
      clearEffect(effects, EffectType.POISONED);
      expect(isEffectActive(effects, EffectType.STUNNED)).toBe(true);
      expect(getEffectMagnitude(effects, EffectType.STUNNED)).toBe(2);
    });
  });

  describe('resetEffects', () => {
    it('should make all effects inactive', () => {
      applyEffect(effects, EffectType.POISONED, 1, [NOW_SEC + 30, 0]);
      applyPermanentEffect(effects, EffectType.STUNNED, 2);
      resetEffects(effects);
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
      expect(isEffectActive(effects, EffectType.STUNNED)).toBe(false);
    });
  });
});

describe('tickEffects', () => {
  let effects: StatusEffects;

  beforeEach(() => {
    effects = createEffects();
  });

  it('should not touch inactive effects', () => {
    expect(tickEffects(effects, NOW)).toEqual([]);
  });

  it('should not expire permanent effects', () => {
    applyPermanentEffect(effects, EffectType.POISONED, 3);
    expect(tickEffects(effects, NOW)).toEqual([]);
    expect(isEffectActive(effects, EffectType.POISONED)).toBe(true);
  });

  it('should not expire a timed effect whose expiry is in the future', () => {
    applyEffect(effects, EffectType.POISONED, 5, [NOW_SEC + 30, NOW_MS]);
    expect(tickEffects(effects, NOW)).toEqual([]);
    expect(isEffectActive(effects, EffectType.POISONED)).toBe(true);
  });

  it('should expire a timed effect whose expiry is in the past', () => {
    applyEffect(effects, EffectType.POISONED, 6, [NOW_SEC - 10, 0]);
    const expired = tickEffects(effects, NOW);
    expect(expired).toEqual([{ effectType: EffectType.POISONED, magnitude: 6 }]);
    expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
  });

  it('should expire at the exact boundary (now === expiry)', () => {
    applyEffect(effects, EffectType.POISONED, 4, [NOW_SEC, NOW_MS]);
    const expired = tickEffects(effects, NOW);
    expect(expired).toEqual([{ effectType: EffectType.POISONED, magnitude: 4 }]);
    expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
  });

  it('should handle sub-second precision', () => {
    applyEffect(effects, EffectType.POISONED, 2, [NOW_SEC, NOW_MS + 1]);
    expect(tickEffects(effects, NOW)).toEqual([]);
    expect(isEffectActive(effects, EffectType.POISONED)).toBe(true);
  });

  it('should expire multiple effects in a single tick', () => {
    applyEffect(effects, EffectType.POISONED, 1, [NOW_SEC - 1, 0]);
    applyEffect(effects, EffectType.STUNNED, 2, [NOW_SEC - 2, 999]);
    const expired = tickEffects(effects, NOW);
    expect(expired).toHaveLength(2);
    expect(expired).toContainEqual({ effectType: EffectType.POISONED, magnitude: 1 });
    expect(expired).toContainEqual({ effectType: EffectType.STUNNED, magnitude: 2 });
    expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
    expect(isEffectActive(effects, EffectType.STUNNED)).toBe(false);
  });

  it('returns magnitude snapshot before clearing the slot', () => {
    applyEffect(effects, EffectType.POISONED, 11, [NOW_SEC - 1, 0]);
    const [row] = tickEffects(effects, NOW);
    expect(row.magnitude).toBe(11);
    expect(getEffectMagnitude(effects, EffectType.POISONED)).toBe(0);
  });
});

describe('narrative integration', () => {
  it('should render effect start: "{name} is afflicted with {label} (intensity {n})."', () => {
    const ctx = createTransformerContext();
    ctx.declareEvent(EffectDidStart, TRACE, EffectType.POISONED, 5, ACTOR_ID);
    const [event] = ctx.getDeclaredEventsByType(EventType.EFFECT_DID_START);
    expect(renderEffectStart('Kael', event as EffectDidStart)).toBe(
      'Kael is afflicted with Poison (intensity 5).',
    );
  });

  it('should render effect end: "{label} on {name} has ended."', () => {
    const ctx = createTransformerContext();
    ctx.declareEvent(EffectDidEnd, TRACE, EffectType.POISONED, ACTOR_ID);
    const [event] = ctx.getDeclaredEventsByType(EventType.EFFECT_DID_END);
    expect(renderEffectEnd('Kael', event as EffectDidEnd)).toBe(
      'Poison on Kael has ended.',
    );
  });
});
