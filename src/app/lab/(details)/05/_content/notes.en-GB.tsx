import {
  Code,
  type Column,
  type Concept,
  type Pitfall,
  type Step,
  type Verification,
} from "@/app/lab/_components";
import type { Flow } from "../_components/FlowDiagram";
import type { CoordinateRow, Unit05Content } from "./types";

const STEPS: Step[] = [
  {
    id: "timeline",
    title: (
      <>
        Design a three-station mini <Code>timeline</Code> with flight and dwell
        segments
      </>
    ),
    done: true,
  },
  {
    id: "station-index",
    title: (
      <>
        Compute <Code>stationIndex</Code> from the timeline
      </>
    ),
    done: true,
  },
  {
    id: "dwell",
    title: "Slow or stop the camera during the dwell segments",
    done: true,
  },
  {
    id: "skip",
    title: "SKIP button: each press reaches one station, with smooth scrolling",
    done: true,
  },
  {
    id: "navigation",
    title:
      "Navigation to any station, switching to immediate when the jump would pass other stations",
    done: true,
  },
];

const BUILD_FLOWS: Flow[] = [
  {
    id: "ranges",
    title: "Timeline",
    steps: [
      { kind: "data", id: "weights", label: "Weights per station" },
      { kind: "fn", id: "build", label: <Code>buildStationRanges</Code> },
      { kind: "data", id: "ranges", label: "Bounds per station" },
    ],
  },
  {
    id: "lut",
    title: "Rail",
    steps: [
      { kind: "data", id: "points", label: "Control points" },
      { kind: "fn", id: "curve", label: <Code>new CatmullRomCurve3</Code> },
      { kind: "data", id: "curve-data", label: "Curve" },
      { kind: "fn", id: "lut-fn", label: <Code>buildRailLUT</Code> },
      { kind: "data", id: "lut", label: "LUT" },
    ],
  },
  {
    id: "rail-positions",
    title: "Station positions on the rail",
    steps: [
      { kind: "data", id: "curve", label: "Curve" },
      {
        kind: "fn",
        id: "positions-fn",
        label: <Code>getStationRailPositions</Code>,
        uses: "+ the stations' control points",
      },
      { kind: "data", id: "positions", label: "u per station" },
    ],
  },
];

const FRAME_FLOWS: Flow[] = [
  {
    id: "camera",
    title: "Camera (RailCamera's useFrame)",
    steps: [
      { kind: "data", id: "progress", label: "progress" },
      {
        kind: "fn",
        id: "rail-fn",
        label: <Code>getRailProgress</Code>,
        uses: "+ bounds, u per station",
      },
      { kind: "data", id: "u", label: "Rail u" },
      {
        kind: "fn",
        id: "camera-fn",
        label: <Code>getCameraState</Code>,
        uses: "+ LUT",
      },
      { kind: "data", id: "state", label: "Position and orientation" },
      { kind: "fn", id: "copy", label: <Code>copy</Code> },
      { kind: "data", id: "camera", label: "Camera" },
    ],
  },
  {
    id: "skip",
    title: "SKIP (click)",
    steps: [
      { kind: "data", id: "progress", label: "progress" },
      {
        kind: "fn",
        id: "skip-fn",
        label: <Code>getSkipDestination</Code>,
        uses: "+ bounds",
      },
      { kind: "data", id: "destination", label: "Destination" },
      { kind: "fn", id: "scroll-fn", label: <Code>scrollToProgress</Code> },
      { kind: "data", id: "lenis", label: "Lenis smooth scroll" },
      { kind: "fn", id: "set-fn", label: <Code>setProgress</Code> },
      { kind: "data", id: "next-progress", label: "progress" },
    ],
  },
  {
    id: "navigation",
    title: "Navigation menu (click)",
    steps: [
      { kind: "data", id: "nav-progress", label: "progress + destination" },
      {
        kind: "fn",
        id: "count-fn",
        label: <Code>countDestinationsBetween</Code>,
        uses: "+ bounds",
      },
      { kind: "data", id: "immediate", label: "immediate" },
      {
        kind: "fn",
        id: "nav-scroll-fn",
        label: <Code>scrollToProgress</Code>,
      },
      { kind: "data", id: "nav-lenis", label: "Lenis scroll or a direct jump" },
    ],
  },
];

