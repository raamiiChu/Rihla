import {
  Code,
  type Concept,
  type Pitfall,
  type Step,
  type Verification,
} from "@/app/lab/_components";
import type { Unit02Content } from "./types";

const STEPS: Step[] = [
  {
    id: "store",
    title: (
      <>
        Create the store: <Code>progress</Code>, <Code>stationIndex</Code>,{" "}
        <Code>setProgress</Code>
      </>
    ),
    done: true,
  },
  {
    id: "smooth-scroll",
    title:
      "SmoothScroll: create Lenis, run our own rAF loop, write to the store",
    done: true,
  },
  {
    id: "station-readout",
    title: (
      <>
        StationReadout: show <Code>stationIndex</Code> through a selector
      </>
    ),
    done: true,
  },
  {
    id: "progress-readout",
    title: (
      <>
        ProgressReadout: read <Code>getState()</Code> in rAF and write straight
        to the DOM
      </>
    ),
    done: true,
  },
  {
    id: "anti-pattern",
    title: (
      <>
        The wrong way: subscribe to <Code>progress</Code> with a selector
      </>
    ),
    done: true,
  },
  {
    id: "devtools",
    title: "Check the result with React DevTools' Highlight updates",
    done: true,
  },
];

const CONCEPTS: Concept[] = [
  {
    title: "Read high- and low-frequency data differently",
    body: (
      <>
        <Code>progress</Code> changes every frame; subscribed to as React state,
        it would re-render the component about 60 times a second.{" "}
        <Code>stationIndex</Code> changes only a few times over the whole
        scroll, so a selector subscription is fine. One store, two kinds of
        field, two ways to read them.
      </>
    ),
  },
  {
    title: "Selectors decide on re-renders with Object.is",
    body: (
      <>
        On every store update, zustand runs the selector again and compares the
        old and new results with <Code>Object.is</Code>. Writing 1 over a{" "}
        <Code>stationIndex</Code> of 1 gives the same result, so the component
        stays put; writing every frame is harmless. Calling{" "}
        <Code>useScrollStore()</Code> without a selector selects the whole state
        object, and since every <Code>set</Code> produces a new object, the
        component re-renders every frame.
      </>
    ),
  },
  {
    title: "TypeScript with zustand 5",
    body: (
      <>
        The extra empty parentheses in{" "}
        <Code>{"create<ScrollState>()((set) => ({ … }))"}</Code> are deliberate:
        the type goes first and the function second, so TypeScript can infer the
        middleware types correctly.
      </>
    ),
  },
  {
    title: "stationIndex comes from ranges",
    body: (
      <>
        It uses an array of boundaries with <Code>findIndex</Code>, not{" "}
        <Code>Math.floor(progress * 3)</Code>: the stations will not all be the
        same length. Unit 05 replaced the boundary array with one derived from
        the timeline's weights (<Code>getStationIndex</Code>).
      </>
    ),
  },
  {
    title: "How Lenis smooths scrolling",
    body: (
      <>
        It intercepts wheel and touch events, records the target position, and
        every frame moves the current position a little closer to it (
        <Code>lerp</Code>, 10% by default), then writes it back with{" "}
        <Code>window.scrollTo</Code>. This has to happen every frame, so
        something must call <Code>lenis.raf(time)</Code> every frame.
      </>
    ),
  },
  {
    title: "autoRaf: false, and a loop of our own",
    body: (
      <>
        With <Code>autoRaf: true</Code>, Lenis's <Code>raf()</Code> schedules
        the next frame itself. That makes it a separate rAF callback from R3F's,
        with no guarantee which runs first in a frame, so the camera could read
        the previous frame's progress. Calling <Code>raf()</Code> by hand inside{" "}
        <Code>addEffect</Code> as well would spawn another never-ending loop on
        every call. Hence the rule: always <Code>autoRaf: false</Code>. The loop
        written in this unit is unit 03's fallback loop.
      </>
    ),
  },
  {
    title: "Create Lenis inside useEffect",
    body: (
      <>
        At the top level of the module: a <Code>&apos;use client&apos;</Code>{" "}
        component still runs on the server, and the instance is never destroyed,
        so it keeps taking over scrolling on other pages after you leave. In the
        component body: a new instance on every render. <Code>useEffect</Code>{" "}
        runs only in the browser, after mounting, and runs its cleanup on
        unmount, tying the lifecycle to the component.
      </>
    ),
  },
  {
    title: "The rAF loop and closures",
    body: (
      <>
        <Code>requestAnimationFrame</Code> calls back only once; the callback
        must request again to form a loop. Each request returns a new id, so a{" "}
        <Code>let</Code> variable is overwritten every frame. The cleanup and{" "}
        <Code>loop</Code> are created in the same effect, and the closure
        captures the variable itself, so the cleanup reads the latest id with no
        need for <Code>useRef</Code>.
      </>
    ),
  },
  {
    title: "Clean up in reverse order of creation",
    body: (
      <>
        First <Code>cancelAnimationFrame</Code>, then unsubscribe (the return
        value of <Code>lenis.on()</Code> is the unsubscribe function), and
        finally <Code>lenis.destroy()</Code>, so a destroyed instance never has{" "}
        <Code>raf()</Code> called on it in the next frame.
      </>
    ),
  },
  {
    title:
      "destroy() clears every listener, but unsubscribing is still a good habit",
    body: (
      <>
        <Code>lenis.destroy()</Code> empties its emitter internally (
        <Code>this.events = {"{}"}</Code>), removing every listener registered
        with <Code>lenis.on()</Code>. When the listener and Lenis are created
        and destroyed together in one effect, <Code>unsubscribe()</Code> is
        redundant and is kept here only to be explicit. In the main project,
        Lenis may live at the root and outlive the components listening to it;
        when such a component unmounts, Lenis is not destroyed, so you must call{" "}
        <Code>unsubscribe()</Code> yourself or the listener lingers and leaks
        memory.
      </>
    ),
  },
  {
    title: "The store outlives the page: reset it in the cleanup",
    body: (
      <>
        The store is a module-level singleton that survives a move to another
        unit, so after <Code>unsubscribe()</Code> the cleanup calls{" "}
        <Code>useScrollStore.setState(useScrollStore.getInitialState())</Code>.
        Unit 06 explains why, under <Code>isSynced</Code>.
      </>
    ),
  },
  {
    title: "Lenis respects reduced motion by default",
    body: (
      <>
        In Lenis 1.3, <Code>respectReducedMotion</Code> defaults to{" "}
        <Code>true</Code>: when the system asks for reduced motion,{" "}
        <Code>lerp</Code> is set to 1 and the smoothing disappears. Turning off
        &quot;Animation effects&quot; in Windows triggers it. Unit 16 may be
        able to use this option to simplify switching on the fly.
      </>
    ),
  },
  {
    title: "Bypassing React: writing to the DOM through a ref",
    body: (
      <>
        ProgressReadout has no changing state. The rAF loop reads{" "}
        <Code>getState()</Code> and writes the number into{" "}
        <Code>ref.current.textContent</Code>; React never knows, so the
        component renders only once. Changing <Code>mesh.position</Code>{" "}
        directly in <Code>useFrame</Code> in unit 03 is the same idea. The
        span's initial text must be a fixed constant (<Code>0.0000</Code>), not
        a changing value rendered by React, or a re-render would overwrite the
        number the loop wrote.
      </>
    ),
  },
  {
    title: "A selector returning a new object re-renders every frame",
    body: (
      <>
        <Code>{"useScrollStore((s) => ({ index: s.stationIndex }))"}</Code>{" "}
        returns a new object every time, so <Code>Object.is</Code> is always{" "}
        <Code>false</Code>. Selecting a single primitive is best; when you need
        several values, use <Code>useShallow</Code>, which compares the object's
        fields one by one.
      </>
    ),
  },
  {
    title: "Push the 'use client' boundary as far down as possible",
    body: (
      <>
        <Code>DemoPane</Code> stays a Server Component; only StationReadout and
        ProgressReadout, which use hooks, get{" "}
        <Code>&apos;use client&apos;</Code>. A Server Component can render
        Client Components as its children.
      </>
    ),
  },
  {
    title: "aria-live is only for low-frequency content",
    body: (
      <>
        Whenever the text in a live region changes, screen readers read it out.
        stationIndex changes only when crossing a station, so it suits an{" "}
        <Code>&lt;output&gt;</Code> with{" "}
        <Code>aria-live=&quot;polite&quot;</Code>; progress changes every frame
        and would be read out non-stop. Both are changing numbers, but they
        update at different rates and need different handling.
      </>
    ),
  },
  {
    title: "Multiple rAF loops run in no guaranteed order",
    body: (
      <>
        SmoothScroll and ProgressReadout each have a loop, with no guarantee
        which runs first in a frame, so ProgressReadout may show the previous
        frame's value. A displayed number hides the difference; a camera would
        not. Unit 03 gathers each frame's work into R3F's single loop, fixing
        the order as &quot;update scroll → write to the store → read&quot;.
      </>
    ),
  },
];

