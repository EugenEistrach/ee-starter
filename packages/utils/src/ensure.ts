/**
 * Type-safe assertion that ensures a condition is true.
 * Throws an error if the condition is false.
 *
 * @param condition - The condition to check
 * @param message - Error message to throw if condition is false
 *
 * @throws {Error} If the condition is false
 */
export function ensure(
  condition: boolean,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
