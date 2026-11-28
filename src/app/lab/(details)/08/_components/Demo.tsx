"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import SceneLoader from "./SceneLoader";

/**
 * How far round the loop the circle's start is moved, as a fraction of it.
 * Fractions rather than indices, so the buttons do not depend on the count.
 */
const START_OFFSETS = [
  { fraction: 0, label: "0" },
  { fraction: 1 / 8, label: "⅛" },
  { fraction: 1 / 4, label: "¼" },
] as const;

type DemoLabels = {
  startOffset: string;
  reversed: string;
  aligned: string;
  morph: string;
};

type DemoProps = {
  labels: DemoLabels;
};

/** Three decimals, matching the slider's step. */
const formatProgress = (progress: number) => progress.toFixed(3);

/**
 * Holds the settings and the buttons. The labels come in as props, so the
 * scene below never depends on the locale.
 */
const Demo = ({ labels }: DemoProps) => {
  const [startOffset, setStartOffset] = useState(0);
  const [reversed, setReversed] = useState(false);
  const [aligned, setAligned] = useState(false);

  // The morph's progress, 0 (circle) to 1 (star). A ref, not state: it
  // changes many times a second while dragging, and only the scene's
  // useFrame needs it.
  const morphProgressRef = useRef(0);
  // The readout is written straight into the DOM, for the same reason.
  const readoutRef = useRef<HTMLOutputElement>(null);

  return (
    <div className="relative h-full">
      <div className="absolute inset-x-4 top-4 z-10 flex flex-wrap items-center gap-4">
        <fieldset className="flex items-center gap-1">
          <legend className="sr-only">{labels.startOffset}</legend>
          <span aria-hidden className="me-1 text-sm text-muted-foreground">
            {labels.startOffset}
          </span>
          {START_OFFSETS.map(({ fraction, label }) => (
            <Button
              key={label}
              variant={startOffset === fraction ? "default" : "outline"}
              aria-pressed={startOffset === fraction}
              onClick={() => setStartOffset(fraction)}
            >
              {label}
            </Button>
          ))}
        </fieldset>

        <Toggle
          variant="outline"
          onPressedChange={() => setReversed((prev) => !prev)}
        >
          {labels.reversed}
        </Toggle>

        <Toggle
          variant="outline"
          onPressedChange={() => setAligned((prev) => !prev)}
        >
          {labels.aligned}
        </Toggle>
      </div>

      <SceneLoader
        startOffset={startOffset}
        reversed={reversed}
        aligned={aligned}
        morphProgressRef={morphProgressRef}
      />

      <div className="absolute inset-x-8 bottom-8 z-10">
        <Slider
          aria-label={labels.morph}
          min={0}
          max={1}
          step={0.001}
          defaultValue={0}
          // Writes refs only: dragging re-renders nothing. The scene reads
          // the value in useFrame, and the readout's text is set directly.
          onValueChange={(value) => {
            const progress = Array.isArray(value) ? value[0] : value;
            morphProgressRef.current = progress;
            if (readoutRef.current) {
              readoutRef.current.textContent = formatProgress(progress);
            }
          }}
        />

        <output
          ref={readoutRef}
          aria-hidden
          className="text-muted-foreground tabular-nums"
        >
          {formatProgress(0)}
        </output>
      </div>
    </div>
  );
};

export type { DemoLabels };
export default Demo;
