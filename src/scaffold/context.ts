/**
 * TransformerContext -- the execution environment for all game logic.
 *
 * This is a minimal but functional implementation for the screening exercise.
 * Tests use `createTransformerContext()` to set up a context with a controlled
 * timestamp.
 *
 * Do not modify this file.
 */

import {
  type SmiTimestamp,
  createSmiTimestamp,
  type CommandID,
  type ActorID,
  type PlaceID,
  ErrorCode,
  EventType,
} from './types';
import { WorldEvent } from './event';
import { Actor, Place } from './entity';

// ---------------------------------------------------------------------------
// Execution Error
// ---------------------------------------------------------------------------

export type ExecutionError = {
  trace: CommandID;
  code: ErrorCode;
};

// ---------------------------------------------------------------------------
// World Projection
// ---------------------------------------------------------------------------

export class WorldProjection {
  actors: Map<ActorID, Actor> = new Map();
  places: Map<PlaceID, Place> = new Map();
}

// ---------------------------------------------------------------------------
// TransformerContext
// ---------------------------------------------------------------------------

export class TransformerContext {
  readonly world: WorldProjection;
  readonly timestamp: SmiTimestamp;

  private readonly declaredEvents: WorldEvent[] = [];
  private readonly declaredErrors: ExecutionError[] = [];

  constructor(
    world: WorldProjection,
    timestamp: SmiTimestamp,
  ) {
    this.world = world;
    this.timestamp = timestamp;
  }

  declareEvent(
    EventClass: new () => WorldEvent,
    trace: CommandID,
    a1?: any, a2?: any, a3?: any, a4?: any,
    a5?: any, a6?: any, a7?: any, a8?: any,
  ): this {
    const event = new EventClass();
    event.init(trace, a1, a2, a3, a4, a5, a6, a7, a8);
    event.epoch = this.timestamp[0];
    this.declaredEvents.push(event);
    return this;
  }

  declareError(trace: CommandID, code: ErrorCode): this {
    this.declaredErrors.push({ trace, code });
    return this;
  }

  getDeclaredEvents(): readonly WorldEvent[] {
    return this.declaredEvents;
  }

  getDeclaredErrors(): readonly ExecutionError[] {
    return this.declaredErrors;
  }

  getDeclaredEventsByType(type: EventType): WorldEvent[] {
    return this.declaredEvents.filter((e) => e.type === type);
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export type TransformerContextOptions = {
  /** Epoch seconds for context.timestamp[0]. Default: 1_740_000_060. */
  epochSeconds?: number;
  /** Sub-second milliseconds for context.timestamp[1]. Default: 500. */
  ms?: number;
};

/**
 * Create a TransformerContext for testing.
 *
 * Provides a deterministic timestamp and an empty world.
 */
export const createTransformerContext = (
  options: TransformerContextOptions = {},
): TransformerContext => {
  const { epochSeconds = 1_740_000_060, ms = 500 } = options;
  const timestamp = createSmiTimestamp();
  timestamp[0] = epochSeconds;
  timestamp[1] = ms;
  return new TransformerContext(new WorldProjection(), timestamp);
};
