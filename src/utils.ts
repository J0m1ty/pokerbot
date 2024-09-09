import { CanvasRenderingContext2D } from "skia-canvas";

/**
 * Linearly maps a number from one range to another.
 */
export const map = (n: number, from1: number, to1: number, from2: number, to2: number) => (n - from1) / (to1 - from1) * (to2 - from2) + from2;

/**
 * Constrains a number between a minimum and maximum value.
 */
export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/**
 * Helper function for drawing a rectangle.
 */
export const rect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fill: any) => {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = fill;
    ctx.fill();
}

/**
 * Helper function for drawing an ellipse.
 */
export const ellipse = (ctx: CanvasRenderingContext2D, x: number, y: number, radiusX: number, radiusY: number, fill?: any, stroke?: true) => {
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    if (stroke) ctx.stroke();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
}

/**
 * Helper function for drawing a quad.
 */
export const quad = (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, fill: any) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
}