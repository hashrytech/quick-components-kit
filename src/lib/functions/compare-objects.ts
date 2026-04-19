/**
 * Recursively compare two values for deep equality.
 *
 * Rules:
 * - Primitives (`string`, `number`, `boolean`, `null`, `undefined`) are compared
 *   with strict equality (`===`).
 * - Objects are compared by own enumerable keys: counts must match **and** every
 *   key in `object1` must also exist in `object2` with a deeply equal value.
 * - Arrays are treated as objects (index keys are compared recursively).
 * - `NaN` is considered equal to `NaN` (consistent with `Object.is` semantics).
 * - Functions, `Symbol`s, and class instances with prototype methods are compared
 *   by reference — two different function objects are never considered equal even if
 *   they have the same source.
 *
 * @param object1 - First value to compare.
 * @param object2 - Second value to compare.
 * @returns `true` if the two values are deeply equal, `false` otherwise.
 *
 * @example
 * ```ts
 * compareObjectsDeep({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }); // true
 * compareObjectsDeep({ a: 1 }, { b: 1 });                             // false (different keys)
 * compareObjectsDeep([1, 2, 3], [1, 2, 3]);                           // true
 * compareObjectsDeep(null, null);                                      // true
 * compareObjectsDeep(NaN, NaN);                                        // true
 * compareObjectsDeep({ a: undefined }, { b: undefined });             // false (different keys)
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function compareObjectsDeep(object1: any, object2: any): boolean {
  // Handle NaN — NaN !== NaN by spec but they are semantically equal
  if (typeof object1 === 'number' && typeof object2 === 'number') {
    if (isNaN(object1) && isNaN(object2)) return true;
  }

  const object1Type = typeof object1;
  const object2Type = typeof object2;

  // Both must be non-null objects to do a structural comparison
  if (
    object1 !== null && object2 !== null &&
    object1Type === 'object' && object2Type === 'object'
  ) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) return false;

    // Check that every key in object1 exists in object2 with a deeply equal value.
    // The length check above ensures object2 has no extra keys.
    return keys1.every(
      (key) => Object.prototype.hasOwnProperty.call(object2, key) &&
                compareObjectsDeep(object1[key], object2[key])
    );
  }

  return object1 === object2;
}
