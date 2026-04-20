/**
 * Tests for the CLEANSE reducer.
 *
 * Starter tests are provided below. You should add more.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  type ActorID,
  type PlaceID,
  type CommandID,
  EffectType,
  EventType,
  ErrorCode,
  CommandType,
  createTransformerContext,
  type TransformerContext,
  Actor,
  Place,
} from '../scaffold';

// Import your implementations:
// import { CleanseCommand, reducer } from './CLEANSE';
// import { ... } from '../effects/effects';

const ALICE_ID: ActorID = 1;
const PLACE_ID: PlaceID = 10;
const TRACE: CommandID = [1, 0, 0, 0];

describe('CLEANSE reducer', () => {

  // TODO: build a scenario that sets up context, actor, place, and effects.

  it('should clear the target effect and declare EffectDidEnd', () => {
    // Arrange: actor with an active effect
    // Act: execute CLEANSE targeting that effect
    // Assert: effect inactive, one EffectDidEnd event, zero errors
  });

  it('should declare EFFECT_NOT_ACTIVE when the target effect is inactive', () => {
    // Arrange: actor with no active effects
    // Act: execute CLEANSE targeting an effect type
    // Assert: one error with code EFFECT_NOT_ACTIVE, no events
  });

  it('should declare ACTOR_NOT_FOUND when the actor does not exist', () => {
    // Arrange: context with no actors
    // Act: execute CLEANSE
    // Assert: ACTOR_NOT_FOUND error
  });

  it('should always return context (same reference)', () => {
    // Assert: reducer return value === context
  });

  it('should produce an EffectDidEnd event the narrative renderer can consume', () => {
    // Arrange: actor "Mira" with an active effect
    // Act: CLEANSE the effect
    // Assert: feed actor name and event to renderEffectEnd,
    //   output === "{label} on Mira has ended."
  });
});
