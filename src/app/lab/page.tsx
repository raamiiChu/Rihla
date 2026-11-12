import Link from "next/link";
import { PHASES, type Phase, UNITS, type Unit, type UnitStatus } from "./const";

const STATUS_LABEL: Record<UnitStatus, string> = {
  done: "完成",
  "in-progress": "進行中",
  todo: "未開始",
};

const STATUS_STYLE: Record<UnitStatus, string> = {
  done: "border-amber-300/40 text-amber-200",
  "in-progress": "border-sky-300/40 text-sky-200",
  todo: "border-neutral-700 text-neutral-500",
};

const UnitRow = ({ unit }: { unit: Unit }) => {
  const isOpenable = unit.kind === "page" && unit.status !== "todo";

  const content = (
    <>
      <span className="font-mono text-sm text-neutral-500 tabular-nums">
        {unit.id}
      </span>
      <span className="min-w-0 flex-1 truncate">{unit.title}</span>
      {unit.kind === "script" && (
        <span className="text-xs text-neutral-500">腳本</span>
      )}
      <span
        className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLE[unit.status]}`}
      >
        {STATUS_LABEL[unit.status]}
      </span>
    </>
  );

  const rowClass =
    "flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors";

  if (!isOpenable) {
    return (
      <div className={`${rowClass} border-neutral-900 text-neutral-300`}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/lab/${unit.id}`}
      className={`${rowClass} border-neutral-800 text-neutral-100 hover:border-amber-300/50 hover:bg-neutral-900`}
    >
      {content}
    </Link>
  );
};

const LabPage = () => {
  const phases = Object.keys(PHASES).map(Number) as Phase[];
  const doneCount = UNITS.filter((unit) => unit.status === "done").length;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-12">
        <p className="text-xs tracking-[0.3em] text-amber-300/80 uppercase">
          Rihla · Lab
        </p>
        <h1 className="mt-3 text-3xl text-neutral-100">練習場</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">
          每個單元先在這裡用最小範例練熟，再搬進正式專案。
        </p>
        <p className="mt-6 text-sm text-neutral-500 tabular-nums">
          已完成 {doneCount} / {UNITS.length}
        </p>
        {/* Decorative: the text above already states the progress. */}
        <div className="mt-2 h-px w-full bg-neutral-800" aria-hidden="true">
          <div
            className="h-px bg-amber-300/70"
            style={{ inlineSize: `${(doneCount / UNITS.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="space-y-10">
        {phases.map((phase) => (
          <section key={phase}>
            <h2 className="mb-3 text-xs tracking-widest text-neutral-500">
              第 {phase} 階段：{PHASES[phase]}
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
