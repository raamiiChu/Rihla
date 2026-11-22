import {
  Code,
  type Concept,
  type Pitfall,
  type Step,
  type Verification,
} from "@/app/lab/_components";
import type { Unit03Content } from "./types";

const STEPS: Step[] = [
  {
    id: "progress-box",
    title: (
      <>
        ProgressBox: move a box by progress inside <Code>useFrame</Code>
      </>
    ),
    done: true,
  },
  {
    id: "scroll-driver",
    title: "scrollDriver: one place that decides what drives Lenis",
    done: true,
  },
  {
    id: "handoff",
    title: (
      <>
        Handoff: drive with <Code>addEffect</Code> after <Code>onCreated</Code>
      </>
    ),
    done: true,
  },
  {
    id: "counter",
    title: "Counter: record each frame's caller and any duplicates",
    done: true,
  },
  {
    id: "context-lost",
    title:
      "Switch back to the fallback when the context is lost, and return to R3F once it is restored",
    done: true,
  },
  {
    id: "delay",
    title:
      "Delay the Canvas by 3 seconds to confirm the page still scrolls before it mounts",
    done: true,
  },
];

const CONCEPTS: Concept[] = [
  {
    title: "useFrame: every frame, before rendering",
    body: (
      <>
        <Code>useFrame((state, delta) =&gt; …)</Code> registers a callback in
        R3F's loop, called once per frame before <Code>gl.render()</Code>.{" "}
        <Code>state</Code> holds <Code>camera</Code>, <Code>scene</Code>,{" "}
        <Code>gl</Code>, <Code>size</Code> and more; <Code>delta</Code> is the
        number of seconds since the previous frame. It relies on the context the
        Canvas provides, so it only works in components inside{" "}
        <Code>&lt;Canvas&gt;</Code>.
      </>
    ),
  },
  {
    title: "Change three objects directly in useFrame, bypassing React",
    body: (
      <>
        Get the mesh with <Code>useRef&lt;Mesh&gt;</Code>, read{" "}
        <Code>getState().progress</Code> every frame and set{" "}
        <Code>position</Code> and <Code>rotation</Code> directly. The component
        has no changing state and renders only once; it is the same idea as unit
        02's ProgressReadout. Never call <Code>setState</Code> inside{" "}
        <Code>useFrame</Code>.
      </>
    ),
  },
  {
    title: "Derive from progress, don't accumulate over time",
    body: (
      <>
        With <Code>rotation.y = lerp(0, 2π, progress)</Code>, scrolling back
        turns the box back and stopping stops it; with{" "}
        <Code>rotation.y += delta</Code> it keeps spinning, and the same scroll
        position gives a different angle every time. Anything driven by scroll
        must be a function of progress, which is also why the camera is written
        as a pure function. Keep <Code>delta</Code> for animation unrelated to
        scrolling, such as the drifting point cloud.
      </>
    ),
  },
  {
    title: "Don't smooth twice",
    body: (
      <>
        Lenis has already smoothed progress, so assigning it straight to{" "}
        <Code>position</Code> is smooth. Add another layer of easing in{" "}
        <Code>useFrame</Code> and the box lags visibly behind the scroll, then
        keeps sliding after you stop.
      </>
    ),
  },
  {
    title: "How much of the scene is visible",
    body: (
      <>
        The default camera sits at <Code>z = 5</Code> with{" "}
        <Code>fov = 75°</Code>, so the visible height of the <Code>z = 0</Code>{" "}
        plane is <Code>2 × 5 × tan(37.5°) ≈ 7.7</Code>, with y running from
        about −3.8 to 3.8. The box moves between y = 2 and −2 and is 2 units
        wide, so it never leaves the frame.
      </>
    ),
  },
  {
    title: "The order of each R3F frame",
    body: (
      <>
        <Code>loop()</Code> first schedules the next frame, then runs the{" "}
        <Code>addEffect</Code> callbacks → each Canvas's <Code>useFrame</Code>{" "}
        and <Code>gl.render()</Code> → <Code>addAfterEffect</Code>. Calling{" "}
        <Code>lenis.raf()</Code> inside <Code>addEffect</Code> fixes the order
        as "update the scroll → read → render".
      </>
    ),
  },
  {
    title: "addEffect is global, and only runs while R3F's loop runs",
    body: (
      <>
        The callbacks live in a module-level Set, not tied to any Canvas, so
        unmounting a Canvas does not remove them: call the cancel function it
        returns. When no Canvas needs rendering (the Canvas has unmounted, or{" "}
        <Code>frameloop=&quot;demand&quot;</Code> is idle), R3F's loop stops and{" "}
        <Code>addEffect</Code> stops with it. That is why this project's Canvas
        keeps the default <Code>frameloop=&quot;always&quot;</Code>.
      </>
    ),
  },
  {
    title: "One module owns “who is driving”",
    body: (
      <>
        If starting and cancelling the fallback loop and <Code>addEffect</Code>{" "}
        were scattered across several components, it would be hard to guarantee
        a single caller at any moment. <Code>scrollDriver</Code> owns this
        state: every switch stops the current caller before starting the new
        one, repeated calls are harmless (idempotent), and the invariant only
        has to hold in one file.
      </>
    ),
  },
  {
    title: "An ES module is already a singleton",
    body: (
      <>
        However many files on a page import <Code>scrollDriver</Code>, they all
        get the same module and the same module-level variables, so SmoothScroll
        and Scene work on the same driver. The driver state is a running
        resource (a rAF id, a cancel function), not data for the screen, so it
        belongs in neither React state nor zustand. In development, editing this
        file makes HMR re-run the module and reset the variables; on the server,
        the module is shared by every request, so these functions are only
        called from browser-side places such as effects and{" "}
        <Code>onCreated</Code>.
      </>
    ),
  },
  {
    title: "Use null for “not running” and derive the driver",
    body: (
      <>
        Store only <Code>fallbackId</Code> and <Code>removeEffect</Code>;{" "}
        <Code>getDriver()</Code> derives fallback, r3f or none from them. A
        separate <Code>driver</Code> field would record the same fact twice, and
        the two could disagree.
      </>
    ),
  },
  {
    title: "Do nothing without Lenis",
    body: (
      <>
        On unmount, whether SmoothScroll's or Scene's cleanup runs first is not
        guaranteed. If anyone calls <Code>driveWithFallback()</Code> after{" "}
        <Code>detachLenis()</Code>, the loop must not restart, so both{" "}
        <Code>driveWith…</Code> functions check <Code>lenis</Code> first.
      </>
    ),
  },
  {
    title: "Dependency injection keeps three out of the main bundle",
    body: (
      <>
        SmoothScroll is a normal import, so every module it references lands in
        the page's main bundle. If <Code>scrollDriver</Code> imported{" "}
        <Code>addEffect</Code> directly, R3F and the three it depends on would
        probably come along too, wasting the code splitting from{" "}
        <Code>dynamic</Code>. Instead Scene, already in the dynamic chunk, calls{" "}
        <Code>driveWithR3f(addEffect)</Code>, and the driver only needs the
        parameter's type; Lenis is imported with <Code>import type</Code> only
        as well.
      </>
    ),
  },
  {
    title: "Every call goes through tick()",
    body: (
      <>
        Both the fallback loop and <Code>addEffect</Code> call the same{" "}
        <Code>tick()</Code> rather than <Code>lenis.raf()</Code> directly. A
        counter added to <Code>tick()</Code> later then catches every call.
      </>
    ),
  },
  {
    title: "onCreated: R3F is ready to take over but has not drawn a frame",
    body: (
      <>
        After the Canvas creates the R3F root, the renderer becomes ready{" "}
        <strong>asynchronously</strong> (v9 supports WebGPU). Only then are the
        children rendered and <Code>onCreated(state)</Code> called; the next R3F
        loop starts <Code>addEffect</Code> → <Code>useFrame</Code> → the first
        render, which makes it the right moment to hand over. During the handoff
        one frame may go without a <Code>lenis.raf()</Code> call, but only ever
        one fewer, never one more; Lenis computes movement from the time
        difference, so the next frame catches up.
      </>
    ),
  },
  {
    title: "Hand the driver back when the Canvas unmounts",
    body: (
      <>
        When no Canvas needs rendering, R3F's loop stops and{" "}
        <Code>addEffect</Code> is no longer called. If only the Canvas goes
        while Lenis lives on (say WebGL fails to initialise and a static image
        is shown instead), the page stops scrolling, so Scene's cleanup must
        call <Code>driveWithFallback()</Code>. When the whole page unmounts,
        Lenis may already be detached, and the call returns early because there
        is no Lenis.
      </>
    ),
  },
  {
    title: "Under Strict Mode, onCreated fires only once",
    body: (
      <>
        R3F's Canvas only unmounts its root when the <Code>&lt;canvas&gt;</Code>{" "}
        really leaves the DOM (<Code>!canvas.isConnected</Code>). Strict Mode's
        simulated unmount does not remove the DOM, so the root survives and{" "}
        <Code>onCreated</Code> does not fire again. If the cleanup hands the
        driver back but the setup never takes it again, the page can get stuck
        on the fallback. Keep an effect's setup and cleanup symmetrical:
        remember with a <Code>useRef</Code> whether the Canvas exists, and call{" "}
        <Code>driveWithR3f</Code> in the setup if it does. Values that don't
        affect the screen go in refs, not state.
      </>
    ),
  },
  {
    title: "The caller passes its own name instead of using getDriver()",
    body: (
      <>
        The counter exists to catch “both sources running at once”, a state that
        is already wrong. In that case <Code>getDriver()</Code> checks{" "}
        <Code>fallbackId</Code> first, so both calls would count as fallback. To
        detect a broken state, the evidence cannot be derived from that state:
        the fallback loop calls <Code>tick(t, &quot;fallback&quot;)</Code>, and
        the arrow function given to <Code>addEffect</Code> adds{" "}
        <Code>&quot;r3f&quot;</Code>. The cancel function that{" "}
        <Code>addEffect</Code> returns is tied to that registration, so the
        wrapper does not affect <Code>removeEffect</Code>.
      </>
    ),
  },
  {
    title: "Exclude and Record: derive from existing types",
    body: (
      <>
        <Code>type Source = Exclude&lt;Driver, &quot;none&quot;&gt;</Code>{" "}
        removes <Code>&quot;none&quot;</Code> from the union and follows along
        when <Code>Driver</Code> gains a source. Counting with{" "}
        <Code>Record&lt;Source, number&gt;</Code> lets{" "}
        <Code>counts[source] += 1</Code> handle every source in one line with no
        if/else, and TypeScript complains about a missing key.
      </>
    ),
  },
  {
    title: "getStats() returns a copy",
    body: (
      <>
        Returning <Code>counts</Code> itself would let callers change the
        module's internal counts. <Code>{"{ ...counts }"}</Code> separates them
        at run time; <Code>Readonly&lt;…&gt;</Code> only checks at compile time.
        Spreading is a shallow copy, which is enough as the values are all
        numbers. One small object per frame costs next to nothing, and with no
        selector comparison here it cannot cause re-renders as it would with
        zustand.
      </>
    ),
  },
  {
    title: "Showing high-frequency values: rAF + textContent + data-*",
    body: (
      <>
        The stats change every frame, so like progress they stay out of zustand
        and React state. DriverReadout follows unit 02: its own rAF loop reads{" "}
        <Code>getStats()</Code> every frame and writes <Code>textContent</Code>.
        The loop only reads and never calls <Code>lenis.raf()</Code>, so the
        invariant holds. State is written as <Code>data-alert</Code> and{" "}
        <Code>data-driver</Code>, and colour is left to Tailwind's{" "}
        <Code>data-[alert=true]:text-destructive</Code>: JS only changes state,
        CSS decides the look, and the classes stay in JSX where Biome can sort
        them. The numbers use <Code>tabular-nums</Code> for equal-width digits,
        so the line does not jitter as they change.
      </>
    ),
  },
  {
    title: "Losing and restoring the WebGL context",
    body: (
      <>
        The GPU is shared by the whole device, and the browser may reclaim the
        context at any time (low memory, a tab left in the background too long,
        a driver reset). When it does, the canvas fires{" "}
        <Code>webglcontextlost</Code> and every later GL call is a no-op; when
        the browser gives it back, it fires <Code>webglcontextrestored</Code>.
        For the browser to attempt a restore, the lost event must call{" "}
        <Code>preventDefault()</Code>; three's <Code>onContextLost</Code>{" "}
        already does, so the listener only has to switch the driver.
      </>
    ),
  },
  {
    title: "Simulating it with WEBGL_lose_context",
    body: (
      <>
        <Code>
          gl.getContext().getExtension(&quot;WEBGL_lose_context&quot;)
        </Code>{" "}
        provides <Code>loseContext()</Code> and <Code>restoreContext()</Code>.
        The extension object must be fetched and kept <strong>before</strong>{" "}
        the loss (stored in a ref in <Code>onCreated</Code>): afterwards{" "}
        <Code>getExtension()</Code> returns <Code>null</Code>. The{" "}
        <Code>?.</Code> on the buttons skips a null silently, so check the
        console's <Code>Context Lost.</Code> message to confirm the context
        really was lost.
      </>
    ),
  },
  {
    title: "AbortController: remove several listeners at once",
    body: (
      <>
        <Code>addEventListener(type, fn, {"{ signal }"})</Code> ties the
        listener to the signal, and <Code>controller.abort()</Code> removes them
        all together. Listeners can be inline arrow functions, with no need to
        keep references for <Code>removeEventListener</Code>.
      </>
    ),
  },
  {
    title: "Let “connect” return its own “disconnect”",
    body: (
      <>
        <Code>connectR3f(canvas)</Code> hands over to R3F and adds the
        listeners; the function it returns removes the listeners and hands back
        to the fallback. It is the same design as <Code>addEffect</Code> and{" "}
        <Code>lenis.on</Code> returning cancel functions. Both{" "}
        <Code>onCreated</Code> and the effect setup call it, and the cleanup
        only calls the function it returned, so setup and cleanup are defined by
        one function and can never drift apart. The disconnect function is kept
        in a ref and cleared to <Code>null</Code> once the cleanup has called
        it.
      </>
    ),
  },
  {
    title: "R3F loses the context on purpose when it unmounts",
    body: (
      <>
        When R3F unmounts its root it calls <Code>gl.forceContextLoss()</Code>,
        which fires <Code>webglcontextlost</Code>. The event is dispatched
        asynchronously, so the effect cleanup has usually already called{" "}
        <Code>abort()</Code>. Even if the listener is still there,{" "}
        <Code>driveWithFallback()</Code> is idempotent, and returns early once
        Lenis is detached, so the loop never restarts.
      </>
    ),
  },
  {
    title: "dynamic's loader is just “a function returning a Promise”",
    body: (
      <>
        <Code>dynamic</Code> only waits for the Promise to resolve, showing{" "}
        <Code>loading</Code> meanwhile, and does not care where the Promise
        comes from. <Code>await wait(ms)</Code> followed by{" "}
        <Code>return import(&quot;./Scene&quot;)</Code> delays the load;{" "}
        <Code>wait</Code> is a small function that wraps <Code>setTimeout</Code>{" "}
        in a Promise. Running them in sequence simulates a slow network (3
        seconds plus the download); starting both with <Code>Promise.all</Code>{" "}
        means “show the loading screen for at least 3 seconds”, which is what
        production loading animations tend to use.
      </>
    ),
  },
  {
    title: "Write import() as a literal string, inside the loader",
    body: (
      <>
        Turbopack only splits Scene and three into their own chunk because it
        finds <Code>import(&quot;./Scene&quot;)</Code> at build time, and the
        Next compiler looks for it among <Code>dynamic(...)</Code>'s arguments.
        The path cannot be a variable, and the call cannot move outside{" "}
        <Code>dynamic</Code> to run early, or the download starts straight away
        and the delay is pointless.
      </>
    ),
  },
];

