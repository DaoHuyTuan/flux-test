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
  type SmiTimestamp,
  EffectType,
  EventType,
  ErrorCode,
  createTransformerContext,
  type TransformerContext,
  Actor,
  Place,
} from '../scaffold';

import { applyEffect, isEffectActive } from '../effects/effects';
import { CleanseCommand, reducer } from './CLEANSE';
import { EffectDidEnd } from '../effects/events';
import { renderEffectEnd } from '../narrative';

const ALICE_ID: ActorID = 1;
const PLACE_ID: PlaceID = 10;
const TRACE: CommandID = [1, 0, 0, 0];

const buildWorld = (): TransformerContext => {
  const context = createTransformerContext();
  const place = new Place().init(PLACE_ID);
  const actor = new Actor().init(ALICE_ID, 'Alice', PLACE_ID);
  context.world.places.set(PLACE_ID, place);
  context.world.actors.set(ALICE_ID, actor);
  return context;
};

describe('CLEANSE reducer', () => {
  let context: TransformerContext;
  let actor: Actor;

  beforeEach(() => {
    context = buildWorld();
    actor = context.world.actors.get(ALICE_ID)!;
  });

  it('should clear the target effect and declare EffectDidEnd', () => {
    const expiry: SmiTimestamp = [1_740_000_200, 0];
    applyEffect(actor.effects, EffectType.POISONED, 5, expiry);

    const command = new CleanseCommand();
    command.id = TRACE;
    command.actor = ALICE_ID;
    command.location = PLACE_ID;
    command.effectType = EffectType.POISONED;

    reducer(context, command);

    expect(context.getDeclaredErrors()).toHaveLength(0);
    expect(isEffectActive(actor.effects, EffectType.POISONED)).toBe(false);
    const ends = context.getDeclaredEventsByType(EventType.EFFECT_DID_END);
    expect(ends).toHaveLength(1);
    expect(ends[0]).toBeInstanceOf(EffectDidEnd);
    expect((ends[0] as EffectDidEnd).effectType).toBe(EffectType.POISONED);
    expect((ends[0] as EffectDidEnd).trace).toEqual(TRACE);
    expect((ends[0] as EffectDidEnd).actor).toBe(ALICE_ID);
  });

  it('should declare EFFECT_NOT_ACTIVE when the target effect is inactive', () => {
    const command = new CleanseCommand();
    command.id = TRACE;
    command.actor = ALICE_ID;
    command.location = PLACE_ID;
    command.effectType = EffectType.POISONED;

    reducer(context, command);

    expect(context.getDeclaredErrors()).toEqual([
      { trace: TRACE, code: ErrorCode.EFFECT_NOT_ACTIVE },
    ]);
    expect(context.getDeclaredEvents()).toHaveLength(0);
  });

  it('should declare ACTOR_NOT_FOUND when the actor does not exist', () => {
    const empty = createTransformerContext();
    const place = new Place().init(PLACE_ID);
    empty.world.places.set(PLACE_ID, place);

    const command = new CleanseCommand();
    command.id = TRACE;
    command.actor = ALICE_ID;
    command.location = PLACE_ID;
    command.effectType = EffectType.POISONED;

    reducer(empty, command);

    expect(empty.getDeclaredErrors()).toEqual([
      { trace: TRACE, code: ErrorCode.ACTOR_NOT_FOUND },
    ]);
  });

  it('should always return context (same reference)', () => {
    const command = new CleanseCommand();
    command.id = TRACE;
    command.actor = ALICE_ID;
    command.location = PLACE_ID;
    command.effectType = EffectType.POISONED;

    expect(reducer(context, command)).toBe(context);
  });

  it('should produce an EffectDidEnd event the narrative renderer can consume', () => {
    const expiry: SmiTimestamp = [1_740_000_200, 0];
    applyEffect(actor.effects, EffectType.POISONED, 3, expiry);

    const command = new CleanseCommand();
    command.id = TRACE;
    command.actor = ALICE_ID;
    command.location = PLACE_ID;
    command.effectType = EffectType.POISONED;

    reducer(context, command);

    const [event] = context.getDeclaredEventsByType(EventType.EFFECT_DID_END);
    expect(renderEffectEnd('Mira', event as EffectDidEnd)).toBe('Poison on Mira has ended.');
  });
});
