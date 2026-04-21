/**
 * CLEANSE command and reducer.
 *
 * The command removes a status effect from an actor.
 * The reducer composition is provided -- implement the reducer core.
 */

import {
  type EffectType,
  CommandType,
  AbstractCommand,
  type Transformer,
  type NeedsValidatedActorAndPlace,
  withCommandType,
  withValidatedActorLocation,
  type TransformerContext,
  ErrorCode,
  NO_EFFECT_TYPE,
} from '../scaffold';

import { clearEffect, isEffectActive } from '../effects/effects';
import { EffectDidEnd } from '../effects/events';

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export class CleanseCommand extends AbstractCommand<CommandType.CLEANSE> {
  readonly type = CommandType.CLEANSE;
  effectType: EffectType = NO_EFFECT_TYPE;

  reset(): void {
    super.reset();
    this.effectType = NO_EFFECT_TYPE;
  }
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Core bit: wrappers already checked actor + place.
 * Wrong / inactive effect → error. Otherwise strip it and emit EffectDidEnd.
 */
const reducerCore: NeedsValidatedActorAndPlace<Transformer<CleanseCommand>> = (
  context,
  command,
  actor,
  _place,
): TransformerContext => {
  if (!isEffectActive(actor.effects, command.effectType)) {
    return context.declareError(command.id, ErrorCode.EFFECT_NOT_ACTIVE);
  }
  clearEffect(actor.effects, command.effectType);
  return context.declareEvent(
    EffectDidEnd,
    command.id,
    command.effectType,
    actor.id,
  );
};

export const reducer: Transformer<CleanseCommand> =
  withCommandType(
    CommandType.CLEANSE,
    withValidatedActorLocation(
      reducerCore,
    ),
  );
