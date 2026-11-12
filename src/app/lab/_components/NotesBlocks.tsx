import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { UNITS } from "../const";

type NotesHeaderProps = PropsWithChildren<{
  /** Must match an `id` in `UNITS`; the title is read from there. */
  unitId: string;
}>;

/** Back link, unit number and title. `children` is the introduction. */
const NotesHeader = ({ unitId, children }: NotesHeaderProps) => {
  const unit = UNITS.find(({ id }) => id === unitId);

  if (!unit) {
    throw new Error(`Unknown lab unit: ${unitId}`);
  }

  return (
    <>
      <nav aria-label="返回">
        <Link
          href="/lab"
          className="text-sm text-neutral-500 transition-colors hover:text-amber-200"
        >
          ← 回到練習場
        </Link>
      </nav>

      <header className="mt-8">
        <p className="font-mono text-sm text-neutral-500">Unit {unit.id}</p>
        <h1 className="mt-2 text-3xl text-neutral-100">{unit.title}</h1>
        <p className="mt-4 text-neutral-300">{children}</p>
      </header>
    </>
  );
};

/** A titled part of the notes. Renders an `h2`. */
const NotesSection = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => (
  <section className="mt-12">
    <h2 className="mb-4 text-xs tracking-widest text-amber-300/80">{title}</h2>
    {children}
  </section>
);

type Concept = { title: string; body: ReactNode };

const ConceptList = ({ items }: { items: Concept[] }) => (
  <NotesSection title="知識點">
    <dl className="space-y-6">
      {items.map((item) => (
        <div key={item.title}>
          <dt className="text-neutral-100">{item.title}</dt>
          <dd className="mt-1.5 text-neutral-300">{item.body}</dd>
        </div>
      ))}
    </dl>
  </NotesSection>
);

type Pitfall = {
  title: string;
  symptom: ReactNode;
  cause: ReactNode;
  fix: ReactNode;
};

const PITFALL_FIELDS = [
  { key: "symptom", label: "症狀", labelClass: "text-neutral-500" },
  { key: "cause", label: "原因", labelClass: "text-neutral-500" },
  { key: "fix", label: "解法", labelClass: "text-amber-300/80" },
] as const;

const PitfallList = ({ items }: { items: Pitfall[] }) => (
  <NotesSection title="踩過的坑">
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item.title}
          className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-5"
        >
          <h3 className="text-neutral-100">{item.title}</h3>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {PITFALL_FIELDS.map(({ key, label, labelClass }) => (
              <div key={key} className="contents">
                <dt className={labelClass}>{label}</dt>
                <dd className="text-neutral-300">{item[key]}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  </NotesSection>
);

type Verification = { id: string; body: ReactNode };

const VerificationList = ({ items }: { items: Verification[] }) => (
  <NotesSection title="驗證方式">
    <ol className="list-decimal space-y-2 ps-5 text-neutral-300 marker:text-neutral-600">
      {items.map((item) => (
        <li key={item.id}>{item.body}</li>
      ))}
    </ol>
  </NotesSection>
);

export type { Concept, Pitfall, Verification };
export {
  ConceptList,
  NotesHeader,
  NotesSection,
  PitfallList,
  VerificationList,
};
