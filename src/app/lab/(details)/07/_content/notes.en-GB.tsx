import { Code } from "@/app/lab/_components";
import type { Unit07Content } from "./types";

const content: Unit07Content = {
  intro: (
    <>
      Turns any polyline into a fixed number of points spaced evenly along it.
      Every shape goes through this step first, so that point i can morph into
      point i. The function lives in <Code>src/lib/morph/resample.ts</Code>, and
      this page only demonstrates it.
    </>
  ),
  demoCaption:
    "A polyline with very uneven points, resampled into evenly spaced points, with the sample nearest each source vertex marked.",
  demoLabels: {
    open: "Open",
    closed: "Closed",
    count: "Count",
    legend: {
      vertex: "Source vertex",
      sample: "Sample",
      nearest: "Nearest sample",
    },
  },
  steps: [
    {
      id: "tests",
      title:
        "Write the acceptance criteria as Vitest tests, one set for open curves and one for closed",
      done: true,
    },
    {
      id: "resample",
      title: (
        <>
          Implement <Code>resample(src, count, &#123; closed &#125;)</Code>,
          returning <Code>&#123; points, sourceT &#125;</Code>
        </>
      ),
      done: true,
    },
    {
      id: "nearest-index",
      title: (
        <>
          Implement <Code>getNearestSampleIndex</Code>, converting an arc-length
          fraction into the nearest sample's index
        </>
      ),
      done: true,
    },
    {
      id: "demo",
      title: (
        <>
          Draw the uneven polyline and the samples with{" "}
          <Code>&lt;points&gt;</Code>, with switches for open, closed and the
          count, marking the sample nearest each source vertex
        </>
      ),
      done: true,
    },
  ],
  flowCharts: {
    title: "Flowcharts",
    intro: (
      <>
        Pass the <Code>sourceT</Code> from <Code>resample</Code> to{" "}
        <Code>getNearestSampleIndex</Code> to find the sample for each source
        vertex. Both must get the same <Code>count</Code> and{" "}
        <Code>closed</Code>, or the indices will not line up.
      </>
    ),
    resample: {
      title: "resample",
      labels: {
        start: ["resample(src, count, { closed })"],
        valid: ["Valid input?"],
        error: ["RangeError"],
        table: [
          "① Cumulative lengths, accumulatedDistances",
          "[i + 1] = [i] + length of segment i",
          "Closed: one more, back to vertex 0",
        ],
        positive: ["Total L > 0?"],
        sourceT: ["② sourceT = first n entries ÷ L"],
        spacing: ["spacing = L ÷ gaps", "gaps: count closed, count − 1 open"],
        target: ["③ Sample i: target = i × spacing"],
        beyond: ["target past", "this segment?"],
        nextSegment: ["segment + 1"],
        interpolate: [
          "ratio = position in segment ÷ its length",
          "points[i] = lerp(start, end, ratio)",
        ],
        more: ["More samples?"],
        done: ["return { points, sourceT }"],
        yes: ["yes"],
        no: ["no"],
      },
    },
    nearest: {
      title: "getNearestSampleIndex",
      labels: {
        start: ["getNearestSampleIndex(t, count, opts)"],
        valid: ["Valid input?"],
        error: ["RangeError"],
        index: [
          "gaps: count closed, count − 1 open",
          "index = round(t × gaps)",
        ],
        wrap: ["index === count?"],
        zero: ["return 0", "back to the start"],
        done: ["return index"],
        yes: ["yes"],
        no: ["no"],
      },
    },
  },
  concepts: [
    {
      title: "Why resample",
      body: (
        <>
          Shapes differ in how many points they have and how far apart: a circle
          might have 64, a glyph outline thousands, bunched up on the curves. A
          morph moves point i of A to point i of B, so both need the same count
          and an even spread; otherwise the line bunches up in some places and
          stretches thin in others.
        </>
      ),
    },
    {
      title: "The cumulative length table",
      body: (
        <>
          First work out how far along the line each source vertex is:{" "}
          <Code>accumulatedDistances[0] = 0</Code>,{" "}
          <Code>
            accumulatedDistances[i] = accumulatedDistances[i-1] + |p[i] −
            p[i-1]|
          </Code>
          . The total length L is the last entry of{" "}
          <Code>accumulatedDistances</Code>; a closed curve adds the segment
          from the last point back to the first. Sample k sits at a distance of{" "}
          <Code>k × spacing</Code>: find the segment it falls in and interpolate
          linearly between its ends.
        </>
      ),
    },
    {
      title: "Open and closed curves are spaced differently",
      body: (
        <>
          An open curve is spaced at <Code>L / (count − 1)</Code>, with the
          first and last samples fixed to the source's ends. A closed curve is
          spaced at <Code>L / count</Code>: the last sample does not return to
          the start, as the gap back to it is itself one spacing. That lets the
          start index rotate around the loop, which unit 08's alignment relies
          on.
        </>
      ),
    },
    {
      title: "Sample positions only increase, so no search from the start",
      body: (
        <>
          The target distance grows with k, so the segment it falls in only
          moves forward. One index walking forward makes the whole pass O(n +
          count); searching from the start, or by bisection, for every sample
          makes many more comparisons.
        </>
      ),
    },
    {
      title: "sourceT: keep fractions, convert to indices when needed",
      body: (
        <>
          Evenly spaced samples rarely land on a source vertex.{" "}
          <Code>sourceT</Code> keeps each source vertex's arc-length fraction,{" "}
          <Code>accumulatedDistances[i] / L</Code>, as an exact value, converted
          to the nearest sample only when an index is needed. Locking onto
          stations, lighting up the finale segment by segment and how far{" "}
          <Code>instanceCount</Code> draws all map through it.
        </>
      ),
    },
    {
      title: "Accumulate in 64 bits, convert to Float32Array on write",
      body: (
        <>
          A JS number is a 64-bit float. Compute the cumulative lengths and the
          interpolation with numbers and convert to 32 bits only when writing{" "}
          <Code>points</Code>, so the lengths do not drift as they add up.
        </>
      ),
    },
    {
      title: "The demo uses an orthographic camera",
      body: (
        <>
          A perspective camera makes near things bigger and far things smaller,
          so you cannot judge by eye whether the gaps are equal.{" "}
          <Code>&lt;Canvas orthographic&gt;</Code> has no perspective: distances
          on screen match distances in the scene. <Code>zoom</Code> is the
          number of pixels per world unit, worked out from the pane&apos;s size
          so the shape fits on a phone too; call{" "}
          <Code>camera.updateProjectionMatrix()</Code> after changing it.
        </>
      ),
    },
  ],
  pitfalls: [
    {
      title: "The closed curve leaves out the way back to the start",
      symptom:
        "On a closed curve, the gap from the last point back to the first is wider than the rest, leaving a visible break in the shape.",
      cause:
        "The cumulative length table stops at the last vertex, so the total length L misses the segment back to the first.",
      fix: (
        <>
          A closed curve has <Code>vertexCount</Code> segments, and segment i
          ends at <Code>(i + 1) % vertexCount</Code>, so the last one returns to
          vertex 0.
        </>
      ),
    },
    {
      title: "A repeated vertex turns the interpolation into NaN",
      symptom: (
        <>
          When the source has two identical vertices in a row, the output
          contains <Code>NaN</Code>.
        </>
      ),
      cause:
        "On a zero-length segment, the interpolation ratio divides by zero.",
      fix: (
        <>
          Set the ratio to 0 when the segment has no length. A line with no
          length at all cannot be sampled, so throw a <Code>RangeError</Code>.
        </>
      ),
    },
    {
      title: "The closed curve's index runs past the end",
      symptom: (
        <>
          With <Code>t</Code> close to 1, <Code>getNearestSampleIndex</Code>{" "}
          returns <Code>count</Code>, which is not a valid index.
        </>
      ),
      cause: (
        <>
          <Code>Math.round(t × count)</Code> rounds up to <Code>count</Code>,
          but a closed curve&apos;s last sample does not repeat the start, so
          indices only go up to <Code>count − 1</Code>.
        </>
      ),
      fix: (
        <>
          Index <Code>count</Code> is the way back round to the start, so map it
          to 0.
        </>
      ),
    },
  ],
  verifications: [
    {
      id: "count",
      body: "The output has count points, open or closed.",
    },
    {
      id: "even",
      body: "The points are spaced evenly along the line and never bunch up on short edges.",
    },
    {
      id: "closed-gap",
      body: "On a closed curve, the gap from the last point back to the first equals the spacing between the others.",
    },
    {
      id: "open-ends",
      body: "On an open curve, the first and last points match the source's first and last points.",
    },
    {
      id: "nearest",
      body: "Each source vertex is less than half a spacing from its nearest sample.",
    },
    {
      id: "tests",
      body: (
        <>
          All of the above are Vitest tests, and <Code>pnpm test</Code> passes.
        </>
      ),
    },
  ],
};

export default content;