const COORDINATE_COLUMNS: Column<CoordinateRow>[] = [
  { key: "name", label: "Coordinate" },
  { key: "meaning", label: "Meaning" },
  { key: "values", label: "Values in it" },
];

const COORDINATE_ROWS: CoordinateRow[] = [
  {
    id: "progress",
    name: "progress",
    meaning: "How far the page has scrolled",
    values: (
      <>
        <Code>progress</Code>, <Code>flightStart</Code>, <Code>flightEnd</Code>,{" "}
        <Code>dwellEnd</Code>
      </>
    ),
  },
  {
    id: "rail",
    name: "Rail u",
    meaning:
      "How far the camera has travelled along the rail (arc-length ratio)",
    values: (
      <>
        <Code>stationRailPositions</Code>, the return value of{" "}
        <Code>getRailProgress</Code>
      </>
    ),
  },
  {
    id: "ratio",
    name: "Ratio",
    meaning: "How much of the flight segment is done; unitless",
    values: (
      <>
        The return value of <Code>smoothstep</Code>, linking the two coordinates
        above
      </>
    ),
  },
];

const CONCEPTS: Concept[] = [
  {
    title: "Write weights, not bounds",
    body: (
      <>
        The data holds only each station's relative weights,{" "}
        <Code>{"{ id, flight, dwell }"}</Code>; the bounds are prefix sums
        divided by the total. Change one station's length and every later bound
        moves with it. Writing bounds directly would mean adjusting every later
        value by hand, inviting overlaps and gaps. The computed bounds are
        derived data, a cache just like the camera's lookup table, so they do
        not break the single source of truth.
      </>
    ),
  },
  {
    title: "as const satisfies",
    body: (
      <>
        <Code>as const</Code> makes the literal deeply readonly and keeps its
        strings as literal types; <Code>satisfies</Code> checks the shape
        without widening the type. Only together can <Code>StationId</Code> be
        derived from the data (
        <Code>{'(typeof STATION_WEIGHTS)[number]["id"]'}</Code>). Type the
        single station's <Code>id</Code> as <Code>string</Code>: using the
        derived union there creates a circular reference.
      </>
    ),
  },
  {
    title: "Half-open intervals",
    body: (
      <>
        Each station covers <Code>[flightStart, dwellEnd)</Code>: a value
        exactly on a bound belongs to the next station, so every point belongs
        to exactly one. A station of length 0 is an empty set and is never
        picked; only the last station has to include 1. The ranges are in order
        and touch end to end, so a scan only needs to compare{" "}
        <Code>dwellEnd</Code>.
      </>
    ),
  },
  {
    title: "From a control point's t to arc length u",
    body: (
      <>
        Control point i sits at <Code>t = i / (n − 1)</Code>, but the camera
        works in the arc-length ratio u. <Code>getLengths()</Code> is a table of
        cumulative arc lengths at even steps of t, and{" "}
        <Code>getUtoTmapping</Code> uses it to turn u into t; reading the same
        table the other way gives the exact inverse. Keep the default number of
        divisions: with any other count, the computed u drifts slightly away
        from the control point.
      </>
    ),
  },
  {
    title: "A full stop while dwelling, smoothstep while flying",
    body: (
      <>
        smoothstep has zero speed at both ends, and so does a dwell segment, so
        the two meet without a jump in speed. While the camera dwells, the
        morphing and the text keep the screen alive, so it never looks stuck. To
        creep forward during a dwell instead, the speed is no longer 0 and a
        different easing is needed.
      </>
    ),
  },
  {
    title: "Look up by id; only the timeline sets the order",
    body: (
      <>
        The stations' control points are a{" "}
        <Code>{"Record<DemoStationId, number>"}</Code>, and their indices are
        looked up by id in timeline order. Add a station to the timeline and
        forget it here, and the build fails; the order of the keys makes no
        difference.
      </>
    ),
  },
  {
    title: "A selector that returns a low-frequency derived value",
    body: (
      <>
        SkipButton uses a selector to derive the SKIP destination from progress.
        The selector runs on every write, but its result changes only when
        crossing into another station, and zustand compares with{" "}
        <Code>Object.is</Code>, so a whole scroll causes only a few re-renders.
        The rule forbids re-rendering every frame; this is the same mechanism as
        the store's <Code>stationIndex</Code>.
      </>
    ),
  },
  {
    title: "useScrollStore.subscribe instead of rAF polling",
    body: (
      <>
        PacingReadout writes <Code>textContent</Code> directly inside the{" "}
        <Code>subscribe</Code> listener. It runs only when the store is written,
        stops when scrolling stops, and never re-renders the component.{" "}
        <Code>subscribe</Code> does not run once straight away, so write the
        initial value with <Code>getState()</Code> on mount.
      </>
    ),
  },
  {
    title: "Decide immediate by the dwell segments passed in full",
    body: (
      <>
        Measuring the distance by index misses jumping to c while flying to b:
        the index is already b and the distance is only 1, yet the jump passes
        all of b's dwell segment. Instead, count the stations whose dwell
        segment lies entirely between from and to. Passing through only part of
        one means leaving the start or reaching the destination, which does not
        count. Comparing only the smaller and larger of the two ends makes
        forward and backward jumps symmetric.
      </>
    ),
  },
  {
    title: "Lab 05 has its own timeline",
    body: (
      <>
        <Code>DEMO_STATION_WEIGHTS</Code> in <Code>_utils/timeline.ts</Code> is
        separate from the real <Code>src/data/timeline.ts</Code>: the functions
        are shared, the numbers are not, so changes to the real timeline leave
        the demo alone. The <Code>DEMO_</Code> prefix keeps auto-import from
        picking the real data. It also means lab 05 cannot read the store's{" "}
        <Code>stationIndex</Code> and computes its own from{" "}
        <Code>DEMO_STATION_RANGES</Code>.
      </>
    ),
  },
];

