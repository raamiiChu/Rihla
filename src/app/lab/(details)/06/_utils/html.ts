// drei's <Html> defaults to z-index 16777271, which lifts its labels over
// every DOM overlay on the page. Keeping them in 0–10 lets the overlays,
// stacked above that, stay on top.
export const HTML_Z_INDEX_RANGE: [number, number] = [10, 0];
