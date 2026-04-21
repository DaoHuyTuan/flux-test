# Status effects — design notes

## Who owns what

- **`effects.ts`**: holds buff state per actor (`StatusEffects`). Never calls `declareEvent` / `declareError` — README says only reducers touch the context.
- **`events.ts`**: two tiny event classes so the client/log can hear "effect started / ended"; they carry ints, not prose.

## Shape of the data

Each actor keeps a **fixed row of slots**: one slot per `EffectType`, which matches the rule "at most one active row per type". Each slot stores on/off, permanent or not, strength, and expiry as `[seconds, ms]`.

## Free functions vs methods

The README lists top-level ops like `applyEffect(effects, …)`, so we expose thin wrappers that call into the class. **`createEffects`** / **`resetEffects`** stay exactly as `entity.ts` expects.

If you later build flows across **several actors or containers** (copy buff, neighbor auras, …), lean on **instance methods** (or methods that take another `StatusEffects`) instead of giant free functions — keep `WorldEvent` types as dumb facts, not logic.

## Time & tick

"Now" and "expires at" use the same tuple style as `context.timestamp`. Something expires when we've reached or passed that moment (same tick counts). Permanent rows skip expiry.

`tickEffects` returns each row that just turned off, plus its strength **before** we cleared it, so reducers can fire `EffectDidEnd` without re-reading wiped state.

## Reading strength

If a slot is off, magnitude reads as **0** — callers don't need optionals everywhere.

## CLEANSE

Reducer: is that effect on? → if not, error. If yes, `clearEffect` + `EffectDidEnd` (trace + actor).
