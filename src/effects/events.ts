import {
  WorldEvent,
  EventType,
  type CommandID,
  type ActorID,
} from '@scaffold';
import { type EffectType, NO_EFFECT_TYPE } from './types';

/**
 * "An effect just started" — just numbers for the client (see narrative.ts).
 * No game rules here; the reducer builds this and hands it to the context.
 */
export class EffectDidStart extends WorldEvent {
  readonly type = EventType.EFFECT_DID_START;
  effectType: EffectType = NO_EFFECT_TYPE;
  magnitude: number = 0;

  init(
    trace: CommandID,
    effectType: EffectType,
    magnitude: number,
    actor: ActorID = 0,
  ): this {
    this.trace = trace;
    this.effectType = effectType;
    this.magnitude = magnitude;
    this.actor = actor;
    this.target = 0;
    this.location = 0;
    this.epoch = 0;
    this.sequence = 0;
    return this;
  }

  reset(): void {
    super.reset();
    this.effectType = NO_EFFECT_TYPE;
    this.magnitude = 0;
  }
}

/**
 * "An effect just ended" — client reads `effectType` and prints text.
 */
export class EffectDidEnd extends WorldEvent {
  readonly type = EventType.EFFECT_DID_END;
  effectType: EffectType = NO_EFFECT_TYPE;

  init(trace: CommandID, effectType: EffectType, actor: ActorID = 0): this {
    this.trace = trace;
    this.effectType = effectType;
    this.actor = actor;
    this.target = 0;
    this.location = 0;
    this.epoch = 0;
    this.sequence = 0;
    return this;
  }

  reset(): void {
    super.reset();
    this.effectType = NO_EFFECT_TYPE;
  }
}