const PITFALLS: Pitfall[] = [
  {
    title: "getPoints() is not the control points",
    symptom:
      "Switch to a curve with a different number of control points and the stations end up in the wrong places.",
    cause: (
      <>
        <Code>getPoints(divisions)</Code> samples along the curve and returns 6
        points by default; the rail in unit 04 happens to have 6 control points,
        which hid the mistake.
      </>
    ),
    fix: (
      <>
        The control points are in <Code>curve.points</Code>.
      </>
    ),
  },
  {
    title: "SKIP during a flight skips the station being approached",
    symptom: "Pressing SKIP on the way to Mecca jumps straight to Samarkand.",
    cause: (
      <>
        During a flight, <Code>stationIndex</Code> is already the destination,
        so <Code>+ 1</Code> jumps one station too far.
      </>
    ),
    fix: (
      <>
        Search for the first station whose <Code>flightEnd</Code> lies ahead and
        that has a dwell segment. Four <Code>if</Code>s become one{" "}
        <Code>find</Code> (Substitute Algorithm), which also skips stations
        without a dwell segment.
      </>
    ),
  },
  {
    title: "The button's disabled state only updates on click",
    symptom:
      "After reaching the last station with SKIP, scrolling back to the start leaves the button disabled.",
    cause:
      "The disabled state lived in useState and changed only on click, not with the scroll position.",
    fix: "Derive the destination from progress with a selector, so it follows the scroll position.",
  },
  {
    title: "Station markers placed on the control points",
    symptom:
      "The markers are invisible while dwelling, and their labels pile up in the centre of the screen.",
    cause:
      "While dwelling, the camera sits on the control point, so the sphere surrounds the camera and its front cannot be seen from inside.",
    fix: (
      <>
        Get the dwelling position and orientation from{" "}
        <Code>getCameraState</Code>, then push the marker some distance along
        the forward vector (<Code>(0, 0, -1)</Code> with the quaternion
        applied).
      </>
    ),
  },
  {
    title: "3D labels cover the UI",
    symptom:
      "The station and control point labels sit on top of the navigation menu.",
    cause: (
      <>
        drei's <Code>{"<Html>"}</Code> is real DOM, and its default{" "}
        <Code>zIndexRange</Code> of <Code>[16777271, 0]</Code> beats every
        overlay.
      </>
    ),
    fix: (
      <>
        Limit <Code>zIndexRange</Code> to <Code>[10, 0]</Code> and give the
        overlays <Code>z-20</Code>. The real text layer needs the same treatment
        if it uses <Code>{"<Html>"}</Code>.
      </>
    ),
  },
];