const PITFALLS: Pitfall[] = [
  {
    title: "Assuming a filled <Canvas ref> means R3F is ready",
    symptom: (
      <>
        After a reload the fallback count is close to 0 and the driver is r3f
        from the start; if WebGL fails to initialise, the page never scrolls.
      </>
    ),
    cause: (
      <>
        R3F points the ref at the <Code>&lt;canvas&gt;</Code> with{" "}
        <Code>useImperativeHandle</Code>, so it is filled during the commit,
        before any effect; the renderer only becomes ready later,
        asynchronously. Seeing a filled ref, the effect handed over to R3F, and
        nothing drove Lenis until the renderer was ready.
      </>
    ),
    fix: (
      <>
        Drop the <Code>ref</Code> prop and set{" "}
        <Code>canvasRef.current = state.gl.domElement</Code> by hand in{" "}
        <Code>onCreated</Code>, so a filled ref really does mean “ready”.
      </>
    ),
  },
  {
    title: "Returning a cleanup from onCreated",
    symptom: "The listeners are never removed.",
    cause: (
      <>
        <Code>onCreated</Code> is an ordinary callback, not an effect, and R3F
        ignores its return value.
      </>
    ),
    fix: "Keep the disconnect function in a ref and call it from the effect's cleanup.",
  },
  {
    title: "Returning early from an effect skips registering the cleanup",
    symptom:
      "Unmounting only the Canvas does not hand back to the fallback, and the page stops scrolling.",
    cause: (
      <>
        Written as “return if not created yet”, the effect ends immediately on
        its first run because <Code>onCreated</Code> has not fired; with{" "}
        <Code>[]</Code> as its dependencies it never runs again, so the cleanup
        is never registered.
      </>
    ),
    fix: "Wrap only the setup in the condition and always return the cleanup.",
  },
  {
    title: "Adding aria-label to a button that already has text",
    symptom: (
      <>
        The button says “Lose context”, but the screen reader reads “Loss
        context”.
      </>
    ),
    cause: (
      <>
        <Code>aria-label</Code> replaces the visible text as the accessible
        name; when the two differ, voice-control users cannot click the button
        by saying what they see (WCAG 2.5.3 Label in Name).
      </>
    ),
    fix: (
      <>
        Leave out <Code>aria-label</Code> when there is visible text; only icon
        buttons need it. <Code>role=&quot;toolbar&quot;</Code> promises
        arrow-key navigation, so don't declare it without implementing it.
      </>
    ),
  },
  {
    title: "After the delayed load, the box appears at the top first",
    symptom:
      "Reload halfway down the page: when the Canvas appears the box is at the top, and only jumps into place after some scrolling.",
    cause: (
      <>
        SmoothScroll only listens for the <Code>&quot;scroll&quot;</Code> event;
        the browser restoring the scroll position does not fire it, so progress
        in the store stays at 0.
      </>
    ),
    fix: (
      <>
        After creating Lenis, write <Code>lenis.progress</Code> to the store
        once, then subscribe. This belongs to unit 02; see its notes.
      </>
    ),
  },
];

