/**
 * Scaffold types for the screening exercise.
 *
 * These types are a minimal, self-contained subset of the production codebase.
 * Do not modify this file.
 */

// ---------------------------------------------------------------------------
// Identity types
// ---------------------------------------------------------------------------

export type ActorID = number;
export type PlaceID = number;

/**
 * Command ID -- a 4-element integer tuple used for causal tracing.
 * Treat as opaque; pass through from caller to events/errors.
 */
export type CommandID = [number, number, number, number];

// ---------------------------------------------------------------------------
// Timestamp
// ---------------------------------------------------------------------------

/**
 * Epoch timestamp: [epochSeconds, milliseconds (0--999)].
 */
export type SmiTimestamp = [number, number];

export const createSmiTimestamp = (): SmiTimestamp => [0, 0];

// ---------------------------------------------------------------------------
// Poolable
// ---------------------------------------------------------------------------

export interface Poolable {
  reset(): void;
}

// ---------------------------------------------------------------------------
// Effect types (defined in src/effects/types.ts -- re-exported here)
// ---------------------------------------------------------------------------

export { EffectType, NO_EFFECT_TYPE } from '../effects/types';

// ---------------------------------------------------------------------------
// Command types
// ---------------------------------------------------------------------------

export enum CommandType {
  CLEANSE,
}

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export enum EventType {
  EFFECT_DID_START,
  EFFECT_DID_END,
}

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

export enum ErrorCode {
  ACTOR_NOT_FOUND,
  ACTOR_NOT_FOUND_IN_PLACE,
  PLACE_NOT_FOUND,
  EFFECT_NOT_ACTIVE,
}