const PITFALLS: Pitfall[] = [
  {
    title: "Subscribing to the scroll event without reading the initial value",
    symptom:
      "Reload halfway down the page and the view is restored halfway down, yet progress and stationIndex stay at 0 until you scroll a little.",
    cause: (
      <>
        The browser's scroll restoration puts the page back, but no scrolling
        takes place, so Lenis emits no <Code>&quot;scroll&quot;</Code> event.
        Events report changes, not the initial state, so the store keeps its
        initial value until the first change. This surfaced in unit 03 when the
        Canvas loaded lazily: the cube appeared at the top, then jumped into
        place on the first scroll.
      </>
    ),
    fix: (
      <>
        After creating Lenis, write <Code>lenis.progress</Code> to the store
        once, then subscribe to later changes. It is the same reason React's{" "}
        <Code>useSyncExternalStore</Code> asks for both <Code>subscribe</Code>{" "}
        and <Code>getSnapshot</Code>. Scroll restoration is not guaranteed to
        happen before the effect; if the value still occasionally stays at 0,
        the restoration came later and needs handling separately.
      </>
    ),
  },
  {
    title: "Lenis created at the top level of the module",
    symptom:
      "It may throw on the server, and scrolling on other pages stays taken over after you leave.",
    cause: (
      <>
        A <Code>&apos;use client&apos;</Code> module runs on the server too;
        top-level code runs only once, and nothing ever destroys the instance.
      </>
    ),
    fix: (
      <>
        Create it inside <Code>useEffect</Code> and call <Code>destroy()</Code>{" "}
        in the cleanup.
      </>
    ),
  },
  {
    title: "The live region wraps progress too",
    symptom: "Screen readers read out the progress every frame.",
    cause: (
      <>
        The <Code>&lt;output aria-live&gt;</Code> wrapped both StationReadout
        and ProgressReadout.
      </>
    ),
    fix: (
      <>
        Wrap only StationReadout in <Code>aria-live</Code>, and use a plain{" "}
        <Code>&lt;div&gt;</Code> for the outer flex layout.
      </>
    ),
  },
  {
    title: "Block elements inside <output>",
    symptom: (
      <>
        <Code>&lt;output&gt;</Code> contains a <Code>&lt;p&gt;</Code> or{" "}
        <Code>&lt;div&gt;</Code>, and everything looks fine.
      </>
    ),
    cause: (
      <>
        <Code>&lt;output&gt;</Code> may only contain phrasing content; block
        elements make the HTML invalid, and screen readers and hydration may
        behave unexpectedly.
      </>
    ),
    fix: (
      <>
        Use <Code>&lt;span&gt;</Code> instead, and leave the layout to the{" "}
        <Code>&lt;output&gt;</Code>&apos;s own flex or to an outer{" "}
        <Code>&lt;div&gt;</Code>.
      </>
    ),
  },
];

