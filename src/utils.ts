/**
 * Linearly maps a number from one range to another.
 */
export const map = (n: number, from1: number, to1: number, from2: number, to2: number) => (n - from1) / (to1 - from1) * (to2 - from2) + from2;

/**
 * Constrains a number between a minimum and maximum value.
 */
export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);