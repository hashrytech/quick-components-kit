/**
 * Converts a plain JavaScript object into a `FormData` instance.
 *
 * Handles the following value types per key:
 *
 * | Value type | Behaviour |
 * |-----------|-----------|
 * | `undefined` / `null` | Skipped — key is not appended. |
 * | `Blob` / `File` | Appended as-is (preserves binary data and filename). |
 * | `string` / `number` / `boolean` | Converted to string via `.toString()`. |
 * | `Array` | JSON-serialised. Empty arrays are skipped (key omitted). |
 * | Plain object | JSON-serialised. Nested objects are preserved as JSON strings. |
 * | Anything else | Skipped with a `console.warn`. |
 *
 * @param obj - A flat or shallow object whose values will become `FormData` entries.
 * @returns A populated `FormData` instance ready for use in `fetch` or `XMLHttpRequest`.
 *
 * @example
 * ```ts
 * const form = objectToFormData({
 *   name: 'Alice',
 *   age: 30,
 *   active: true,
 *   avatar: fileInput.files[0],       // File appended directly
 *   tags: ['admin', 'user'],          // JSON-serialised array
 *   address: { city: 'London' },      // JSON-serialised object
 *   bio: null,                        // skipped
 * });
 *
 * await fetch('/api/profile', { method: 'POST', body: form });
 * ```
 *
 * @example Sending a file upload with metadata
 * ```ts
 * const form = objectToFormData({ file: myFile, description: 'Profile photo' });
 * await fetch('/upload', { method: 'POST', body: form });
 * ```
 */
export function objectToFormData(obj: Record<string, unknown>): FormData {
  const formData = new FormData();

  // Strips nested plain-object values when JSON-serialising arrays or objects,
  // keeping only primitives, Blobs, and arrays at the top level of each value.
  const replacer = (_key: string, value: unknown) =>
    typeof value === 'object' && value !== null && !Array.isArray(value) ? undefined : value;

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const value = obj[key];

    if (value === undefined || value === null) continue;

    if (value instanceof Blob || value instanceof File) {
      formData.append(key, value);
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      formData.append(key, value.toString());
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        formData.append(key, JSON.stringify(value, replacer));
      }
      // Empty arrays are intentionally skipped — no key is appended
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value, replacer));
    } else {
      console.warn(`objectToFormData: skipped unsupported value for key "${key}"`, value);
    }
  }

  return formData;
}