const VERIFICATIONS: Verification[] = [
  {
    id: "attach-detach",
    body: (
      <>
        Log <Code>getDriver()</Code> after <Code>attachLenis()</Code> and{" "}
        <Code>detachLenis()</Code>: after a reload the console shows fallback →
        none → fallback (Strict Mode mounting twice), and the box still moves
        with the scroll.
      </>
    ),
  },
  {
    id: "handoff",
    body: (
      <>
        Log <Code>getDriver()</Code> in <Code>onCreated</Code> and in Scene's
        cleanup, then reload several times: the final state is always r3f, never
        occasionally stuck on fallback.
      </>
    ),
  },
  {
    id: "canvas-only-unmount",
    body: "With only the Canvas hidden, the page still scrolls and the driver is fallback; showing it again fires onCreated and switches back to r3f.",
  },
  {
    id: "counter-normal",
    body: "DriverReadout shows the driver changing from fallback to r3f; after the handoff the fallback count stops, the R3F count starts rising, and duplicates stay at 0.",
  },
  {
    id: "counter-broken",
    body: (
      <>
        Temporarily comment out the <Code>stop()</Code> in{" "}
        <Code>driveWithR3f()</Code>: both counts rise together, and duplicates
        go up by 1 every frame and turn red, proving the counter really counts.
        Restore it and they go back to 0.
      </>
    ),
  },
  {
    id: "before-canvas",
    body: "For the first 3 seconds after a reload (before the Canvas appears), the page already scrolls smoothly, and DriverReadout shows fallback with a rising count.",
  },
  {
    id: "after-canvas",
    body: "Once the Canvas appears, the driver switches to r3f, the fallback count stops, and duplicates stay at 0.",
  },
  {
    id: "scroll-during-delay",
    body: "Scroll halfway down during the gap and wait for the Canvas: the box appears straight away at the matching position.",
  },
  {
    id: "reload-mid-page",
    body: "Reload halfway down and don't scroll: when the Canvas appears, the box is already in the middle.",
  },
  {
    id: "context-lost-loop",
    body: (
      <>
        Temporarily leave out the listeners and press “Lose context”: the
        console shows <Code>THREE.WebGLRenderer: Context Lost.</Code> and the
        canvas goes blank, but the R3F count keeps rising and the page still
        scrolls smoothly, proving that R3F's loop has not stopped.
      </>
    ),
  },
  {
    id: "context-lost",
    body: "With the listeners in place, press “Lose context”: the driver switches back to fallback, the R3F count stops, the fallback count starts rising, duplicates stay at 0, and the page still scrolls.",
  },
  {
    id: "context-restored",
    body: "Press “Restore context” while scrolling: the driver switches back to r3f and the box appears straight away where the current scroll position puts it, rather than sliding over from where it was before the loss.",
  },
  {
    id: "no-duplicates",
    body: "Throughout, the number of duplicate lenis.raf() calls within one frame stays at 0.",
  },
];

