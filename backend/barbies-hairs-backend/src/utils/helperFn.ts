/**
 * Deeply clone and normalize any object with potential null prototypes
 */
export default function deepNormalize(input: any): any {
  if (Array.isArray(input)) {
    return input.map(deepNormalize);
  }

  if (
    input &&
    typeof input === 'object' &&
    (Object.getPrototypeOf(input) === null ||
      Object.prototype.toString.call(input) === '[object Object]')
  ) {
    const normalized: Record<string, any> = {};
    for (const key of Object.keys(input)) {
      normalized[key] = deepNormalize(input[key]);
    }
    return normalized;
  }

  return input;
}
