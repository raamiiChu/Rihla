import { NEAREST_COLOR, SAMPLE_COLOR, VERTEX_COLOR } from "../_data/colors";

type LegendLabels = {
  vertex: string;
  sample: string;
  nearest: string;
};

type LegendProps = {
  labels: LegendLabels;
};

const Legend = ({ labels }: LegendProps) => {
  const items = [
    { color: VERTEX_COLOR, label: labels.vertex },
    { color: SAMPLE_COLOR, label: labels.sample },
    { color: NEAREST_COLOR, label: labels.nearest },
  ];

  return (
    <ul className="pointer-events-none absolute inset-e-4 bottom-4 z-10 flex flex-col gap-1 rounded-md bg-background/70 px-3 py-2 text-muted-foreground">
      {items.map(({ color, label }) => (
        <li key={label} className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2 shrink-0"
            style={{ backgroundColor: color }}
          />
          {label}
        </li>
      ))}
    </ul>
  );
};

export type { LegendLabels };
export default Legend;
