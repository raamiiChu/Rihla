import { Code } from "@/app/lab/_components";
import type { Unit06Content } from "./types";

const content: Unit06Content = {
  intro: (
    <>
      On arrival, the station's lines fade in one by one, and they fade out on
      departure; when the language changes or a long jump happens, the text and
      the scene fade out and back in. Everything is done with Motion, on top of
      the unit 05 scene.
    </>
  ),
  demoCaption:
    "Scrolling moves the camera along a three-station mini timeline; on arrival, the station's lines fade in one by one.",
  demo: {
    navLabel: "Stations",
    linesSwitch: {
      label: "Text layer version",
      fixed: "Fixed",
      broken: "Broken",
    },
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
  steps: [
    {
      id: "line-stagger",
      title: "On a station change, fade the station's lines in one by one",
      done: true,
    },
    {
      id: "dwell-only",
      title: (
        <>
          Show the lines only during dwells: in on arrival, out on departure,
          with the check moved into the timeline as{" "}
          <Code>getDwellingStationIndex</Code>
        </>
      ),
      done: true,
    },
    {
      id: "pointer-events",
      title: (
        <>
          The text layer and readout laid over the Canvas, which need no clicks,
          are <Code>pointer-events-none</Code>
        </>
      ),
      done: true,
    },
    {
      id: "reduced-motion",
      title: (
        <>
          Follow the system's reduced-motion setting with{" "}
          <Code>MotionConfig reducedMotion=&quot;user&quot;</Code>
        </>
      ),
      done: true,
    },
    {
      id: "exit-jump",
      title:
        "Reproduce the exit flash on language change, then fix it by reading the strings in the parent",
      done: true,
    },
    {
      id: "mask",
      title: (
        <>
          Long jumps: fade the mask in → jump with <Code>immediate: true</Code>{" "}
          → fade the mask out
        </>
      ),
      done: true,
    },
    {
      id: "mask-exit",
      title: (
        <>
          On a masked jump, the old lines leave at once behind the mask (
          <Code>AnimatePresence</Code>&apos;s <Code>custom</Code>)
        </>
      ),
      done: true,
    },
    {
      id: "synced",
      title: (
        <>
          No flash of the first station's lines on a mid-page reload: add{" "}
          <Code>isSynced</Code> to the store
        </>
      ),
      done: true,
    },
  ],
  concepts: [
    {
      title: "Variants flow down the component tree",
      body: (
        <>
          Variants name animation states, such as <Code>hidden</Code> and{" "}
          <Code>visible</Code>. Once a parent sets{" "}
          <Code>animate=&quot;visible&quot;</Code>, children with matching
          variants follow without their own <Code>initial</Code> or{" "}
          <Code>animate</Code>. That is also how the parent's transition can
          pace its children.
        </>
      ),
    },
    {
      title: "Line by line: delayChildren with stagger",
      body: (
        <>
          With <Code>delayChildren: stagger(0.08)</Code> in the parent's
          transition, the nth child waits n × 0.08 seconds. <Code>stagger</Code>{" "}
          also takes <Code>from</Code> to choose which child goes first.
        </>
      ),
    },
    {
      title: "Replaying the entrance with a key",
      body: (
        <>
          <Code>initial → animate</Code> plays once, on mount. Changing the{" "}
          <Code>key</Code> on a station change makes React treat it as a new
          component and remount it, so the entrance plays again.
        </>
      ),
    },
    {
      title: "Lines on arrival: stationIndex switches at departure",
      body: (
        <>
          <Code>stationIndex</Code> covers <Code>[flightStart, dwellEnd)</Code>,
          so it switches the moment the flight to the next station begins;
          driving the lines with it swaps them as soon as the camera sets off.
          The lines now show only during dwells, decided by the timeline's pure
          function <Code>getDwellingStationIndex</Code>: the station's index
          while dwelling, <Code>null</Code> mid-flight, and never a station
          whose <Code>dwell</Code> is 0. <Code>StationLines</Code> and{" "}
          <Code>PacingReadout</Code> share it, so no component compares
          boundaries itself; a selector returning this value re-renders only on
          arrival and departure.
        </>
      ),
    },
    {
      title: "DOM laid over the Canvas must not catch events",
      body: (
        <>
          The text layer's container uses <Code>pointer-events-none</Code> so
          events pass through to the Canvas below; elements that need clicks opt
          back in with <Code>pointer-events-auto</Code>. A transparent mask is
          the same: invisible, yet it blocks every click.
        </>
      ),
    },
    {
      title: "MotionConfig and reduced motion",
      body: (
        <>
          <Code>reducedMotion=&quot;user&quot;</Code> reads the system setting:
          when it is on, movement such as <Code>x</Code>, <Code>y</Code> and{" "}
          <Code>scale</Code> jumps straight to its end, while opacity still
          animates. It is passed down through context, so it must wrap the
          animated components. Motion's <Code>MotionConfig</Code> file starts
          with <Code>&quot;use client&quot;</Code>, so it can sit directly in a
          Server Component <Code>page.tsx</Code>, with no client wrapper.
        </>
      ),
    },
    {
      title: "AnimatePresence keeps removed components alive for a while",
      body: (
        <>
          When a <Code>key</Code> changes, React unmounts the old component at
          once; <Code>AnimatePresence</Code> holds on to it until its{" "}
          <Code>exit</Code> animation finishes.{" "}
          <Code>mode=&quot;wait&quot;</Code> makes the new component wait for
          the old one to leave. It tells which child left by the{" "}
          <Code>key</Code> of its direct children.
        </>
      ),
    },
    {
      title: "Keep AnimatePresence mounted and put the condition inside it",
      body: (
        <>
          Returning <Code>null</Code> outside <Code>AnimatePresence</Code>{" "}
          mid-flight unmounts it along with the old lines, so nothing is left to
          play the exit and the lines vanish at once. Keep{" "}
          <Code>AnimatePresence</Code> mounted and write{" "}
          <Code>{"{stationId !== null && <motion.div … />}"}</Code> inside it:
          when the child goes, it notices the old key is gone and plays{" "}
          <Code>exit</Code>.
        </>
      ),
    },
    {
      title: "The exit flash: an exiting component still re-renders",
      body: (
        <>
          During its exit, the old component is still in the tree. If it reads
          its strings from the language context, it switches to the new language
          before it fades out. Reading the strings in the parent and passing
          them as props fixes this: an exiting component keeps the last props it
          received.
        </>
      ),
    },
    {
      title: "Broken and fixed versions: they differ only on a language change",
      body: (
        <>
          The broken version, <Code>StationLinesWrong</Code>, splits the
          container into a <Code>Lines</Code> component that calls{" "}
          <Code>useLabLocale()</Code> itself. It flashes on a language change
          but not on a station change, because <Code>stationId</Code> is a prop
          and stays at its old value during the exit. The fixed version is the
          original <Code>StationLines</Code>: the language and the lines are
          worked out in the parent, so <Code>AnimatePresence</Code> keeps a{" "}
          <Code>motion.div</Code> element whose content is already written, not
          a component that reads the language itself. Both versions behave the
          same on a station change; the difference only shows on a language
          change.
        </>
      ),
    },
    {
      title: "Declarative and imperative animation",
      body: (
        <>
          The line fade is declarative: you state the target and Motion decides
          when to play it. The mask is a sequence where each step waits for the
          last, which reads better with the imperative <Code>animate()</Code>:
          it returns something you can <Code>await</Code>, so fade in, jump and
          fade out fit in one <Code>async</Code> function.
        </>
      ),
    },
    {
      title: "An exiting element gets new values only through custom",
      body: (
        <>
          An exiting element keeps its old props, so changing its{" "}
          <Code>exit</Code> goes unseen. The value of{" "}
          <Code>{"<AnimatePresence custom={…}>"}</Code> reaches every exiting
          child at once; written as a function,{" "}
          <Code>{"exit: (custom) => ({ … })"}</Code> picks its transition from
          that value when the exit starts. A masked jump passes{" "}
          <Code>{"{ isJumping: true }"}</Code>, so the exit takes no time.
        </>
      ),
    },
    {
      title: "Guarding against repeat calls: ref and state each have a job",
      body: (
        <>
          A ref takes effect as soon as it is written and is the same object on
          every render, so even a stale closure reads its latest value: the
          right tool to block repeat calls. State triggers a re-render, the
          right tool to tell other components, but a function reads the value
          from the render that created it (a stale closure). Called only from a
          button&apos;s <Code>onClick</Code>, a state guard misses nothing:
          React guarantees that updates queued by a discrete event such as a
          click finish rendering before the next discrete event. Called from a
          listener registered once with <Code>window.addEventListener</Code>,
          only a ref can block it.
        </>
      ),
    },
    {
      title: "A progress of 0 means either at the start or not known yet",
      body: (
        <>
          The store tells them apart with <Code>isSynced</Code>:{" "}
          <Code>false</Code> at first, set to <Code>true</Code> by{" "}
          <Code>setProgress</Code>. Progress stays a number, so per-frame{" "}
          <Code>useFrame</Code> readers need not handle <Code>null</Code>; only
          components that care read the field. The text layer folds the check
          into its selector, returning <Code>null</Code> both before syncing and
          mid-flight, and leaves both to <Code>AnimatePresence</Code>. The store
          is a module-level singleton, so the cleanup in{" "}
          <Code>SmoothScroll</Code> resets it with{" "}
          <Code>getInitialState()</Code>; otherwise the next page inherits this
          one&apos;s state.
        </>
      ),
    },
  ],
  pitfalls: [
    {
      title: "staggerChildren is marked as deprecated",
      symptom: (
        <>
          Following the syllabus, <Code>staggerChildren</Code> shows up struck
          through in the editor.
        </>
      ),
      cause: (
        <>
          Motion 14's type definitions mark <Code>staggerChildren</Code> and{" "}
          <Code>staggerDirection</Code> as <Code>@deprecated</Code>.
        </>
      ),
      fix: (
        <>
          Use <Code>delayChildren: stagger(interval)</Code> instead, or{" "}
          <Code>stagger(interval, &#123; from: &quot;last&quot; &#125;)</Code>{" "}
          to reverse. Import <Code>stagger</Code> from <Code>motion/react</Code>
          .
        </>
      ),
    },
    {
      title: "Lines mounted after a station change do not stagger",
      symptom: (
        <>
          With <Code>staggerChildren</Code>, the lines stagger on first load,
          but after a station change the newly mounted lines appear all at once.
        </>
      ),
      cause: (
        <>
          When the parent stays and its children are replaced, Motion works out
          a separate delay for the newly mounted children (
          <Code>enteringChildren</Code> in <Code>animation-state.mjs</Code>),
          but that code reads only the parent variant's{" "}
          <Code>delayChildren</Code>, not <Code>staggerChildren</Code>.
        </>
      ),
      fix: (
        <>
          Use <Code>delayChildren: stagger(interval)</Code>. The lines then
          stagger whether the parent changes state or the children mount later.
        </>
      ),
    },
    {
      title: "initial and animate on the children: the lines appear together",
      symptom: (
        <>
          The parent sets <Code>delayChildren</Code>, yet the lines fade in
          together on load, with no gap.
        </>
      ),
      cause: (
        <>
          <Code>initial=&quot;hidden&quot; animate=&quot;show&quot;</Code> sit
          on each child, while the parent has only <Code>variants</Code>. The
          parent never enters a state, so its transition is never used; each
          child plays on its own from the moment it mounts.
        </>
      ),
      fix: (
        <>
          Move <Code>initial</Code> and <Code>animate</Code> to the parent and
          keep only <Code>variants</Code> on the children. Once the parent
          switches to <Code>show</Code>, the state flows down and the parent's{" "}
          <Code>delayChildren</Code> applies.
        </>
      ),
    },
    {
      title: "No lines after jumping to Samarkand: the phase stays at Flight",
      symptom: (
        <>
          After a jump to Samarkand with the navigation, the camera stops at the
          station but no lines appear, and the readout's Phase shows Flight.
          Tangier is unaffected.
        </>
      ),
      cause: (
        <>
          Samarkand's <Code>flightEnd</Code> is 18 / 33, a fractional number of
          pixels. The browser snaps the scroll position to physical pixels, and
          Lenis's <Code>reset()</Code> after the jump reads back the actual{" "}
          <Code>scrollY</Code>, which can fall short by under 1 px, leaving
          progress just before <Code>flightEnd</Code>. It shows up most at a{" "}
          <Code>devicePixelRatio</Code> of 1.25 or 1.5. Tangier's{" "}
          <Code>flightEnd</Code> is 0, which cannot be rounded.
        </>
      ),
      fix: (
        <>
          When <Code>scrollToProgress</Code> converts to pixels, lean the target
          1 CSS px into the dwell (<Code>DWELL_SIDE_BIAS_PX</Code>), capped at{" "}
          <Code>lenis.limit</Code>, with no bias at progress 0. 1 px exceeds the
          error of any snapping; <Code>0.5 / devicePixelRatio</Code> only equals
          the bound for rounding, with no margin. Every jump goes through this
          function, so SKIP, the navigation and the mask are all fixed.
        </>
      ),
    },
    {
      title: "After the mask lifts, the old lines linger over the new station",
      symptom: (
        <>
          On a long jump, the mask fades in and out as expected, but only after
          it lifts do the old station&apos;s lines slowly fade out, and only
          then do the new station&apos;s lines enter.
        </>
      ),
      cause: (
        <>
          The old lines start to exit only once the jump changes progress; the
          exit takes 1 second, the mask&apos;s fade-out only 0.2.{" "}
          <Code>StationLines</Code> does not know this is a masked jump and
          keeps the pace of an ordinary station change.
        </>
      ),
      fix: (
        <>
          The provider exposes <Code>isJumping</Code> as state; the text layer
          passes it to exiting elements through{" "}
          <Code>{"<AnimatePresence custom={{ isJumping }}>"}</Code>, and{" "}
          <Code>exit</Code>, written as a function, takes no time during a jump.
        </>
      ),
    },
    {
      title: "A mid-page reload flashes the first station's lines",
      symptom: (
        <>
          After a reload in a flight or at Samarkand, Tangier&apos;s lines show
          first before the correct state takes over.
        </>
      ),
      cause: (
        <>
          The store's progress starts at 0, which means stopped at Tangier. The
          server render and the first render both use it until the{" "}
          <Code>useEffect</Code> in <Code>SmoothScroll</Code> creates Lenis and
          writes the real position.
        </>
      ),
      fix: (
        <>
          Add <Code>isSynced</Code> to the store and have the text layer return{" "}
          <Code>null</Code> until it is set. The cleanup in{" "}
          <Code>SmoothScroll</Code> unsubscribes first, then resets with{" "}
          <Code>getInitialState()</Code>, so moving between units never inherits
          the previous page&apos;s progress.
        </>
      ),
    },
  ],
  verifications: [
    {
      id: "stagger",
      body: "Scroll to the next station: on arrival, the lines enter one by one, with natural spacing.",
    },
    {
      id: "dwell-only",
      body: "Scroll down from Tangier: the lines fade out as the dwell ends, no lines show during the flight, and Mecca's lines only enter on arrival. Whenever the readout's Phase shows Flight, no lines are on screen.",
    },
    {
      id: "pointer-events",
      body: (
        <>
          Right-click an empty part of the text layer → Inspect: DevTools
          selects the <Code>&lt;canvas&gt;</Code>.
        </>
      ),
    },
    {
      id: "reduced-motion",
      body: (
        <>
          Open DevTools → <Code>Ctrl+Shift+P</Code> → type{" "}
          <Code>prefers-reduced-motion</Code> and choose to emulate{" "}
          <Code>reduce</Code>: the lines only fade in, without moving, still one
          by one. Switch the emulation off and the movement returns, with no
          reload needed.
        </>
      ),
    },
    {
      id: "exit-jump",
      body: "Broken version: on a language change, the exiting text flashes to the new language. Fixed version: it stays in the old language until it has fully faded out. On a station change, both versions fade the old station's lines out before the new station's lines enter one by one.",
    },
    {
      id: "mask",
      body: "Jump two or more stations with the navigation: the camera never visibly races past, the old view never flashes, repeated clicks during a jump cause no errors, and on arrival the lines still fade in one by one, with the readout's Phase showing Dwell.",
    },
    {
      id: "mask-exit",
      body: "After a long jump, the old station's lines are already gone when the mask lifts, and only the new station's lines fade in one by one. On an ordinary scroll to the next station, the old lines still fade out slowly.",
    },
    {
      id: "synced",
      body: "Reload in a flight, at Mecca and at Samarkand: Tangier's lines never flash first. The same holds when arriving from another unit.",
    },
  ],
};

export default content;
