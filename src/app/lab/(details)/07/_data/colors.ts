import { GOLD_COLOR } from "@/app/lab/const";

// Shared by the scene and the legend, so the two cannot drift apart.
const SOURCE_LINE_COLOR = "#4a4a52";
const VERTEX_COLOR = "#299df0";
const SAMPLE_COLOR = GOLD_COLOR;
// A saturated red-orange, clear of both the blue vertices and the gold samples.
const NEAREST_COLOR = "#f25a2c";

export { NEAREST_COLOR, SAMPLE_COLOR, SOURCE_LINE_COLOR, VERTEX_COLOR };