const VERIFICATIONS: Verification[] = [
  {
    id: "strict-mode",
    body: (
      <>
        Add a log line at the start of the effect and in its cleanup, then
        reload /lab/02: the console shows created → destroyed → created. Strict
        Mode mounts twice, and only one Lenis remains.
      </>
    ),
  },
  {
    id: "html-class",
    body: (
      <>
        In the Elements panel, <Code>&lt;html&gt;</Code> has classes starting
        with <Code>lenis</Code>; after clicking &quot;← Back to the lab&quot;
        they are gone and /lab scrolls natively again.
      </>
    ),
  },
  {
    id: "initial-progress",
    body: "Reload halfway down the page: without scrolling, ProgressReadout and StationReadout already show the values for the current position.",
  },
  {
    id: "highlight-updates",
    body: (
      <>
        Uncomment ProgressReadoutWrong in <Code>page.tsx</Code>, turn on
        Highlight updates in React DevTools and scroll: the three components
        behave as in &quot;Re-render comparison&quot; above.
      </>
    ),
  },
];

const CONCLUSIONS: Verification[] = [
  {
    id: "read-by-frequency",
    body: (
      <>
        One store:{" "}
        <strong>
          read high-frequency fields with <Code>getState()</Code>
        </strong>
        , subscribe to low-frequency ones with a selector. A component that
        subscribes to progress through a selector re-renders every frame while
        scrolling.
      </>
    ),
  },
  {
    id: "own-loop",
    body: (
      <>
        Lenis is set to <Code>autoRaf: false</Code> and driven by our own rAF
        loop, which the <Code>useEffect</Code> cleanup tears down completely in
        reverse order. This loop is unit 03's fallback loop.
      </>
    ),
  },
  {
    id: "moved",
    body: (
      <>
        The store now lives in the main project at{" "}
        <Code>src/stores/scroll.ts</Code>. From unit 05 on, stationIndex is
        computed from boundaries derived from the weights in{" "}
        <Code>src/data/timeline.ts</Code>, and the demo shows the stop id
        directly.
      </>
    ),
  },
];

