
/**
 * Converts a JavaScript object to a FormData object.
 * This is useful for sending data in a format suitable for form submissions, especially when dealing with file uploads.
 *
 * @param {Record<string, any>} obj - The object to convert to FormData.
 * @returns {FormData} - The resulting FormData object.
 */
export function objectToFormData(obj: Record<string, unknown>): FormData {
  const formData = new FormData();

  const replacer = (key: string, value: unknown) => {
    if (key === 'object') return undefined;
    return value;
  };

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const value = obj[key];

    if (value === undefined) continue;

    if (value instanceof Blob || value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      formData.append(key, value.toString());
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item === undefined) return;

        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          formData.append(`${key}[${index}]`, item.toString());
        } else if (typeof item === 'object' && item !== null) {
          formData.append(`${key}[${index}]`, JSON.stringify(item, replacer));
        } else {
          console.warn(`Skipped unsupported array item at ${key}[${index}]:`, item);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value, replacer));
    } else {
      console.warn(`Skipped unsupported value for key "${key}":`, value);
    }
  }

  return formData;
}
