export const map = (n: number, from1: number, to1: number, from2: number, to2: number) => (n - from1) / (to1 - from1) * (to2 - from2) + from2;

export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);