const CONTENT: Unit02Content = {
  intro: (
    <>
      Scroll progress is written to a zustand store, and the high-frequency{" "}
      <Code>progress</Code> and low-frequency <Code>stationIndex</Code> are read
      in different ways. This page is itself the Lenis smooth-scrolling demo:
      scroll down and the store updates.
    </>
  ),
  demoCaption: "Smooth scrolling",
  steps: STEPS,
  conclusions: { title: "Conclusions", items: CONCLUSIONS },
  readTable: {
    title: "Three ways to read and write zustand",
    caption: "How each way of reading and writing zustand affects re-renders",
    columns: { syntax: "Syntax", rerender: "Re-renders", usage: "Used in" },
    rows: {
      selector: {
        rerender: "Only when the selected value changes",
        usage: "DOM components reading low-frequency fields",
      },
      "get-state": {
        rerender: "Never",
        usage: "useFrame, rAF loops, event callbacks",
      },
      set: {
        rerender: "Only components subscribed to that field",
        usage: "Lenis's scroll event",
      },
    },
  },
  renderTable: {
    title: "Re-render comparison",
    caption: "Re-renders while scrolling for the three ways of reading",
    columns: { component: "Component", read: "How it reads" },
    rows: {
      station: {
        highlight: "Flashes only when crossing a station",
        log: "Logs only when crossing a station",
      },
      progress: { highlight: "Never flashes", log: "Logs once at the start" },
      wrong: {
        highlight: "Flashes constantly while scrolling",
        log: "Floods the console while scrolling",
      },
    },
  },
  concepts: CONCEPTS,
  pitfalls: PITFALLS,
  verifications: VERIFICATIONS,
};

export default CONTENT;
