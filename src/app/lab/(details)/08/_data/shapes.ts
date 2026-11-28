import { getNearestSampleIndex, resample } from "@/lib/morph/resample";
import { starPolygon } from "@/lib/shapes/star";

export const POINT_COUNT = 512;

const CIRCLE = starPolygon(POINT_COUNT, 1);
const CIRCLE_RESAMPLED = resample(CIRCLE, POINT_COUNT, {
  closed: true,
});

const STAR = starPolygon(8, 3);
const STAR_RESAMPLED = resample(STAR, POINT_COUNT, {
  closed: true,
});

export const SHAPES = {
  CIRCLE: CIRCLE_RESAMPLED.points,
  STAR: STAR_RESAMPLED.points,
};

/**
 * The samples sitting on the star's tips, in stroke order: each source vertex
 * of {8/3} is a tip, and sourceT says where it landed after resampling.
 */
export const STAR_TIP_INDICES = Array.from(STAR_RESAMPLED.sourceT, (t) =>
  getNearestSampleIndex(t, POINT_COUNT, { closed: true }),
);
