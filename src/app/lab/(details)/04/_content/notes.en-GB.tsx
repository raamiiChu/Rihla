import {
  Code,
  type Concept,
  type Pitfall,
  type Step,
  type Verification,
} from "@/app/lab/_components";
import type { Unit04Content } from "./types";

const STEPS: Step[] = [
  {
    id: "curve",
    title: (
      <>
        Build a <Code>CatmullRomCurve3</Code> through 8 control points and draw
        it as a thin line
      </>
    ),
    done: true,
  },
  {
    id: "control-points",
    title:
      "Put a small sphere on each control point and check the line passes through every one",
    done: true,
  },
  {
    id: "lut",
    title: (
      <>
        <Code>buildRailLUT</Code>: sample by arc length and store the result in
        a <Code>Float32Array</Code>
      </>
    ),
    done: true,
  },
  {
    id: "camera-state",
    title: (
      <>
        <Code>getCameraState</Code>: interpolate, then apply the result to the
        camera in <Code>useFrame</Code>
      </>
    ),
    done: true,
  },
  {
    id: "parallel-transport",
    title:
      "Add a vertical section to watch the camera flip, then fix it with parallel transport",
    done: true,
  },
  {
    id: "levelling",
    title:
      "Pull up back towards world up on level stretches (levelling), while keeping the camera upside down at the top of the loop",
    done: true,
  },
  {
    id: "tests",
    title: (
      <>
        Required tests: the start, the end and up continuity of{" "}
        <Code>getCameraState</Code>
      </>
    ),
    done: true,
  },
];

