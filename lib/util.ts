export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function clamp(x: number, min: number, max: number): number {
    return Math.min(Math.max(x, min), max);
}

export function invlerp(a: number, b: number, v: number): number {
    return (v - a) / (b - a);
}

export function map(x: number, a1: number, b1: number, a2: number, b2: number): number {
    return lerp(a2, b2, invlerp(a1, b1, x));
}

export function mod(x: number, n: number): number {
    return ((x % n) + n) % n;
}

export function angleLerp(a: number, b: number, t: number): number {
    const diff = mod(b - a, Math.PI * 2);
    return mod(a + diff * clamp(t, 0, 1), Math.PI * 2);
}