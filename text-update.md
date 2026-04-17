# TextInput Update Plan

## Scope

This plan covers fixes for `src/lib/components/text-input/TextInput.svelte`.

The current component has five main problems:

1. Debouncing is ineffective because the native `<input>` is directly bound to `value`, so parent state still updates on every keystroke.
2. Declared props such as `onchange` and most `restProps` are not forwarded to the native input.
3. `min` and `max` handling is incorrect for `0`, negative values, and current typed input.
4. `forcePositiveNumber` is too destructive and conflicts with decimal editing.
5. Error display is not wired to accessibility attributes.

## Goals

- Make `debounceDelay` behave predictably.
- Keep controlled and bound usage stable.
- Forward native input attributes and events correctly.
- Make numeric sanitization and range enforcement consistent.
- Add basic accessibility wiring for error state.
- Add tests for the corrected behavior.

## Proposed Fixes

### 1. Fix state ownership and debouncing

- Stop binding the native `<input>` directly to the exported `value`.
- Introduce a local display state, for example `localValue`, that drives the input element.
- Sync `localValue` from external `value` changes when the component is not in the middle of a pending local edit.
- On input:
  - update `localValue` immediately for responsive typing
  - apply non-destructive normalization to the typed value
  - debounce propagation to exported `value`
  - debounce the `onInput` callback using the same resolved value
- Clear any pending timer on destroy.

Recommended implementation direction:

- Use the input's displayed value as `localValue`.
- Treat exported `value` as the committed model value.
- Debounce commits from `localValue` to `value`.
- Flush pending input on `blur` and `change`.

### 2. Forward native attributes and events correctly

- Attach `onchange={onchange}` to the native input if the explicit prop remains part of the API.
- Forward `restProps` to the native input instead of only consuming `restProps.class`.
- Preserve class merging by splitting `class` from the rest of the forwarded props.
- Ensure standard attributes can pass through:
  - `readonly`
  - `maxlength`
  - `autofocus`
  - `aria-*`
  - `data-*`
  - `inputmode`
  - browser validation attributes not already declared

Recommended implementation direction:

- Destructure `class: inputClass` separately from the other props.
- Spread the remaining props onto `<input>`.
- Keep explicit props for the documented API, but let native attributes still pass through.

### 3. Correct numeric range handling

- Validate against the current typed value, not the previous committed `value`.
- Replace truthy checks like `if (max && max > 0)` with null-safe checks such as `if (max !== undefined && max !== null)`.
- Support:
  - `min={0}`
  - `max={0}`
  - negative ranges
  - decimal ranges

Recommended implementation direction:

- Allow temporary out-of-range editing while typing.
- Apply clamping on commit and on blur, not on every keystroke.
- Keep the input permissive during editing so caret movement and partial values are not broken.

### 4. Redesign `forcePositiveNumber`

- Stop coercing empty input to `"1"` during typing.
- Stop stripping all non-digits unconditionally.
- Limit this option to number-like inputs only.

Recommended implementation direction:

- Interpret `forcePositiveNumber` as "positive numeric commit", not "rewrite every keystroke".
- While typing, allow transitional states such as `""`, `"-"`, `"."`, and `"1."` when relevant.
- On commit:
  - reject invalid numeric text
  - clamp to the allowed positive range
  - treat positive decimals as valid values
  - preserve decimals by default and limit them only when `maxDecimalPlaces >= 0`

### 5. Add accessibility wiring for errors

- When `error` exists:
  - set `aria-invalid="true"` on the input
  - render the error text with a stable id
  - attach `aria-describedby` to the input

Recommended implementation direction:

- Use `aria-invalid` plus `aria-describedby`.
- Keep the error text node in the DOM when an error exists, even if the visible styling changes.
- When `showErrorText` is false, keep a visually hidden error description linked to the input.

### 6. Tighten type and API behavior

- `onInput` should receive the committed normalized value, not the raw typed string.
- Normalize the output type for numeric inputs. Right now the component advertises `string | number | null` but internally mostly works with strings.
- Clarify whether this component should ever emit a `number`, or whether callers should parse explicitly.

Recommended implementation direction:

- Emit the committed normalized value to `onInput`.
- Emit strings from the component, even for `type="number"`.
- Keep parsing responsibility with consumers unless there is already a strong library convention to emit numbers.
- If number emission is required, add it as an explicit opt-in rather than inferring from `type`.

## Implementation Order

1. Refactor input state so `localValue` owns the displayed text and debounced commits update exported `value`.
2. Add blur/change commit behavior and cleanup for pending timers.
3. Forward `restProps` and wire `onchange`.
4. Rework numeric normalization, then apply range clamping at commit time.
5. Update `forcePositiveNumber` semantics to be commit-based instead of keystroke-destructive.
6. Add `aria-invalid` and `aria-describedby` wiring for errors.
7. Update prop docs and inline comments to match actual behavior.
8. Add tests for debounce, prop forwarding, numeric behavior, and error accessibility.

## Test Plan

Add component tests that cover at least:

- `bind:value` does not update until the debounce delay elapses.
- External `value` updates resync the displayed input.
- Blur flushes a pending debounced value.
- `onInput` receives the committed normalized value once per commit.
- `onchange` is forwarded and fires.
- Unspecified native props such as `readonly`, `maxlength`, `aria-label`, and `data-*` reach the input.
- `min` and `max` handle `0`, negatives, and decimal ranges correctly.
- `forcePositiveNumber` does not force `"1"` during temporary empty editing.
- `forcePositiveNumber` accepts positive decimals such as `0.5` and `1.25`.
- Error state sets `aria-invalid` and connects the error text with `aria-describedby`.

## Confirmed Decisions

- `debounceDelay` debounces both `onInput` and exported `value`.
- Pending edits flush immediately on `blur` and `change`.
- `min` and `max` clamp only on commit, not on every keystroke.
- `forcePositiveNumber` means positive decimals are valid, as long as the committed numeric value is greater than zero.
- The component emits strings, not numbers.
- When `forcePositiveNumber` is enabled and the field is not required, an empty committed value remains empty instead of being coerced to `1`.
- When `forcePositiveNumber` is enabled and the field is required, an empty committed value remains empty and validation is allowed to fail naturally.
- Invalid numeric text on commit reverts to the last committed valid value.
- If invalid numeric text is committed and there is no previous valid value, the field is cleared.
- Decimal formatting preserves the user's committed trailing zeros up to `maxDecimalPlaces`.
- `forcePositiveNumber` applies only to `type="number"` inputs.
- When `showErrorText={false}`, the error remains exposed to assistive technology through a visually hidden description.
- `onInput` receives the committed normalized string value.

## Outstanding Questions

None for `TextInput.svelte` at this stage. The plan is fully specified for implementation.

## Follow-up

`src/lib/components/text-area/TextArea.svelte` appears to share the same debounce pattern and should be reviewed after `TextInput.svelte` is corrected so the two inputs do not diverge in behavior.