const LEVELLING: Concept[] = [
  {
    title: "Why levelling is needed: holonomy",
    body: (
      <>
        Carrying a direction along a path that does not lie in one plane leaves
        a residual rotation once the path is level again.{" "}
        <Code>LOOP_CURVE</Code> shifts in x and twists through space, so after
        pure parallel transport the horizon comes out of the loop tilted by
        about 41°; a loop lying entirely in one plane leaves none.
      </>
    ),
  },
  {
    title:
      "The approach: nudge towards the most upright direction at each step",
    body: (
      <>
        After transporting and applying Gram–Schmidt, work out the target (
        <Code>WORLD_UP</Code> made perpendicular to the tangent with{" "}
        <Code>makePerpendicular</Code>: the direction perpendicular to the
        tangent that points most upwards), then{" "}
        <Code>up.lerp(target, weight).normalize()</Code>. The weight is the
        product of three factors (distance, the vertical gate and the upright
        gate), so if any one of them is 0 there is no levelling. Since up and
        target are both perpendicular to the tangent, the lerp stays in that
        same perpendicular plane and needs no further projection.{" "}
        <Code>getCameraState</Code> does not change at all: the orientation is
        settled when the table is built.
      </>
    ),
  },
  {
    title: "A rate based on arc length: exponential decay",
    body: (
      <>
        One <Code>up.lerp(target, w)</Code> leaves (1 − w) of the tilt; n steps
        leave (1 − w)ⁿ, and when the path is split into stretches, the fractions
        left by each stretch multiply. Only a power turns "distances add" into
        "fractions multiply", so each step uses{" "}
        <Code>1 − Math.exp(−rate × stepLength)</Code>, and after a distance d
        the tilt left is <Code>e^(−rate × d)</Code>. With an exponential, two
        half steps have exactly the effect of one full step, so on distance
        alone the result does not depend on the sample count (with the gates it
        is an approximation; see "Gates outside the exponent are an
        approximation"). Written as "level 1% per sample", the exits of 1024 and
        256 samples differed by 16.6°. A rate of 0.1 leaves about 37% of the
        tilt every 10 units. The LUT is evenly spaced by arc length, so the step
        length is computed once, outside the loop:{" "}
        <Code>curve.getLength() / (samples - 1)</Code>.
      </>
    ),
  },
  {
    title: "Half distance: ln 2 ÷ rate",
    body: (
      <>
        The tilt halves when <Code>e^(−rate × d) = 0.5</Code>, which gives{" "}
        <Code>d = ln 2 ÷ rate</Code>. ln 2 ≈ 0.693 is the power of e that gives
        2 (<Code>Math.LN2</Code>). With a rate of 0.1 the tilt halves roughly
        every 6.93 units; <Code>LOOP_CURVE</Code> is about 173 long, so that is
        about 25 halvings. The base can change:{" "}
        <Code>1 − 0.5 ** (stepLength / halfDistance)</Code> is exactly
        equivalent to the current code, provided{" "}
        <Code>rate = ln 2 ÷ halfDistance</Code>. What matters is the power; e
        simply gives the rate a direct meaning: for small steps{" "}
        <Code>1 − e^(−x) ≈ x</Code>, so each unit travelled levels by about
        rate.
      </>
    ),
  },
  {
    title: "The same trick as frame-rate-independent smoothing",
    body: (
      <>
        The common animation idiom{" "}
        <Code>lerp(a, b, 1 − Math.exp(−k × dt))</Code> keeps the follow speed
        independent of the frame rate; here the time dt is replaced by the arc
        length stepLength. Because it depends on arc length rather than time,
        levelling depends only on where the camera is on the rail, not on how
        fast the page scrolls or the frame rate, so it can all be computed when
        the table is built and <Code>getCameraState</Code> stays a pure
        function.
      </>
    ),
  },
  {
    title: "smoothstep eases levelling in and out",
    body: (
      <>
        <Code>MathUtils.smoothstep(x, min, max)</Code> is 0 for x ≤ min, 1 for x
        ≥ max, and an S-curve with zero slope at both ends in between. Cutting
        it off with an <Code>if</Code> would start or stop levelling abruptly,
        putting a kink in the roll speed. The vertical gate should level less
        the steeper the rail, so it uses <Code>1 − smoothstep</Code>.
      </>
    ),
  },
  {
    title: "Why the vertical gate is needed",
    body: (
      <>
        The target is <Code>WORLD_UP</Code> minus its shadow on the tangent, and
        before normalising its length is cos(slope). The closer to vertical, the
        shorter it gets, and normalising magnifies tiny differences, so the
        target swings wildly from sample to sample; at exactly vertical its
        length is 0 and it has no direction at all, for the same reason a fixed
        up fails on vertical sections. Pulling towards an unstable target would
        bring the flip back, so the steeper the rail, the less it levels. At 53°
        the remaining length is still 0.6: the gate deliberately leaves a
        margin.
      </>
    ),
  },
  {
    title: "Why the upright gate is needed",
    body: (
      <>
        At the top of the loop the tangent is horizontal, so the vertical gate
        lets everything through, yet the camera is upside down and the angle
        between up and target is close to 180°. This is an unstable equilibrium:
        up and target are both perpendicular to the tangent, and each levelling
        step turns up by roughly the sine of the angle between them. Near 180°
        it barely moves, but the slightest offset makes it turn faster and
        faster until it has rolled half a turn about the tangent. Which way it
        rolls depends on minute numerical differences, so changing the sample
        count can reverse the result (in the table above, "vertical gate only"
        differs by 153° between 1024 and 256 samples). The problem is not a
        shrinking vector: with 1024 samples the weight per step is at most about
        0.017, and the lerp result is still 0.97 long. The upright gate only
        levels when <Code>up · target</Code> is large enough, so an upside-down
        camera stays upside down. The cost is that a camera tilted beyond 90° is
        never levelled, which is acceptable because the real rail has no loops.
      </>
    ),
  },
  {
    title: "Each of the three dot products answers one question",
    body: (
      <>
        <Code>tangent · WORLD_UP</Code> is how steep the rail is (the vertical
        gate), <Code>up · target</Code> is how upright the camera is (the
        upright gate), and <Code>up · tangent</Code> is how far up strays from
        the perpendicular plane (inside <Code>makePerpendicular</Code>, and
        always 0 afterwards).
      </>
    ),
  },
  {
    title: "Gates are set with dot values, not angles",
    body: (
      <>
        The dot product of two unit vectors is the cosine of the angle between
        them, so the gates are written as dot values and no sample needs an{" "}
        <Code>acos</Code>. In the vertical gate,{" "}
        <Code>|tangent · WORLD_UP|</Code> is the sine of the slope: 0.5 is 30°
        and 0.8 about 53°. In the upright gate, <Code>up · target</Code> is the
        cosine of the tilt: 0.5 is 60° and 0 is 90°; it grows as the tilt
        shrinks, so there is no need for 1 −.
      </>
    ),
  },
  {
    title: "Gates outside the exponent are an approximation",
    body: (
      <>
        The current code is{" "}
        <Code>weight = gate × (1 − e^(−rate × stepLength))</Code>. Strictly
        independent of the sample count would be putting the gate inside the
        exponent: <Code>1 − e^(−rate × gate × stepLength)</Code>, which means "a
        gate half open halves the rate". For small steps{" "}
        <Code>1 − e^(−x) ≈ x</Code>, so the two are almost identical: on{" "}
        <Code>LOOP_CURVE</Code> at 64, 256 and 1024 samples, both give the same
        exit tilt to three decimal places, so the current code is good enough.
      </>
    ),
  },
  {
    title: "Tests: keep transport and levelling apart",
    body: (
      <>
        Levelling deliberately turns up further about the tangent, so "up never
        turns more than forward" only holds for pure transport.{" "}
        <Code>buildRailLUT</Code> gained a{" "}
        <Code>&#123; levellingRate &#125;</Code> option (Introduce Parameter),
        and that test passes <Code>levellingRate: 0</Code>. Three more tests:
        the exit tilt is under 2°, 1024 and 256 samples differ by less than 1°,
        and <Code>up.y</Code> at the top of the loop is below -0.9. The last two
        already pass without levelling; they are guard tests, and both wrong
        implementations in the table above make them fail.
      </>
    ),
  },
  {
    title: "computeFrenetFrames cannot level",
    body: (
      <>
        three's <Code>computeFrenetFrames</Code> is implemented as parallel
        transport, but its initial normal is chosen from the axis on which the
        tangent's component is smallest in absolute value, computed as{" "}
        <Code>tangent × (tangent × axis)</Code>. It may point downwards, so it
        has to be aligned with <Code>WORLD_UP</Code> by hand. It also returns
        the whole set at once, whereas levelling has to step in between steps,
        so a custom loop is the only option. Its <Code>closed</Code> option
        spreads a twist so that a closed curve joins up end to end, which is a
        different thing from levelling.
      </>
    ),
  },
];

const MATH: Concept[] = [
  {
    title: "Points and directions",
    body: (
      <>
        Both are a <Code>Vector3</Code> in three, so type checking cannot tell
        them apart. A point is a position in space (position, target); a
        direction is only an orientation, usually a unit vector of length 1
        (tangent, up). A point plus a direction times a distance gives another
        point, as in <Code>target = position + tangent</Code>; a point minus a
        point gives a direction, as in <Code>eye - target</Code>. Points need no
        normalising; directions usually do.
      </>
    ),
  },
  {
    title: "Dot product: how closely two directions agree",
    body: (
      <>
        <Code>a · b = ax·bx + ay·by + az·bz = |a| |b| cos θ</Code>. For two unit
        vectors the result is the cosine of the angle between them: 1 when they
        point the same way, 0 when perpendicular, -1 when opposite. This unit
        uses it to check whether up is perpendicular to the tangent (≈ 0), and
        uses its sign to tell whether two directions are on the same side or
        opposite sides.
      </>
    ),
  },
  {
    title: "Cross product: the direction perpendicular to both",
    body: (
      <>
        <Code>a × b</Code> is perpendicular to both <Code>a</Code> and{" "}
        <Code>b</Code>, points according to the right-hand rule, and has length{" "}
        <Code>|a| |b| sin θ</Code>. Order matters: <Code>b × a = −(a × b)</Code>
        . When the two are parallel, sin θ = 0 and the result is the zero vector
        with no direction, which is exactly why a fixed up fails on vertical
        sections.
      </>
    ),
  },
  {
    title: "Projection: a vector's shadow on another direction",
    body: (
      <>
        When <Code>d</Code> is a unit vector, <Code>v · d</Code> is the length
        of the shadow <Code>v</Code> casts along <Code>d</Code>, and{" "}
        <Code>d × (v · d)</Code> is the shadow vector itself. This is one reason
        directions must be normalised first: if <Code>d</Code> is not of length
        1, the dot product no longer equals the shadow's length.
      </>
    ),
  },
  {
    title: "Gram–Schmidt: remove the shadow, keep the perpendicular part",
    body: (
      <>
        Subtract up's shadow on the tangent and what is left is perpendicular to
        the tangent; then normalise it back to length 1. The formula is{" "}
        <Code>up − tangent × (up · tangent)</Code>, and what remains has length{" "}
        <Code>|up| sin θ</Code>. It is implemented as{" "}
        <Code>makePerpendicular</Code>: first compute <Code>up · tangent</Code>,
        then <Code>addScaledVector(tangent, -length)</Code> and{" "}
        <Code>normalize()</Code>; the shadow length must be computed before up
        is modified. For example, with the tangent pointing up and to the right
        at 45° and up pointing straight up, the result points up and to the left
        at 45°: perpendicular, and still roughly upwards. When up is parallel to
        the tangent nothing is left, and it cannot be normalised.
      </>
    ),
  },
  {
    title: "How lookAt builds the three axes",
    body: (
      <>
        z = normalise(<Code>eye − target</Code>), x = normalise(
        <Code>up × z</Code>), y = <Code>z × x</Code>. The three axes are the
        three columns of the rotation matrix, describing where the object's own
        x, y and z point in the world. up is only a reference and need not be
        perpendicular to z; the true y is recomputed by <Code>z × x</Code>.
      </>
    ),
  },
  {
    title: "The smallest rotation: setFromUnitVectors",
    body: (
      <>
        There are infinitely many rotations that turn direction a into direction
        b: take any of them and add a few more degrees about b, and b is
        unchanged. That extra turn is the camera's roll.{" "}
        <Code>Quaternion.setFromUnitVectors(a, b)</Code> finds the one with the
        smallest angle: its axis is <Code>a × b</Code>, its angle is the angle
        between the two, and it contains no turn about b at all. Both arguments
        must be unit vectors, in the order "from a to b". Parallel transport
        applies this rotation to up at every step, so up only turns with the
        tangent and never rolls on its own.
      </>
    ),
  },
  {
    title: "Comparing angles to catch extra turning",
    body: (
      <>
        <Code>a.angleTo(b)</Code> returns the angle between two directions, in
        radians. The smallest rotation never turns up by more than it turns the
        tangent, so the test compares, step by step, how far the camera's up and
        forward turn: anything extra on up is roll. On the loop, a fixed up
        turns at most about 0.19 extra; parallel transport, about 1e-7.
      </>
    ),
  },
];

const CONCEPTS: Concept[] = [
  {
    title: "Catmull-Rom passes through every control point",
    body: (
      <>
        Unlike Bézier curves, a Catmull-Rom curve actually passes through each
        control point, so the camera visits every point you place.{" "}
        <Code>curveType</Code> defaults to <Code>centripetal</Code>, which
        assigns parameters by the square root of the distance between control
        points, so uneven spacing produces neither cusps nor knots;{" "}
        <Code>catmullrom</Code> (uniform) tends to form cusps, and{" "}
        <Code>chordal</Code> takes wider turns.
      </>
    ),
  },
  {
    title: "<threeLine> versus SVG's <line>",
    body: (
      <>
        In TSX, <Code>&lt;line&gt;</Code> is the SVG element. R3F's types leave{" "}
        <Code>line</Code>, <Code>path</Code>, <Code>audio</Code> and{" "}
        <Code>source</Code> to HTML/SVG and offer prefixed names such as{" "}
        <Code>threeLine</Code> instead; at runtime the <Code>three</Code> prefix
        is stripped and a <Code>THREE.Line</Code> is still created. With only
        children, <Code>&lt;line&gt;</Code> passes type checking, but it fails
        as soon as a three-specific prop such as <Code>position</Code> or{" "}
        <Code>frustumCulled</Code> is added. R3F 9.8.2 strips the prefix only
        when creating, not when updating, so the name has to be registered with{" "}
        <Code>extend(&#123; ThreeLine: Line &#125;)</Code>.
      </>
    ),
  },
  {
    title: "BufferAttribute and Float32Array",
    body: (
      <>
        The GPU only accepts contiguous memory holding raw numbers, so a{" "}
        <Code>Vector3[]</Code> has to be flattened into a{" "}
        <Code>Float32Array</Code> laid out as <Code>[x0, y0, z0, x1, …]</Code>,
        and the <Code>itemSize</Code> (3) of the <Code>BufferAttribute</Code>{" "}
        tells the GPU how many numbers make up one vertex. WebGL vertex
        attributes are 32-bit floats; JS's 64-bit <Code>number</Code> is not
        supported. <Code>attach=&quot;attributes-position&quot;</Code> is the
        same as <Code>geometry.setAttribute(&quot;position&quot;, attr)</Code>,
        and the name has to match <Code>attribute vec3 position</Code> in the
        shader.
      </>
    ),
  },
  {
    title: "Changing args rebuilds the object",
    body: (
      <>
        R3F compares <Code>args</Code> by reference; once the reference changes,
        it creates the whole object afresh and uploads it to the GPU again. Data
        that depends only on constants can be computed at the top level of the
        module; data that depends on props or state goes in <Code>useMemo</Code>
        , with those values in the dependency array.
      </>
    ),
  },
  {
    title: "R3F only disposes of what it created",
    body: (
      <>
        When a component unmounts, R3F disposes of the objects created in JSX
        (such as <Code>&lt;bufferGeometry&gt;</Code>). Objects passed in through
        props, and objects mounted with <Code>&lt;primitive&gt;</Code>, count as
        externally managed: call <Code>dispose()</Code> on them yourself in a{" "}
        <Code>useEffect</Code> cleanup.
      </>
    ),
  },
  {
    title: "meshBasicMaterial for debug markers",
    body: (
      <>
        This scene has no lights. <Code>meshStandardMaterial</Code> needs light
        to be seen and renders completely black without it;{" "}
        <Code>meshBasicMaterial</Code> ignores lighting and shows its colour as
        set, equally clearly from any angle. <Code>lineBasicMaterial</Code>{" "}
        ignores lighting too, which is why drawing only lines never reveals that
        the scene is unlit.
      </>
    ),
  },
  {
    title: "Control points are read from curve.points",
    body: (
      <>
        <Code>CatmullRomCurve3</Code> keeps the control points it was
        constructed with in its <Code>points</Code> property. The spheres read
        it directly, so the control points are written only once, in{" "}
        <Code>curve.ts</Code>, and the spheres follow whenever the curve
        changes. When <Code>position</Code> is given a <Code>Vector3</Code>, R3F{" "}
        <Code>copy</Code>s the values rather than sharing the object with the
        curve.
      </>
    ),
  },
  {
    title: "Labelling 3D objects with drei's <Html>",
    body: (
      <>
        <Code>&lt;Html&gt;</Code> overlays an ordinary HTML element at the
        position of a 3D object; it moves with the camera and always faces the
        screen. Placed inside a <Code>&lt;mesh&gt;</Code>, it appears at that
        mesh's position. <Code>center</Code> centres the element on that point.
        By default it receives pointer events, so a drag that starts on a label
        never reaches OrbitControls; set{" "}
        <Code>pointerEvents=&quot;none&quot;</Code> when that matters.
      </>
    ),
  },
  {
    title: "getPoint(t) versus getPointAt(u)",
    body: (
      <>
        A <Code>CatmullRomCurve3</Code> is made of several joined segments. The{" "}
        <Code>t</Code> in <Code>getPoint(t)</Code> is a parameter that gives
        every segment the same range regardless of its actual length, so with
        unevenly spaced control points the speed keeps changing. The{" "}
        <Code>u</Code> in <Code>getPointAt(u)</Code> is a fraction of arc
        length: <Code>u = 0.5</Code> is exactly halfway along, and the speed is
        even. <Code>u</Code> is not an abbreviation but one of the letters
        mathematicians customarily use for parameters (<Code>s</Code>,{" "}
        <Code>t</Code>, <Code>u</Code>, <Code>v</Code>); three uses{" "}
        <Code>t</Code> for the main parameter and <Code>u</Code> for the arc
        length fraction, and the function converting between them is called{" "}
        <Code>getUtoTmapping(u)</Code>.
      </>
    ),
  },
  {
    title: "Why a lookup table",
    body: (
      <>
        Every call to <Code>getPointAt</Code> converts <Code>u</Code> to{" "}
        <Code>t</Code> (a binary search in the arc length table) and returns a{" "}
        <Code>new</Code> <Code>Vector3</Code>. A lookup table is computed once
        at initialisation; each frame then only finds the two samples that
        progress falls between and interpolates linearly, with no searching and
        no allocation.
      </>
    ),
  },
  {
    title: "STRIDE and OFFSET",
    body: (
      <>
        A <Code>Float32Array</Code> is just one long row of numbers with no
        notion of rows, so each sample's three vectors sit end to end.{" "}
        <Code>STRIDE</Code> is how many slots one sample occupies (9),
        regardless of how many samples there are; <Code>OFFSET</Code> is the
        slot within a sample where each field starts (0, 3, 6). Every field
        lives at <Code>i * STRIDE + OFFSET.field</Code>, and all reads and
        writes go through these two constants instead of hand-written{" "}
        <Code>+1</Code> or <Code>+3</Code> scattered about.
      </>
    ),
  },
  {
    title: "Reading and writing directly with toArray and fromArray",
    body: (
      <>
        <Code>vector.toArray(array, offset)</Code> writes x, y and z straight
        into the given array at the given position, and{" "}
        <Code>vector.fromArray(array, offset)</Code> reads them back. Called
        with no arguments, <Code>toArray()</Code> creates a <Code>new</Code>{" "}
        intermediate array that then has to be copied with{" "}
        <Code>data.set()</Code>: one allocation too many.
      </>
    ),
  },
  {
    title: "The denominator of u is samples - 1",
    body: (
      <>
        N samples have to cover both ends, 0 and 1, and N points have only N - 1
        gaps between them, hence <Code>u = i / (samples - 1)</Code>. When{" "}
        <Code>samples</Code> is 1 the denominator is 0 and the whole lookup
        table becomes <Code>NaN</Code>; all you would see is the camera
        vanishing, so the function throws at the entrance.
      </>
    ),
  },
  {
    title: "arcLengthDivisions sets the precision of getPointAt",
    body: (
      <>
        <Code>getPointAt</Code> converts <Code>u</Code> to <Code>t</Code> with
        an arc length table: the curve is cut into{" "}
        <Code>arcLengthDivisions</Code> segments (200 by default) and
        interpolated linearly between them, so even spacing within a segment is
        only approximate. Every curve in <Code>curve.ts</Code> is created
        through <Code>createRailCurve(points)</Code>, which sets it to 1000 (
        <Code>WAVE_CURVE</Code> is about 68 long, <Code>LOOP_CURVE</Code> about
        173). The precision goes with creation, so every curve has it set,
        whichever one happens to be on screen. It is not set inside{" "}
        <Code>buildRailLUT</Code> either: a pure function should not modify the
        curve passed to it.
      </>
    ),
  },
  {
    title: "Switching curves at runtime: precompute, remount with a key",
    body: (
      <>
        Originally each component computed its LUT and debug data at module
        level from the same constant: once, at load time, with no way to change
        it while running. Now <Code>RAILS</Code> in <Code>_utils/rails.ts</Code>{" "}
        computes each curve's curve, LUT, debug LUT and centre once at module
        level, so switching does no computation at all. Scene keeps the curve's
        name in <Code>useState</Code> and passes the matching data down as
        props. The geometry that depends on the curve is wrapped in{" "}
        <Code>&lt;group key=&#123;railName&#125;&gt;</Code>: when the key
        changes, React unmounts the old subtree, R3F disposes of the old
        geometry, and the new one is mounted, with no need to update existing
        buffers. <Code>RailCamera</Code> is not remounted; its{" "}
        <Code>useFrame</Code> reads the latest <Code>lut</Code> prop every
        frame, so it moves to the new rail on the next frame.
      </>
    ),
  },
  {
    title: "Samples are not control points",
    body: (
      <>
        Take <Code>WAVE_CURVE</Code>: <Code>getPoint(t)</Code> gives each of the
        7 segments 1/7 of <Code>t</Code>, and the boundaries between segments
        are the control points, so the 8 points of <Code>getPoints(7)</Code>{" "}
        land exactly on the 8 control points. <Code>getPointAt(u)</Code> divides
        by arc length, and since the control points are between 3.3 and 15.4
        apart, they do not sit at 1/7, 2/7… of the total length; only the start
        and end coincide.
      </>
    ),
  },
  {
    title: "Compare distances when testing vectors",
    body: (
      <>
        <Code>toEqual</Code> compares types as well: a <Code>Float32Array</Code>
        , a plain array and a <Code>Vector3</Code> are never equal, even with
        the same numbers. Besides, a <Code>Float32Array</Code> holds only about
        7 significant digits and <Code>getPointAt</Code> is approximate, so
        exact comparisons are unreliable. Instead, read every value into a{" "}
        <Code>Vector3</Code> and check that <Code>distanceTo</Code> is below{" "}
        <Code>TOLERANCE</Code>; for single numbers, use <Code>toBeCloseTo</Code>
        . <Code>it.each</Code> turns each sample into its own test, so a failure
        names the exact sample.
      </>
    ),
  },
  {
    title: "A pure function can also avoid allocation",
    body: (
      <>
        <Code>getCameraState</Code> takes an <Code>out</Code> object and writes
        its result into it, using module-level scratch objects along the way.
        This is a three convention (as in{" "}
        <Code>getPointAt(u, optionalTarget)</Code>). The same input always gives
        the same output, and it never touches React or the scene graph.
      </>
    ),
  },
  {
    title: "Converting progress to a sample",
    body: (
      <>
        <Code>x = progress * (samples - 1)</Code> maps 0–1 onto sample
        coordinates, <Code>index = Math.floor(x)</Code> is the previous sample,
        and <Code>fraction = x - index</Code> is the position between the two.
        The next sample must be <Code>Math.min(index + 1, samples - 1)</Code>:
        at a progress of 1, <Code>index</Code> is already the last sample, and
        adding 1 would read past the end of the array. <Code>fraction</Code>{" "}
        uses subtraction rather than <Code>x % 1</Code>, so the formula says
        what it means.
      </>
    ),
  },
  {
    title: "Normalise directions after interpolating",
    body: (
      <>
        Linearly interpolating two unit vectors follows the chord between their
        tips, not the arc, so the result is shorter than 1 in between; if the
        two point in opposite directions, interpolating to 0.5 gives the zero
        vector. Both the tangent and up need <Code>normalize()</Code> after
        interpolation; position is a point and does not. The exact arc
        interpolation is slerp, but with dense enough samples the error of lerp
        plus normalise is invisible, and it is cheaper. <Code>lerpVectors</Code>{" "}
        returns <Code>this</Code>, so <Code>.normalize()</Code> can be chained
        straight on.
      </>
    ),
  },
  {
    title: "Tangent and up",
    body: (
      <>
        The tangent is the curve's direction of travel at a point and decides
        where the camera looks. Knowing only where it looks, the camera could
        still turn about its line of sight (roll); up adds roughly which way the
        top of the picture faces. up need not be exactly perpendicular to the
        tangent: <Code>lookAt</Code> corrects it into three mutually
        perpendicular axes.
      </>
    ),
  },
  {
    title: "The camera looks down negative Z",
    body: (
      <>
        By default a three camera looks along <Code>-Z</Code>. Using{" "}
        <Code>Matrix4.lookAt(eye, target, up)</Code> followed by{" "}
        <Code>Quaternion.setFromRotationMatrix</Code> handles this convention
        automatically and is less prone to a stray minus sign than building the
        basis matrix by hand. The z axis of <Code>Matrix4.lookAt</Code> is{" "}
        <Code>eye - target</Code>, pointing from the target back to the camera,
        so a camera looking down <Code>-Z</Code> faces the target exactly. An
        ordinary object's front is <Code>+Z</Code>, which is why{" "}
        <Code>Object3D.lookAt</Code> swaps eye and target internally for
        anything that is not a camera. This is a camera, so no swap.
      </>
    ),
  },
  {
    title: "lookAt's target is a point, not a direction",
    body: (
      <>
        Directions and points are both a <Code>Vector3</Code>, so type checking
        will not catch a mix-up. The target is the point one step ahead of the
        camera's position, computed with{" "}
        <Code>_target.addVectors(position, tangent)</Code>.{" "}
        <Code>Matrix4.lookAt</Code> writes only the rotation part and sets no
        translation, which is just right when only the orientation is needed.
      </>
    ),
  },
  {
    title: "Testing orientation with applyQuaternion",
    body: (
      <>
        A quaternion's four numbers are hard to judge directly. Take the
        camera's local forward <Code>(0, 0, -1)</Code> and up{" "}
        <Code>(0, 1, 0)</Code>, turn them into world space with{" "}
        <Code>applyQuaternion</Code>, and compare them with the expected
        directions using <Code>distanceTo</Code>. Orientation should not depend
        on where the camera is, so <Code>it.each</Code> tests several progress
        values; testing only progress 0 lets several kinds of mistake pass by
        chance.
      </>
    ),
  },
  {
    title: "Test data has to tell the two approaches apart",
    body: (
      <>
        On a straight line with evenly spaced control points, every segment has
        the same length, so <Code>getPoint</Code> and <Code>getPointAt</Code>{" "}
        agree, and a slip back to <Code>getPoint</Code> would still pass. So
        there is a second curve with control points at 0, 1 and 10: it is 10
        long, its arc length midpoint is at x = 5, yet{" "}
        <Code>getPoint(0.5)</Code> lands on control point 1 (x = 1). Switch to{" "}
        <Code>getPoint</Code> to watch it fail, then back to watch it pass,
        confirming the test really guards the decision to divide by arc length.
      </>
    ),
  },
  {
    title: "Reading progress with getState() in useFrame",
    body: (
      <>
        Subscribing to progress with a hook would re-render the component every
        frame, since progress changes every frame.{" "}
        <Code>useScrollStore.getState()</Code> only reads the current value,
        without involving React. <Code>ScrollDriverHandoff</Code> uses{" "}
        <Code>addEffect</Code> to call <Code>lenis.raf()</Code> before each
        frame renders, so <Code>useFrame</Code> reads that frame's latest value,
        in the order "update scroll → write to the store → camera reads".
      </>
    ),
  },
  {
    title: "Write to the camera with copy",
    body: (
      <>
        <Code>position</Code> and <Code>quaternion</Code> on an{" "}
        <Code>Object3D</Code> are read-only properties that cannot be
        reassigned; use <Code>copy()</Code> to copy values into the existing
        objects. <Code>RailCamera</Code> renders nothing and returns{" "}
        <Code>null</Code>; if it coexists with <Code>OrbitControls</Code>, both
        write to the same camera every frame, so use one or the other.
      </>
    ),
  },
  {
    title: "Switching the default between two cameras",
    body: (
      <>
        The Canvas's own camera is left to <Code>OrbitControls</Code> for the
        overview; <Code>RailCamera</Code> brings its own with drei's{" "}
        <Code>&lt;PerspectiveCamera&gt;</Code>, and <Code>useFrame</Code> writes
        to the one its <Code>ref</Code> points at, not to{" "}
        <Code>state.camera</Code> (that is the current default camera). When{" "}
        <Code>makeDefault</Code> is true it becomes the camera R3F renders with,
        and the previous one is restored when it turns false. Each camera keeps
        its own position, so the overview returns at whatever angle it was last
        turned to. <Code>makeDefault</Code> means something else on{" "}
        <Code>OrbitControls</Code>: it only registers the controls in the store
        and never disables them, so in rail mode they are simply not rendered.
      </>
    ),
  },
  {
    title: "data-lenis-prevent",
    body: (
      <>
        Lenis listens for <Code>wheel</Code> on the window, so zooming with the
        wheel over the Canvas would scroll the page too. When an element has{" "}
        <Code>data-lenis-prevent</Code>, Lenis ignores events coming from it
        (and its descendants). Only orbit mode needs it; in rail mode the wheel
        should scroll as usual and drive the camera. Lenis checks with{" "}
        <Code>hasAttribute</Code>, looking only at whether the attribute exists,
        not at its value.
      </>
    ),
  },
  {
    title: "Why a fixed up flips",
    body: (
      <>
        <Code>lookAt</Code> works out "right" from the cross product of the
        direction of travel and up. As the rail nears vertical, the direction of
        travel becomes almost parallel to <Code>(0, 1, 0)</Code>, the cross
        product approaches the zero vector, "right" becomes undefined, and the
        slightest numerical error makes it jump to the other side.
      </>
    ),
  },
  {
    title: "Parallel transport",
    body: (
      <>
        up is carried along the rail: at each step,{" "}
        <Code>Quaternion.setFromUnitVectors</Code> finds the smallest rotation
        from the previous tangent to the current one, which is applied to the
        previous up; then its component along the tangent is removed and it is
        normalised (Gram–Schmidt) to correct accumulated floating-point error.
        Each step turns only slightly, so there is no sudden flip. The cost is
        that up is not guaranteed to point upwards: after big turns the camera
        can be left slightly tilted, which "Levelling" deals with.
      </>
    ),
  },
  {
    title: "Copy prevTangent; don't assign it",
    body: (
      <>
        A <Code>Vector3</Code> is an object, and a variable holds a reference to
        it, not the values themselves. <Code>prevTangent = tangent</Code> just
        makes two names point at the same object: when the next iteration writes
        into tangent with <Code>getTangentAt(u, tangent)</Code>, prevTangent
        changes too, the rotation is always from a vector to itself, and up
        never moves. Create each one with <Code>new</Code> outside the loop, and
        at the end of each iteration copy the values across with{" "}
        <Code>prevTangent.copy(tangent)</Code>. Most three methods modify the
        object in place, so always be clear about which names point at the same
        object; this is the same kind of problem as <Code>readVec3</Code> being
        reassigned and <Code>out.position</Code> reading a stale value.
      </>
    ),
  },
  {
    title: "The trouble with Frenet frames",
    body: (
      <>
        A Frenet frame uses the direction of curvature as its normal: it is
        undefined on straight stretches, where the curvature is zero, and
        reverses outright at the inflection point of an S-bend. Despite its
        name, three's <Code>computeFrenetFrames</Code> is actually implemented
        much like parallel transport.
      </>
    ),
  },
];

const PITFALLS: Pitfall[] = [
  {
    title: "A wasted useMemo: new Float32Array written in the JSX",
    symptom: (
      <>
        <Code>useMemo</Code> memoises the <Code>number[]</Code>, but{" "}
        <Code>args=&#123;[new Float32Array(positions), 3]&#125;</Code> creates a
        new array on every render.
      </>
    ),
    cause: (
      <>
        R3F compares <Code>args</Code> by reference, so it thinks the arguments
        changed every time, rebuilds the <Code>BufferAttribute</Code> and
        uploads it to the GPU again.
      </>
    ),
    fix: (
      <>
        Move <Code>new Float32Array(...)</Code> into the <Code>useMemo</Code>{" "}
        (Move Statements into Function), and put only the memoised result in the
        JSX.
      </>
    ),
  },
  {
    title: "toEqual between a Float32Array and an array always fails",
    symptom: (
      <>
        <Code>
          expected Float32Array[ 0, 0, 0 ] to deeply equal [ +0, +0, +0 ]
        </Code>
        : the numbers match, yet they are judged unequal.
      </>
    ),
    cause: (
      <>
        <Code>toEqual</Code> compares the objects' types as well.{" "}
        <Code>slice()</Code> gives a <Code>Float32Array</Code>;{" "}
        <Code>toArray()</Code> gives a plain array.
      </>
    ),
    fix: (
      <>
        Write a <Code>read(lut, i, field)</Code> (Extract Function) that reads
        into a <Code>Vector3</Code> with <Code>fromArray</Code>, then compare
        with <Code>distanceTo</Code>.
      </>
    ),
  },
  {
    title: "Assuming sample 1 is control point 1",
    symptom: (
      <>
        The test expected sample 1 to equal <Code>POINTS[1] = (1, 0, 0)</Code>,
        but it was <Code>(1.5, 0, 0)</Code>.
      </>
    ),
    cause:
      "Samples are spaced evenly by arc length, independent of where the control points are. Take 3 samples on a straight line of length 3, and sample 1 sits exactly halfway along.",
    fix: 'Expect the arc length midpoint instead, and name the test "not at control point 1" as a reminder that the two are different points.',
  },
  {
    title: "LutPoints doing its computation inside the component",
    symptom: (
      <>
        <Code>buildRailLUT</Code> and two <Code>new Float32Array</Code> calls
        sat inside the component function.
      </>
    ),
    cause:
      "Every render recomputed them and created new arrays; once the args reference changed, R3F rebuilt the attribute. The same pitfall as the wasted useMemo.",
    fix: "The data depends only on constants, so move the whole block to the top level of the module (Move Statements), leaving only JSX in the component.",
  },
  {
    title: "Progress 1 reads past the end of the array",
    symptom: (
      <>
        At a progress of 1 the camera position becomes <Code>NaN</Code>.
      </>
    ),
    cause: (
      <>
        <Code>index</Code> is already the last sample, so <Code>index + 1</Code>{" "}
        is past the end of the array; reading a <Code>Float32Array</Code> out of
        bounds gives <Code>undefined</Code>, and the interpolation result is{" "}
        <Code>NaN</Code>.
      </>
    ),
    fix: (
      <>
        <Code>nextIndex = Math.min(index + 1, samples - 1)</Code>. Both reads
        then hit the same sample with a <Code>fraction</Code> of 0, which gives
        the last sample.
      </>
    ),
  },
  {
    title: "<threeLine> renders fine the first time, then fails on update",
    symptom: (
      <>
        Once the toggle button was added, the first press threw{" "}
        <Code>R3F: ThreeLine is not part of the THREE namespace!</Code>,
        followed by a chain of errors such as <Code>removeChild</Code> and{" "}
        <Code>synchronously unmount a root</Code>, with the stack pointing at
        the unrelated <Code>ControlPoints</Code>.
      </>
    ),
    cause: (
      <>
        In R3F 9.8.2, <Code>createInstance</Code> strips the <Code>three</Code>{" "}
        prefix, but <Code>commitUpdate</Code> looks up <Code>threeLine</Code> in
        the catalogue as it is. Once Scene had state and re-rendered,{" "}
        <Code>RailLine</Code> re-rendered with new props and took the update
        path for the first time. The error unmounted the Canvas root, and the
        DOM nodes of drei's <Code>&lt;Html&gt;</Code> were removed twice, which
        caused the two later errors.
      </>
    ),
    fix: (
      <>
        Call <Code>extend(&#123; ThreeLine: Line &#125;)</Code> at module level
        in <Code>RailLine.tsx</Code>, so both creation and updates find it.
        Putting it in the file that uses it guarantees it runs on import, before
        rendering. It cannot go in <Code>page.tsx</Code>: Server Component code
        never reaches the browser, so it would never register in the browser's
        catalogue.
      </>
    ),
  },
  {
    title: "A data-* attribute passed a boolean still exists",
    symptom: (
      <>
        <Code>
          data-lenis-prevent=&#123;viewMode === &quot;orbit&quot;&#125;
        </Code>
        : in rail mode, the wheel over the Canvas scrolls the page, but without
        smoothing.
      </>
    ),
    cause: (
      <>
        React outputs booleans for <Code>data-*</Code> and <Code>aria-*</Code>{" "}
        as strings, so the DOM gets{" "}
        <Code>data-lenis-prevent=&quot;false&quot;</Code> and the attribute is
        still there. Lenis checks with <Code>hasAttribute</Code>, so it steps
        aside for the browser's native scrolling.
      </>
    ),
    fix: (
      <>
        Pass <Code>undefined</Code> when it is not needed, so React omits the
        attribute. Use the Elements panel in DevTools to confirm the attribute
        appears and disappears, rather than just changing value.
      </>
    ),
  },
  {
    title: "smoothstep's argument order: three.js and GLSL are reversed",
    symptom: (
      <>
        After moving the gate from JS into a shader it computes odd values, with
        no error at all.
      </>
    ),
    cause: (
      <>
        <Code>MathUtils.smoothstep(x, min, max)</Code> takes x first, whereas
        GLSL's built-in <Code>smoothstep(edge0, edge1, x)</Code> takes it last.
      </>
    ),
    fix: (
      <>
        Check the argument order when porting code, and write{" "}
        <Code>smoothstep(min, max, x)</Code> in GLSL.
      </>
    ),
  },
];

const VERIFICATIONS: Verification[] = [
  {
    id: "uniform-speed",
    body: (
      <>
        Scrolling moves the camera smoothly along the curve. Temporarily
        swapping <Code>getPointAt</Code> for <Code>getPoint</Code> makes the
        speed change noticeably where the control points are unevenly spaced.
      </>
    ),
  },
  {
    id: "no-flip",
    body: "The camera does not flip on the vertical section; the short debug lines for up change direction continuously, with no sudden reversal.",
  },
  {
    id: "pure",
    body: (
      <>
        <Code>rail.ts</Code> imports nothing from React or R3F, there is no{" "}
        <Code>new</Code> in <Code>useFrame</Code>, and the functions called
        every frame have no default parameters that allocate objects.
      </>
    ),
  },
  {
    id: "no-rerender",
    body: (
      <>
        <Code>RailCamera</Code> does not re-render while scrolling (React
        DevTools' Highlight updates does not flash).
      </>
    ),
  },
  {
    id: "view-toggle",
    body: "Switching to orbit returns to the overview, and the wheel only zooms without scrolling the page; switching back to rail picks up the camera's current position and the wheel scrolls smoothly. Toggling back and forth, the overview camera stays at the angle it was last turned to.",
  },
  {
    id: "levelling",
    body: "Scrolling through LOOP_CURVE in rail mode: at the top of the loop the grid is at the top of the screen and the gizmo's y axis points down; after the loop the horizon returns to level within a few dozen units, with no visible sudden roll.",
  },
  {
    id: "tests",
    body: (
      <>
        <Code>pnpm test</Code> passes, and the test "a curve with a vertical
        section never reverses" fails with a fixed up and passes with parallel
        transport.
      </>
    ),
  },
];

const CONTENT: Unit04Content = {
  intro: (
    <>
      The camera travels along a curve, and "progress → camera state" is written
      as a pure function. The curve is precomputed into a lookup table, and the
      up vector is carried along the rail by parallel transport, so the camera
      never flips on vertical sections; level stretches then gradually
      straighten it, removing any leftover tilt.
    </>
  ),
  demoCaption:
    "Scrolling moves the camera along a Catmull-Rom curve with a vertical loop; it can switch to an overview.",
  steps: STEPS,
  sections: {
    controlPoints: {
      title: "Designing the control points",
      before: [
        {
          id: "two-curves",
          body: (
            <>
              <Code>curve.ts</Code> has two curves, each for observing a
              different problem. The button at the top end of the demo pane
              switches between them; the default is <Code>LOOP_CURVE</Code>.
            </>
          ),
        },
        {
          id: "wave",
          body: (
            <>
              <Code>WAVE_CURVE</Code> (8 control points, about 68 long): z runs
              from 0 to -60 while y alternates between -4 and 5. The spacing
              between neighbouring control points is deliberately uneven (3.3 at
              the shortest, 15.4 at the longest, nearly 5 times as far) so that
              the difference in speed shows clearly when step 3 compares{" "}
              <Code>getPoint</Code> with <Code>getPointAt</Code>.
            </>
          ),
        },
      ],
      after: (
        <>
          <Code>LOOP_CURVE</Code> (6 control points, about 173 long): a vertical
          loop like a roller coaster's. It heads along -z, climbs, runs
          backwards towards +z across the top, drops down on the side nearer the
          entrance, then carries on forwards beneath the loop. The direction of
          travel twice comes close to vertical, which makes it the curve for
          watching a fixed up flip, parallel transport and levelling. x shifts
          from entrance to exit so that the exit clears the entrance; as a
          result the loop does not lie in one plane, the tangent is never truly
          vertical, and pure parallel transport leaves the camera tilted by
          about 41° after the loop.
        </>
      ),
    },
    lines: { title: "Three ways to draw a line" },
    layout: {
      title: "How the lookup table is laid out",
      intro: (
        <>
          Each sample takes 9 floats (<Code>STRIDE = 9</Code>), and sample{" "}
          <Code>i</Code> starts at <Code>i * STRIDE</Code>.
        </>
      ),
    },
    sampling: {
      title: "Even by arc length versus even by parameter",
      paragraphs: [
        {
          id: "two-sets",
          body: (
            <>
              The following uses <Code>WAVE_CURVE</Code>, so switch to Wave with
              the button first. <Code>LutPoints</Code> draws two sets of 64
              samples at once: the green points come from{" "}
              <Code>buildRailLUT</Code> (even by arc length), the red ones from{" "}
              <Code>curve.getPoints(63)</Code> (even by parameter). The green
              points are evenly spaced along the whole rail; the red ones bunch
              up on segment 5 → 6 (3.3) and spread thinly over segment 6 → 7
              (15.4).
            </>
          ),
        },
        {
          id: "time",
          body: (
            <>
              With 8 samples, the red points land exactly on the 8 control
              points, while only the first and last green points coincide with
              them. Thinking of <Code>t</Code> as time makes it clear: driving
              the camera with <Code>getPoint</Code> gives every segment the same
              time, so segment 6 → 7 covers nearly 5 times the distance in the
              same time, at nearly 5 times the speed. That is why the camera has
              to use <Code>getPointAt</Code>.
            </>
          ),
        },
      ],
    },
    rotation: {
      title: "Three ways to represent rotation",
      paragraphs: [
        {
          id: "euler",
          body: (
            <>
              Euler angles split a rotation into three successive turns about
              three axes (three's default order is <Code>XYZ</Code>), like three
              nested rings. When the middle turn reaches 90°, the first and
              third axes line up, so two of the angles turn in the same
              direction and a degree of freedom is lost: this is gimbal lock.
              For example, when the camera tilts up to look straight overhead,
              "turn left or right" and "tilt the head" become the same motion,
              and some tiny changes of orientation can only be expressed by
              large jumps in the angles.
            </>
          ),
        },
        {
          id: "quaternion",
          body: (
            <>
              A quaternion writes a rotation as a single action, "turn by some
              angle about some axis", rather than three successive turns, so it
              has no gimbal lock. three's <Code>Object3D</Code> has both{" "}
              <Code>rotation</Code> and <Code>quaternion</Code>, kept in sync
              automatically: change one and the other follows.
            </>
          ),
        },
        {
          id: "flip",
          body: (
            <>
              Note that using a quaternion does not stop the camera flipping.
              The flip caused by a fixed up happens in the step where{" "}
              <Code>lookAt</Code> uses a cross product to find "right": when the
              direction of travel is parallel to up, the reference direction
              breaks down, whatever representation is used to store the result.
              Parallel transport is what solves it.
            </>
          ),
        },
      ],
    },
    levelling: {
      title: "Levelling: straightening up on level stretches",
      intro: (
        <>
          Parallel transport only guarantees continuity, not that up points
          upwards. After a full turn of <Code>LOOP_CURVE</Code>, back on a level
          stretch, the horizon is tilted by about 41°. At each step of building
          the table, levelling pulls up a little towards the direction that is
          perpendicular to the tangent and points most upwards; how far is the
          product of three factors.
        </>
      ),
      between: (
        <>
          Calibrated with throwaway implementations: the rail's slope alone is
          not enough, because at the top of the loop the tangent is horizontal,
          so an upside-down camera would be pulled towards world up as well.
        </>
      ),
    },
  },
  tables: {
    segment: {
      caption: "Distances between neighbouring control points of WAVE_CURVE",
      columns: { segment: "Segment", length: "Distance" },
    },
    line: {
      caption: "threeLine, drei Line and a hand-built Line2 compared",
      columns: {
        approach: "Approach",
        underlying: "Underlying class",
        width: "Line width",
        disposal: "Disposal",
        usedFor: "Used in this project for",
      },
      rows: {
        "three-line": {
          approach: <Code>&lt;threeLine&gt;</Code>,
          underlying: <Code>THREE.Line</Code>,
          width: "Fixed at 1px",
          disposal: "Automatic (R3F)",
          usedFor: "Debug lines (this unit)",
        },
        "drei-line": {
          approach: (
            <>
              drei <Code>&lt;Line&gt;</Code>
            </>
          ),
          underlying: (
            <>
              <Code>Line2</Code> (three-stdlib)
            </>
          ),
          width: "Adjustable",
          disposal: "Automatic (drei)",
          usedFor: "Not used",
        },
        line2: {
          approach: (
            <>
              Hand-built <Code>Line2</Code> + <Code>&lt;primitive&gt;</Code>
            </>
          ),
          underlying: (
            <>
              <Code>Line2</Code> (three)
            </>
          ),
          width: "Adjustable",
          disposal: "Your own responsibility",
          usedFor: "The journey line (from unit 09)",
        },
      },
    },
    layout: {
      caption: "Fields, offsets and purposes in each lookup table sample",
      columns: {
        field: "Field",
        offset: "Offset",
        size: "Floats",
        purpose: "Purpose",
      },
      purpose: {
        position: "Camera position",
        tangent: "Direction of travel (unit vector)",
        up: "The camera's up, perpendicular to the tangent",
      },
    },
    rotation: {
      caption: "Euler angles, rotation matrices and quaternions compared",
      columns: {
        representation: "Representation",
        size: "Numbers",
        tradeoff: "Pros and cons",
        usedFor: "Used in this unit for",
      },
      pro: "Pro: ",
      con: "Con: ",
      rows: {
        euler: {
          representation: (
            <>
              Euler angles (<Code>rotation</Code>)
            </>
          ),
          pro: "intuitive, good for placing things by hand",
          con: "gimbal lock, unnatural interpolation paths",
          usedFor: "Not used",
        },
        matrix: {
          representation: (
            <>
              Rotation matrix (the 3×3 part of a <Code>Matrix4</Code>)
            </>
          ),
          pro: "its three columns are the three axes",
          con: "many numbers, awkward to interpolate",
          usedFor: (
            <>
              An intermediate step inside <Code>lookAt</Code>
            </>
          ),
        },
        quaternion: {
          representation: (
            <>
              Quaternion (<Code>quaternion</Code>)
            </>
          ),
          pro: "no gimbal lock, interpolates with slerp",
          con: "the numbers don't reveal the orientation",
          usedFor: (
            <>
              Storing the orientation in <Code>CameraState</Code> and{" "}
              <Code>copy</Code>ing it into the camera
            </>
          ),
        },
      },
    },
    gate: {
      caption: "The three factors that decide how much each step levels",
      columns: {
        factor: "Factor",
        question: "Question it answers",
        formula: "Formula",
        full: "Full levelling",
        none: "No levelling",
      },
      rows: {
        distance: {
          factor: "Distance",
          question: "How far did this step travel?",
          formula: <Code>1 − e^(−rate × stepLength)</Code>,
          full: "—",
          none: "rate is 0",
        },
        vertical: {
          factor: "Vertical gate",
          question: "How steep is the rail?",
          formula: <Code>1 − smoothstep(|tangent · WORLD_UP|, 0.5, 0.8)</Code>,
          full: "Slope under 30°",
          none: "Slope over 53°",
        },
        upright: {
          factor: "Upright gate",
          question: "How upright is the camera?",
          formula: <Code>smoothstep(up · target, 0, 0.5)</Code>,
          full: "Tilt under 60°",
          none: "Tilt over 90°",
        },
      },
    },
    levelling: {
      caption: "Three versions compared on LOOP_CURVE",
      columns: {
        version: "Version (rate 0.1)",
        exitTilt: "Exit tilt",
        sampleDifference: "1024 vs 256",
        top: "Top of the loop",
      },
      rows: {
        none: {
          version: "No levelling (pure parallel transport)",
          top: "Upside down",
        },
        "vertical-only": {
          version: "Vertical gate only",
          top: "Upside down, then flips upside down again after the loop",
        },
        both: {
          version: "Vertical gate + upright gate",
          top: "Upside down",
        },
      },
    },
  },
  math: { title: "The maths", items: MATH },
  concepts: CONCEPTS,
  levelling: { title: "Levelling in detail", items: LEVELLING },
  pitfalls: PITFALLS,
  verifications: VERIFICATIONS,
};

export default CONTENT;
