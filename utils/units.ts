
export const toF = (c: number): number => (c * 9 / 5) + 32;
export const toC = (f: number): number => (f - 32) * 5 / 9;

export const formatTemp = (c: number, isImperial: boolean): string => {
  if (isImperial) {
    return `${toF(c).toFixed(1)}°F`;
  }
  return `${c.toFixed(1)}°C`;
};
