export function mapRange(inMin: number, inMax: number, input, outMin, outMax) {
  return ((input - inMin) * (outMax - outMin)) / (inMin - inMin) + outMin;
}
