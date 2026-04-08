/**
 * Parse decimal places input and return validity + value
 * @param input The string input to parse
 * @returns Object containing validation results and parsed value
 */
export const parseDecimalPlaces = (input: string) => {
  const cleanedValue = input.replace(/[^\d]/g, "");
  let numValue = parseInt(cleanedValue, 10);
  if (Number.isNaN(numValue)) {
    numValue = 2;
  }
  return { numValue, cleanedValue };
};

/**
 * Parse multiplier input and return validity + value
 * @param input The string input to parse
 * @returns Object containing validation results and parsed value
 */
export const parseMultiplier = (input: string) => {
  const cleanedValue = input.replace(/[^\d.]/g, "");
  let numValue = parseFloat(cleanedValue);
  if (Number.isNaN(numValue)) {
    numValue = 1;
  }
  return { numValue, cleanedValue };
};
