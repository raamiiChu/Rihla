"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "cn";

/**
 * How many thumbs to draw. A single number is one thumb; only with no value
 * at all does the slider fall back to a range from min to max.
 */
const countThumbs = (
  value: SliderPrimitive.Root.Props["value"],
  defaultValue: SliderPrimitive.Root.Props["defaultValue"],
) => {
  const given = value ?? defaultValue;
  if (given === undefined) {
    return 2;
  }
  return Array.isArray(given) ? given.length : 1;
};

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from(
          { length: countThumbs(value, defaultValue) },
          (_, index) => (
            <SliderPrimitive.Thumb
              data-slot="slider-thumb"
              // Thumbs are positional and never reorder.
              // biome-ignore lint/suspicious/noArrayIndexKey: see above
              key={index}
              className="relative block size-3 shrink-0 rounded-full border border-ring bg-foreground ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
            />
          ),
        )}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
