
/**
 * Converts a JavaScript object to a FormData object.
 * This is useful for sending data in a format suitable for form submissions, especially when dealing with file uploads.
 *
 * @param {Record<string, any>} obj - The object to convert to FormData.
 * @returns {FormData} - The resulting FormData object.
 */
export function objectToFormData(obj: Record<string, unknown>): FormData {
  const formData = new FormData();

  const replacer = (key: string, value: unknown) =>
    key === 'object' ? undefined : value;

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
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value, replacer));
    } else {
      console.warn(`Skipped unsupported value for key "${key}"`, value);
    }
  }

  return formData;
}
