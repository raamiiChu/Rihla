import Link from "next/link";
import { LocaleSwitcher } from "@/components";
import { getLabUi, useLabLocale } from "./_i18n";
import { PHASES, type Phase, UNITS, type Unit, type UnitStatus } from "./const";

const STATUS_STYLE: Record<UnitStatus, string> = {
  done: "border-gold/40 text-gold",
  "in-progress": "border-parchment/30 text-parchment",
  todo: "border-parchment/15 text-muted-foreground",
};

const UnitRow = ({ unit }: { unit: Unit }) => {
  // Script units have no demo page, but they still get a notes page.
  const isOpenable = unit.status !== "todo";
  const locale = useLabLocale();
  const ui = getLabUi();

  const content = (
    <>
      <span className="text-sm text-muted-foreground tabular-nums">
        {unit.id}
      </span>
      <span className="min-w-0 flex-1">{unit.title[locale]}</span>
      {unit.kind === "script" && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {ui.index.script}
        </span>
      )}
      <span
        className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLE[unit.status]}`}
      >
        {ui.index.status[unit.status]}
      </span>
    </>
  );

  const rowClass =
    "flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors";

  if (!isOpenable) {
    return (
      <div className={`${rowClass} border-parchment/5 text-parchment/90`}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/lab/${unit.id}`}
      className={`${rowClass} border-parchment/10 text-parchment hover:border-gold/50 hover:bg-parchment/5`}
    >
      {content}
    </Link>
  );
};

const LabPage = () => {
  const phases = Object.keys(PHASES).map(Number) as Phase[];
  const doneCount = UNITS.filter((unit) => unit.status === "done").length;
  const locale = useLabLocale();
  const ui = getLabUi();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-12">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs tracking-[0.3em] text-gold/80 uppercase">
            Rihla · Lab
          </p>
          <LocaleSwitcher />
        </div>
        <h1 className="mt-3 text-3xl text-parchment">{ui.index.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-parchment/90">
          {ui.index.intro}
        </p>
        <p className="mt-6 text-sm text-muted-foreground tabular-nums">
          {ui.index.progress(doneCount, UNITS.length)}
        </p>
        {/* Decorative: the text above already states the progress. */}
        <div className="mt-2 h-px w-full bg-parchment/10" aria-hidden="true">
          <div
            className="h-px bg-gold/70"
            style={{ inlineSize: `${(doneCount / UNITS.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="space-y-10">
        {phases.map((phase) => (
          <section key={phase}>
            <h2 className="mb-3 text-xs tracking-widest text-muted-foreground">
              {ui.index.phase(phase, PHASES[phase][locale])}
            </h2>
            <ul className="space-y-2">
              {UNITS.filter((unit) => unit.phase === phase).map((unit) => (
                <li key={unit.id}>
                  <UnitRow unit={unit} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default LabPage;
