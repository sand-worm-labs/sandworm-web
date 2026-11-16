export const isEnumValue =
  <E extends Record<string, string>>(values: E) =>
  (value: string): value is E[keyof E] =>
    Object.values(values).some(candidate => candidate === value);