const VERIFICATIONS: Verification[] = [
  {
    id: "single-source",
    body: (
      <>
        Change one number in the timeline: the camera, <Code>stationIndex</Code>{" "}
        and the SKIP target all follow, with nothing else to keep in sync.
      </>
    ),
  },
  {
    id: "dwell",
    body: "During a dwell segment, PacingReadout shows the dwell phase and rail u stays fixed; across a flight, u changes slowly at both ends and quickly in the middle.",
  },
  {
    id: "marker",
    body: "While dwelling, the station's ring is a perfect circle in the centre of the screen and does not move for the whole dwell.",
  },
  {
    id: "skip",
    body: "SKIP during a dwell flies to the next station and stops there; SKIP during a flight reaches the station being approached instead of skipping it.",
  },
  {
    id: "skip-disabled",
    body: "SKIP becomes disabled at the last station and comes back after scrolling back by hand.",
  },
  {
    id: "navigation",
    body: "From tangier, mecca flies over smoothly; samarkand, or samarkand while flying to mecca, jumps straight there; from samarkand, mecca flies back smoothly. The current station is shown in gold.",
  },
  {
    id: "tests",
    body: (
      <>
        <Code>pnpm test</Code> passes in full, including{" "}
        <Code>stations.test.ts</Code> and <Code>pacing.test.ts</Code>.
      </>
    ),
  },
];

const CONTENT: Unit05Content = {
  intro: (
    <>
      The timeline holds only each station's relative flight and dwell weights,
      and a pure function turns them into bounds. stationIndex, where the camera
      dwells and where SKIP lands are all looked up from the same data: change
      one number and everything else follows.
    </>
  ),
  demoCaption:
    "As the page scrolls, the camera travels a three-station mini timeline and slows down in the dwell segments.",
  demo: {
    navLabel: "Stations",
    readout: {
      station: "Station",
      phase: "Phase",
      progress: "progress",
      rail: "Rail position u",
      skip: "SKIP destination",
      flight: "Flight",
      dwell: "Dwell",
    },
  },
  steps: STEPS,
  dataFlow: {
    title: "Data flow",
    intro:
      "Only progress changes. Everything else is computed once when the module loads; each frame only looks things up.",
    buildTitle: "Computed once at load",
    frameTitle: "On every change of progress",
    build: BUILD_FLOWS,
    frame: FRAME_FLOWS,
  },
  timeline: {
    title: "The demo timeline",
    intro: (
      <>
        The weights in <Code>_utils/timeline.ts</Code> add up to 33, and each
        bound is the running total divided by that sum. The rail positions come
        from the stations' control points (0, 2, 4); the two flights differ in
        length, so mecca is not at 0.5.
      </>
    ),
    caption:
      "The demo timeline's weights, the bounds derived from them, and the rail positions",
    columns: { station: "Station", rail: "Rail position u" },
  },
  coordinates: {
    title: "Two coordinates",
    intro: (
      <>
        <Code>getRailProgress</Code> turns scrolling into a position on the
        rail: scrolling gives a ratio, and the ratio moves the camera along the
        rail. smoothstep's arguments are all scroll coordinates; both ends of
        the lerp are rail coordinates.
      </>
    ),
    caption: "progress, rail u and the ratio",
    columns: COORDINATE_COLUMNS,
    rows: COORDINATE_ROWS,
  },
  queries: {
    title: "Query functions",
    caption: "Pure functions for the timeline and the camera's pacing",
    columns: {
      fn: "Function",
      file: "File",
      answer: "Question it answers",
      when: "When it is called",
    },
    rows: {
      ranges: {
        answer: "Turns the weights into bounds between 0 and 1",
        when: "Once, when the module loads",
      },
      index: {
        answer: "Which station progress falls in",
        when: "Every time progress is written",
      },
      skip: {
        answer: "Where SKIP lands; null when there is no next station",
        when: "In a selector and on click",
      },
      count: {
        answer: "How many dwell segments a jump passes in full",
        when: "On click",
      },
      "rail-positions": {
        answer: "Each station's u on the rail",
        when: "Once, when the rail is built",
      },
      "rail-progress": {
        answer: "Turns progress into rail u",
        when: "Every frame",
      },
    },
  },
  concepts: CONCEPTS,
  pitfalls: PITFALLS,
  verifications: VERIFICATIONS,
};

export default CONTENT;