const CONTENT: Unit03Content = {
  intro: (
    <>
      Make Lenis and R3F run in a fixed order: a fallback loop drives Lenis
      until the Canvas is ready, <Code>addEffect</Code> takes over once it is,
      and control switches back if the context is lost. At any moment only one
      caller runs <Code>lenis.raf()</Code>.
    </>
  ),
  demoCaption:
    "A box that moves with the scroll, plus what is currently driving Lenis and how often each source has called it.",
  readout: {
    driver: "Driver",
    fallback: "Fallback calls",
    r3f: "R3F calls",
    duplicates: "Same-frame duplicates",
  },
  steps: STEPS,
  handoff: {
    title: "Switching the driver",
    timeline: {
      drivers: {
        fallback: "Driven by the fallback",
        r3f: "Driven by R3F",
        none: "All stopped",
      },
      notes: {
        initial: "Before the Canvas mounts",
        created: "Canvas ready",
        lost: "Frozen frame, still scrolls",
        restored: "Rendering resumes",
        unmount: "Can happen at any stage",
      },
      unmount: "Unmount",
    },
    paragraphs: [
      {
        id: "why-not-fallback",
        body: (
          <>
            <strong>Why not always use the fallback?</strong> The fallback loop
            and R3F's loop are two separate rAF callbacks, and which runs first
            in a frame depends on the order they were registered, with no
            guarantee. If R3F runs first, <Code>useFrame</Code> reads the
            previous frame's progress, so the picture lags the scroll by a frame
            and jitters slightly while scrolling. <Code>addEffect</Code>{" "}
            guarantees that within one loop <Code>lenis.raf()</Code> is called
            first, then <Code>useFrame</Code> and the render, always in the
            order “update the scroll → read → render”.
          </>
        ),
      },
      {
        id: "why-not-add-effect",
        body: (
          <>
            <strong>Why not always use addEffect?</strong> It is only called
            while R3F's loop is running. While the Canvas is still loading
            through <Code>dynamic</Code>, when WebGL fails to initialise, or
            once the Canvas has unmounted, there is no loop. Lenis has taken
            over native scrolling, so with nobody calling{" "}
            <Code>lenis.raf()</Code> the page cannot scroll at all; hence a
            fallback that does not depend on the Canvas.
          </>
        ),
      },
      {
        id: "why-switch-back",
        body: (
          <>
            <strong>Why switch back when the context is lost?</strong> Testing
            shows that R3F's loop does not stop, so staying on{" "}
            <Code>addEffect</Code> would in fact keep scrolling working. But
            that is an implementation detail of the current R3F and three
            releases, not documented, and an upgrade or another browser could
            change it. Switching to a fallback we control removes the reliance
            on someone else's internals; and precisely because the loop does not
            stop, the switch must cancel <Code>addEffect</Code> first, or there
            would be two callers.
          </>
        ),
      },
      {
        id: "conclusion",
        body: (
          <>
            In short: when R3F is available, let it drive, in exchange for a
            fixed order; when it is not, let the fallback drive so the page can
            scroll. They take turns, and only one runs at any moment.
          </>
        ),
      },
    ],
  },
  findings: {
    title: "Findings",
    body: (
      <>
        When the context is lost, R3F's loop <strong>does not stop</strong>, as
        the source code suggested: R3F does not listen for{" "}
        <Code>webglcontextlost</Code>, three only stops{" "}
        <Code>setAnimationLoop</Code> (which R3F does not use), and{" "}
        <Code>gl.render()</Code> checks <Code>_isContextLost</Code> at the very
        start and returns. Without the listeners the canvas goes blank, but the
        R3F count keeps rising and the page scrolls as usual.
      </>
    ),
  },
  limitations: {
    title: "Known limitations",
    paragraphs: [
      {
        id: "stuck-on-fallback",
        body: (
          <>
            <strong>
              After Lenis is recreated, the driver stays on the fallback.
            </strong>{" "}
            <Code>attachLenis()</Code> always starts with the fallback, and{" "}
            <Code>detachLenis()</Code> also cancels <Code>addEffect</Code>. If
            Lenis is recreated after the Canvas is ready (detach → new Lenis →
            attach), <Code>onCreated</Code> does not fire again, nobody calls{" "}
            <Code>driveWithR3f()</Code>, and the “scroll → read → render” order
            is lost with it.
          </>
        ),
      },
      {
        id: "cause",
        body: (
          <>
            The cause is that the driver ties two independent facts together:
            whether Lenis exists (managed by SmoothScroll) and whether R3F is
            usable (managed by Scene). This unit only detaches when the page
            unmounts, so it never hits the problem; unit 16 must recreate Lenis
            when reduced motion is toggled live, and at that point the driver
            should remember separately whether R3F is usable, so that{" "}
            <Code>attachLenis()</Code> can choose which caller to start with.
          </>
        ),
      },
    ],
  },
  concepts: CONCEPTS,
  pitfalls: PITFALLS,
  verifications: VERIFICATIONS,
};

export default CONTENT;
