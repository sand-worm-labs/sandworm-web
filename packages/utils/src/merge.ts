import { merge as _merge, mergeWith } from "lodash-es";

/**
 * Used to merge objects. If a value is an array, it **replaces** the array instead of merging.
 * @param target - The target object
 * @param source - The source object to merge into target
 */
export const merge: typeof _merge = <T = object>(target: T, source: T) =>
  mergeWith({}, target, source, (obj: any, src: any) => {
    if (Array.isArray(obj)) return src; // If the value is an array, just take the source array
  });
