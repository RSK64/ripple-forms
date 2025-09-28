/**
 * Path<T>
 * Generates valid form paths using dot + dot-bracket notation:
 *   "username"
 *   "addresses"
 *   "addresses.[0]"
 *   "addresses.[0].street"
 */
export type Path<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: T[K] extends (infer U)[]
        ? | `${K}`
          | `${K}.[${number}]`
          | `${K}.[${number}].${Path<U>}`
        : T[K] extends object
          ? `${K}` | `${K}.${Path<T[K]>}`
          : `${K}`;
    }[keyof T & (string | number)]
  : never;
