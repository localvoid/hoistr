/**
 * Hoists value to the module scope.
 *
 * @typeparam T Value type.
 * @param v Value.
 * @returns value.
 */
export function hoist<T>(v: T): T {
  return v;
}
