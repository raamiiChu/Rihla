import { POINT_COUNT } from "./shapes";

/** Radius of the disc each point may scatter within, in shape units. */
const CLOUD_SPREAD = 0.5;

/**
 * One random offset per point, drawn once when the module loads, so the cloud
 * holds still from frame to frame and keeps its shape when the settings
 * change. Uniform over a disc: a random angle, and a radius of
 * `spread × √u` rather than `spread × u`, since a ring's area grows with its
 * radius, and a plain `u` would crowd the points towards the centre. z stays
 * 0, as the demo is flat.
 */
const CLOUD_OFFSETS = (() => {
  const offsets = new Float32Array(POINT_COUNT * 3);

  for (let i = 0; i < POINT_COUNT; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = CLOUD_SPREAD * Math.sqrt(Math.random());

    offsets[i * 3] = radius * Math.cos(angle);
    offsets[i * 3 + 1] = radius * Math.sin(angle);
  }

  return offsets;
})();

export { CLOUD_OFFSETS };
