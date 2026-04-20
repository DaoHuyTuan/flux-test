/**
 * Status effects system.
 *
 * Design the data representation and implement the functions listed below.
 * The README describes what each function does. You design the signatures.
 *
 * The scaffold (src/scaffold/entity.ts) depends on three exports from this
 * file. Do not rename them or change their arity:
 *
 *   - StatusEffects   (type)
 *   - createEffects() (no arguments, returns StatusEffects)
 *   - resetEffects(effects: StatusEffects): void
 *
 * Everything else -- data layout, field design, parameter lists, return
 * types, helpers -- is yours to design.
 */

import { type EffectType } from './types';

// ---------------------------------------------------------------------------
// Data representation
// ---------------------------------------------------------------------------

// TODO: replace `any` with your effects container type.
export type StatusEffects = any;

// ---------------------------------------------------------------------------
// Creation / reset
// ---------------------------------------------------------------------------

/** Create a new, empty effects container. All effects inactive. */
export const createEffects = (): StatusEffects => {
  // TODO
};

/** Clear all effects in an existing container. */
export const resetEffects = (effects: StatusEffects): void => {
  // TODO
};

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

/** Returns whether the given effect type is currently active. */
// TODO: export const isEffectActive = ...

/** Returns the magnitude of a given effect type. */
// TODO: export const getEffectMagnitude = ...

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/** Applies a timed effect with a given magnitude and expiry. */
// TODO: export const applyEffect = ...

/** Applies a permanent effect (one that never expires). */
// TODO: export const applyPermanentEffect = ...

/** Deactivates a single effect by type. */
// TODO: export const clearEffect = ...

/**
 * Iterate all effects. Clear any timed effect whose expiry has elapsed.
 * The caller (a reducer) needs to know which effects expired and their
 * values at the time of expiry so it can declare events.
 *
 * - Skips inactive effects.
 * - Skips permanent effects.
 * - now >= expiry means the effect has expired.
 */
// TODO: export const tickEffects = ...
