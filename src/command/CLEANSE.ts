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
  NO_EFFECT_TYPE,
} from '../scaffold';

// TODO: import your effects functions from '../effects/effects'
// TODO: import your event classes from '../effects/events'

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
 * The reducer core receives pre-validated (context, command, actor, place).
 * It contains only business logic:
 *
 *   1. Check that the target effect is active. If not, declare EFFECT_NOT_ACTIVE.
 *   2. Clear the effect and declare an EffectDidEnd event.
 *   3. Return context.
 */
const reducerCore: NeedsValidatedActorAndPlace<Transformer<CleanseCommand>> = (
  context, command, actor, place,
): TransformerContext => {
  // TODO: implement
  return context;
};

export const reducer: Transformer<CleanseCommand> =
  withCommandType(CommandType.CLEANSE,
    withValidatedActorLocation(
      reducerCore,
    ),
  );
