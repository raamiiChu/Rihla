import { Code } from "@/app/lab/_components";
import type { Unit08Content } from "./types";

const content: Unit08Content = {
  intro: (
    <>
      Morphs a circle into a star without the line twisting or flipping on the
      way. The star lives in <Code>src/lib/shapes/star.ts</Code> and the
      alignment in <Code>src/lib/morph/align.ts</Code>; this page only
      demonstrates them.
    </>
  ),
  demoCaption:
    "A circle and the star {8/3}, resampled to the same count and morphed with a slider, before and after alignment. Half way, the line scatters into a point cloud before gathering into the star.",
  demoLabels: {
    startOffset: "Start offset",
    reversed: "Reversed",
    aligned: "Aligned",
    morph: "Morph",
  },
  steps: [
    {
      id: "star",
      title: (
        <>
          Write <Code>starPolygon(n, k)</Code> with its tests, and draw{" "}
          {"{8/3}"}
        </>
      ),
      done: true,
    },
    {
      id: "morph",
      title:
        "Resample the circle and the star closed to the same count, drive the interpolation with a slider, and watch the twist before aligning",
      done: true,
    },
    {
      id: "align",
      title: (
        <>
          Write <Code>align(a, b)</Code> with its tests: rotate the start index,
          try both directions and keep the smallest total distance
        </>
      ),
      done: true,
    },
    {
      id: "cloud",
      title:
        "Add a stage in between where the line scatters into a noisy point cloud",
      done: true,
    },
  ],
  concepts: [
    {
      title: "A morph interpolates point by point",
      body: (
        <>
          A and B have the same count, and point i sits at{" "}
          <Code>lerp(A[i], B[i], e(t))</Code>. <Code>e</Code> is an easing
          function, so the morph starts and ends gently instead of moving at a
          flat speed.
        </>
      ),
    },
    {
      title: "The star polygon {n/k}",
      body: (
        <>
          Place n points evenly round a circle, start at point 0 and step k
          points at a time: stroke i reaches <Code>(i × k) mod n</Code>. When n
          and k share no factor, one stroke visits all n points.
        </>
      ),
    },
    {
      title: "Why {8/2} is not one stroke",
      body: (
        <>
          Stepping by <Code>(i × 2) mod 8</Code> visits 0, 2, 4, 6, 0, 2, 4, 6:
          it is back at the start after four steps, and 1, 3, 5 and 7 are never
          reached. In general, with d = gcd(n, k), every n / d steps return to
          the start having visited only n / d points, so it takes d strokes,
          each a {"{(n/d)/(k/d)}"}. {"{8/2}"} is two squares {"{4/1}"} turned
          45° apart, and {"{6/2}"} is two triangles. That is why{" "}
          <Code>starPolygon</Code> requires <Code>gcd(n, k) === 1</Code>: with d
          above 1, following the formula only goes round one small shape again
          and again, and once <Code>resample</Code> takes it, the same stretch
          of line is sampled twice and the points pile up.
        </>
      ),
    },
    {
      title: "A mismatched start or direction twists or flips the morph",
      body: "Where a closed shape starts, and which way it runs, are arbitrary. With different starts, every point travels part of the way round, and the line looks wrung; with opposite directions, points cut through the centre to the far side, and the shape looks turned over.",
    },
    {
      title: "Rotate the start index, try both directions",
      body: (
        <>
          Rotate A&apos;s start by s places and work out{" "}
          <Code>Σ |A[(i + s) mod N] − B[i]|</Code>. Try every s, then again with
          A reversed, 2N candidates in all, and keep the smallest. Only a closed
          sample can rotate like this: its last point does not repeat the first,
          so the spacing stays even. That is 2N × N work, done once at set-up.
        </>
      ),
    },
    {
      title: "Observed: what offset and reversal do",
      body: (
        <>
          The eight tips of {"{8/3}"} trace the points&apos; paths. Unaligned,
          an offset of ⅛ wrings the whole line, and ¼ doubles the shift;
          reversed, half the points cut through the centre. With alignment on,
          all six settings (three offsets × two directions) come back to the
          same order, the same as offset 0 reversed: four points stay still and
          four cross the centre, a smaller total than the forward order&apos;s
          two still, two crossing and four sliding along chords.
        </>
      ),
    },
    {
      title: "Different winding counts leave crossings alignment cannot remove",
      body: (
        <>
          The circle goes round once; the stroke of {"{8/3}"} goes round three
          times before it closes, so at the same fraction of their length the
          two sit at different angles. <Code>align</Code> can only pick the
          start and direction with the smallest total distance, and the smallest
          total is not the same as the best-looking: some points still cross the
          centre once aligned. Morphing the route into calligraphy will meet the
          same limit; it is a limit of the method, not a bug.
        </>
      ),
    },
    {
      title: "A morph needs three arrays: from, to and output",
      body: (
        <>
          From (the reordered circle) is recomputed with <Code>useMemo</Code>{" "}
          only when the settings change; to (the star) never changes; output is
          made once with <Code>useMemo(..., [])</Code>, and it is the only one
          written to and bound to the GPU. Each frame, <Code>useFrame</Code>{" "}
          writes <Code>lerp(from[i], to[i], e)</Code> into output and sets{" "}
          <Code>needsUpdate</Code>. The tip markers read the same output,
          copying it into their own buffer with <Code>set</Code> and{" "}
          <Code>subarray</Code> rather than working it out again.
        </>
      ),
    },
    {
      title: "Values that change many times a second live in a ref",
      body: (
        <>
          The slider&apos;s <Code>onValueChange</Code> only writes{" "}
          <Code>morphProgressRef.current</Code>, so dragging re-renders nothing,
          and <Code>useFrame</Code> reads it each frame: the same rule as
          reading <Code>progress</Code> with <Code>getState()</Code> on the
          site.
        </>
      ),
    },
    {
      title: "One interpolation becomes two: A → cloud C → B",
      body: (
        <>
          <Code>CLOUD_PROGRESS</Code> splits progress in two: A → C, then C → B.
          Each half rescales progress to its own 0 to 1 (an inverse lerp) before
          easing, and <Code>MathUtils.smoothstep(x, min, max)</Code> does both
          at once. One branch picks from, to, min and max together, so there is
          a single lerp loop; swapping from and to only moves references, so
          doing it every frame allocates nothing. At the seam the first
          half&apos;s eased value is 1 and the second&apos;s is 0, both landing
          on C, so nothing jumps.
        </>
      ),
    },
    {
      title: "The cloud is drawn once, evenly over a disc",
      body: (
        <>
          Point i of C is the midpoint of A[i] and B[i] plus random offset i, so
          the cloud still hints at the shapes. The offsets are drawn once when
          the module loads: drawing them every frame would flicker, and at
          module level the cloud keeps its scatter when the settings change. An
          even spread over a disc takes a random angle and a radius of{" "}
          <Code>spread × √u</Code>: a ring&apos;s length grows with its radius,
          so the outer rings need more points, and a plain <Code>u</Code> crowds
          them towards the centre.
        </>
      ),
    },
    {
      title: "Cross-fading the line and the points",
      body: (
        <>
          Scattered points joined in order make a tangle, so the cloud is drawn
          with <Code>&lt;points&gt;</Code> instead. Here <Code>lineLoop</Code>{" "}
          and the points are both plain position arrays and can share output
          (each is its own <Code>BufferAttribute</Code>, so both need{" "}
          <Code>needsUpdate</Code>); on the site, <Code>Line2</Code> is
          interleaved and cannot. How far the points have scattered is eased in
          the first half and <Code>1 − eased</Code> in the second, remapped with{" "}
          <Code>smoothstep(scatter, 0, FADE_END)</Code> onto a narrower range,
          so the hand-off is over just as the points begin to spread.{" "}
          <Code>transparent</Code> is fixed in the JSX; <Code>opacity</Code> is
          a uniform, written every frame without <Code>needsUpdate</Code>.
        </>
      ),
    },
    {
      title: "Measure before optimising",
      body: (
        <>
          <Code>Math.hypot</Code> rescales to avoid overflow and runs about ten
          times slower than <Code>Math.sqrt(dx ** 2 + …)</Code>; coordinates
          near ±1 cannot overflow, so <Code>sqrt</Code> will do (
          <Code>** 2</Code> is as fast as <Code>x * x</Code>). On the other
          hand, scoring candidates by index without building arrays was slower
          than building them when every point wrapped with <Code>%</Code>; it
          only became two to four times faster once it wrapped with an{" "}
          <Code>if</Code>. <Code>align</Code> is O(N²), and at N = 512 every
          version takes tens of milliseconds, so decide by measuring once{" "}
          <Code>POINT_COUNT</Code> is settled.
        </>
      ),
    },
  ],
  pitfalls: [
    {
      title: "Calling the function under test in describe leaves no tests",
      symptom: (
        <>
          While <Code>starPolygon</Code> was a stub, Vitest reported no tests.
        </>
      ),
      cause: (
        <>
          A <Code>describe</Code> callback runs while Vitest collects the tests;
          the stub threw there, and the whole file failed to collect.
        </>
      ),
      fix: (
        <>
          Keep <Code>describe</Code> to declarations, and call the function
          under test in <Code>it</Code> or <Code>beforeAll</Code>.
        </>
      ),
    },
    {
      title: "Reversing the array outright moves the start too",
      symptom:
        "Reversed, the morph both flipped and twisted, and there was no telling which caused what.",
      cause:
        "Reversing the whole array makes the old last point the new point 0, changing the start as well as the direction.",
      fix: (
        <>
          Take point <Code>(n − i) mod n</Code> for point i, so point 0 stays
          put and only the direction changes.
        </>
      ),
    },
    {
      title: "useFrame in the component that renders the Canvas",
      symptom: "It throws: Hooks can only be used within the Canvas component.",
      cause: (
        <>
          <Code>useFrame</Code> needs the context <Code>&lt;Canvas&gt;</Code>{" "}
          provides, and the component rendering <Code>&lt;Canvas&gt;</Code> is
          not inside it.
        </>
      ),
      fix: (
        <>
          Move the line into a child component (<Code>MorphLine</Code>) and call{" "}
          <Code>useFrame</Code> there.
        </>
      ),
    },
    {
      title: "Without useMemo, every render replaces the attribute",
      symptom:
        "It looks fine, but changing a setting rebuilds the position attribute.",
      cause: (
        <>
          The component body runs on every render and makes a new{" "}
          <Code>Float32Array</Code>; when{" "}
          <Code>&lt;bufferAttribute args&gt;</Code> changes, R3F throws the old
          attribute away and builds another.
        </>
      ),
      fix: (
        <>
          Make it once with{" "}
          <Code>useMemo(() =&gt; new Float32Array(...), [])</Code> and only
          change its contents each frame.
        </>
      ),
    },
    {
      title: "Past half way, the cloud snapped back into a tangle",
      symptom:
        "Once progress passed 0.5, the points were still scattered but the line was suddenly opaque again.",
      cause: (
        <>
          <Code>easedProgress</Code> was used as the scatter amount. In the
          second half it runs from 0 to 1 while the scatter runs from 1 back to
          0, so it dropped from 1 to 0 at the seam.
        </>
      ),
      fix: (
        <>
          Branch on <Code>isScattering</Code> and use{" "}
          <Code>1 − easedProgress</Code> in the second half.
        </>
      ),
    },
    {
      title: "The shadcn Slider drew two thumbs for a single value",
      symptom: (
        <>
          <Code>defaultValue={"{0}"}</Code> drew a range picker.
        </>
      ),
      cause:
        "The generated component only counted thumbs from an array value; a number fell through to [min, max].",
      fix: (
        <>
          Extract <Code>countThumbs</Code>: one thumb for a number, one per
          entry for an array, and two only when there is no value at all.
        </>
      ),
    },
  ],
  verifications: [
    {
      id: "no-twist",
      body: "Once aligned, the line neither twists nor flips during the morph.",
    },
    {
      id: "8-2",
      body: "You can explain why {8/2} is not a single stroke.",
    },
    {
      id: "cloud",
      body: "Dragged through the middle, the line fades into a still point cloud and gathers into the star, with no jump at the seam and no tangle on show.",
    },
    {
      id: "tests",
      body: (
        <>
          Tests: <Code>starPolygon</Code>&apos;s point count and that it closes;
          after <Code>align</Code>, the total distance to the target is no more
          than before, nor than matching in reverse. <Code>pnpm test</Code>{" "}
          passes.
        </>
      ),
    },
  ],
};

export default content;
