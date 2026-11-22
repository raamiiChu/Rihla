import {
  Code,
  type Concept,
  type Pitfall,
  type Verification,
} from "@/app/lab/_components";
import type { Unit00Content } from "./types";

const CONCEPTS: Concept[] = [
  {
    title: "Server Components and Client Components",
    body: (
      <>
        In the App Router, components are Server Components by default and run
        only on the server. <Code>&apos;use client&apos;</Code> means
        &ldquo;this component <strong>also</strong> runs in the browser&rdquo;:
        it is still rendered to HTML on the server first, then hydrated in the
        browser.
      </>
    ),
  },
  {
    title: "Why dynamic with ssr: false",
    body: (
      <>
        WebGL needs the browser&apos;s <Code>window</Code> and{" "}
        <Code>&lt;canvas&gt;</Code>, so rendering the Canvas on the server is
        pointless. <Code>dynamic</Code> also splits the code: three and R3F go
        into a separate chunk, so the text layer and buttons become interactive
        first and the 3D loads after them. The cost is that the Canvas appears a
        little later, and Lenis&apos;s fallback rAF loop has to cover that gap
        (unit 03).
      </>
    ),
  },
  {
    title: "Three layers",
    body: (
      <>
        <Code>page.tsx</Code> (Server) → <Code>SceneLoader</Code> (
        <Code>&apos;use client&apos;</Code>, where <Code>dynamic</Code> is
        called) → <Code>Scene</Code> (which holds the{" "}
        <Code>&lt;Canvas&gt;</Code>). Next.js 16 only allows{" "}
        <Code>ssr: false</Code> in Client Components. <Code>dynamic(...)</Code>{" "}
        belongs at the top level of the module: inside a component it creates a
        new component on every render, and the Canvas is rebuilt again and
        again.
      </>
    ),
  },
  {
    title: "attach: telling R3F where an object goes",
    body: (
      <>
        Every JSX tag in R3F creates a three object, and most of them land in
        the right place on their own: <Code>&lt;mesh&gt;</Code> and the lights
        go into the scene, <Code>&lt;boxGeometry&gt;</Code> becomes the
        box&apos;s shape and <Code>&lt;meshStandardMaterial&gt;</Code> its
        material. A background colour has no default place, so{" "}
        <Code>attach</Code> names one:{" "}
        <Code>&lt;color attach=&quot;background&quot; /&gt;</Code> means
        &ldquo;make this colour the scene&apos;s background&rdquo;.
      </>
    ),
  },
  {
    title: "The layout guards the whole folder",
    body: (
      <>
        <Code>lab/layout.tsx</Code> wraps every route beneath it, so one check
        protects all of <Code>/lab</Code>. <Code>notFound()</Code> throws, and
        its type is <Code>never</Code>: the function stops there, with no need
        for a <Code>return</Code>.
      </>
    ),
  },
  {
    title: "VERCEL_ENV, not NODE_ENV",
    body: (
      <>
        On Vercel preview deployments <Code>NODE_ENV</Code> is also{" "}
        <Code>production</Code>, so checking it would block previews too. Only{" "}
        <Code>VERCEL_ENV</Code> tells <Code>production</Code> and{" "}
        <Code>preview</Code> apart. It has no <Code>NEXT_PUBLIC_</Code> prefix,
        so only the server can read it and it never ends up in the browser
        bundle.
      </>
    ),
  },
  {
    title: "Private folders and route groups",
    body: (
      <>
        A folder whose name starts with an underscore (such as{" "}
        <Code>_components</Code>) is not treated as a route, which makes it a
        good home for components used only by this page. A folder in brackets
        (such as <Code>(details)</Code>) is a route group: its routes can share
        a layout without the folder appearing in the URL.
      </>
    ),
  },
];

const PITFALLS: Pitfall[] = [
  {
    title: "The Canvas is blank, with no error at all",
    symptom: "Nothing shows on the page, and the console has no errors.",
    cause:
      "The Canvas fills its parent; when the parent has no height, the Canvas is 0 tall.",
    fix: (
      <>
        Give the parent an explicit height, such as <Code>h-dvh</Code>. On
        phones <Code>dvh</Code> leaves out the address bar, so it is more
        accurate than <Code>h-screen</Code>.
      </>
    ),
  },
  {
    title: "rotation set to 45, yet it doesn't turn 45 degrees",
    symptom: (
      <>
        <Code>rotation=&#123;[0, 45, 0]&#125;</Code> visibly turns by some
        angle, so the mistake is easy to miss.
      </>
    ),
    cause:
      "three measures angles in radians. 45 radians is just over 7 full turns, which ends up at about 58 degrees.",
    fix: (
      <>
        Use <Code>MathUtils.degToRad(45)</Code> or <Code>Math.PI / 4</Code>.
      </>
    ),
  },
  {
    title: "Lint reports a formatting error, but nothing looks different",
    symptom: "Formatter would have printed the following content",
    cause: (
      <>
        On Windows, VSCode creates new files with CRLF line endings while Biome
        expects LF; a global <Code>core.autocrlf=true</Code> also converts files
        to CRLF on checkout.
      </>
    ),
    fix: (
      <>
        Add <Code>* text=auto eol=lf</Code> to <Code>.gitattributes</Code>, and
        set VSCode&apos;s <Code>files.eol</Code> to <Code>\n</Code>.
      </>
    ),
  },
  {
    title: "Vitest can't resolve the @/ path alias",
    symptom: (
      <>
        <Code>@/lib/...</Code> fails to resolve.
      </>
    ),
    cause: (
      <>
        Next.js reads <Code>paths</Code> from tsconfig, but Vite, which Vitest
        runs on, does not by default.
      </>
    ),
    fix: (
      <>
        Set <Code>resolve.tsconfigPaths: true</Code> in{" "}
        <Code>vitest.config.ts</Code> (built into Vite 8).
      </>
    ),
  },
];

const VERIFICATIONS: Verification[] = [
  {
    id: "no-ssr",
    body: (
      <>
        Right-click → View page source and search for <Code>canvas</Code>: it
        isn&apos;t there, only &ldquo;Loading…&rdquo;, which shows that{" "}
        <Code>ssr: false</Code> works.
      </>
    ),
  },
  {
    id: "production-404",
    body: (
      <>
        Start the server with{" "}
        <Code>$env:VERCEL_ENV = &apos;production&apos;; pnpm dev</Code>:{" "}
        <Code>/lab</Code> returns 404.
      </>
    ),
  },
  {
    id: "code-splitting",
    body: (
      <>
        Throttle the network in the DevTools Network panel:
        &ldquo;Loading…&rdquo; appears first, and the Canvas replaces it only
        once the three chunk has downloaded.
      </>
    ),
  },
];

const CONTENT: Unit00Content = {
  intro: (
    <>
      Setting up the <Code>/lab</Code> route, blocked only on the production
      URL, and loading R3F&apos;s <Code>&lt;Canvas&gt;</Code> on the client with{" "}
      <Code>dynamic</Code>. The box alongside is this page&apos;s Canvas.
    </>
  ),
  demoCaption:
    "An orange box rendered with R3F, showing the Canvas loaded on the client.",
  concepts: CONCEPTS,
  pitfalls: PITFALLS,
  verifications: VERIFICATIONS,
};

export default CONTENT;
