import { WorldEvent } from '@scaffold';

/**
 * EffectDidStart and EffectDidEnd event classes.
 *
 * TODO: Implement these classes.
 *
 * Remember:
 *   - Events extend WorldEvent.
 *   - Events carry integer fields, not narrative strings.
 *   - init() populates fields from positional args (trace is always first).
 *   - reset() restores every mutable field to its initial value.
 *
 * The narrative renderer (src/narrative.ts) reads fields directly from your
 * events. It expects:
 *
 *   EffectDidStart: effectType (number), magnitude (number)
 *   EffectDidEnd:   effectType (number)
 */
