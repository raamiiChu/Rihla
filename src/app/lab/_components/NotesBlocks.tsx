import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { LocaleSwitcher } from "@/components";
import { getLabUi, useLabLocale } from "../_i18n";
import { UNITS } from "../const";

type NotesHeaderProps = PropsWithChildren<{
  /** Must match an `id` in `UNITS`; the title is read from there. */
  unitId: string;
}>;

/** Back link, unit number and title. `children` is the introduction. */
const NotesHeader = ({ unitId, children }: NotesHeaderProps) => {
  const unit = UNITS.find(({ id }) => id === unitId);
  const locale = useLabLocale();
  const ui = getLabUi();

  if (!unit) {
    throw new Error(`Unknown lab unit: ${unitId}`);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <nav aria-label={ui.backLabel}>
          <Link
            href="/lab"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            {/* Decorative: the link text already says where it goes.
                Mirrored in RTL so it still points backwards. */}
            <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
              ←
            </span>
            {ui.backLink}
          </Link>
        </nav>
        <LocaleSwitcher />
      </div>

      <header className="mt-8">
        <p className="text-sm text-muted-foreground">Unit {unit.id}</p>
        <h1 className="mt-2 text-3xl text-parchment">{unit.title[locale]}</h1>
        <p className="mt-4 text-parchment/90">{children}</p>
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
    <h2 className="mb-4 text-xs tracking-widest text-gold/80">{title}</h2>
    {children}
  </section>
);

type Concept = { title: string; body: ReactNode };

const ConceptList = ({
  items,
  title,
}: {
  items: Concept[];
  title?: string;
}) => {
  const ui = getLabUi();

  return (
    <NotesSection title={title ?? ui.sections.concepts}>
      <dl className="space-y-6">
        {items.map((item) => (
          <div key={item.title}>
            <dt className="font-semibold text-parchment">{item.title}</dt>
            <dd className="mt-1.5 text-parchment/90">{item.body}</dd>
          </div>
        ))}
      </dl>
    </NotesSection>
  );
};

type Pitfall = {
  title: string;
  symptom: ReactNode;
  cause: ReactNode;
  fix: ReactNode;
};

const PITFALL_FIELDS = [
  { key: "symptom", labelClass: "text-muted-foreground" },
  { key: "cause", labelClass: "text-muted-foreground" },
  { key: "fix", labelClass: "text-gold/80" },
] as const;

const PitfallList = ({ items }: { items: Pitfall[] }) => {
  const ui = getLabUi();

  return (
    <NotesSection title={ui.sections.pitfalls}>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.title}
            className="rounded-lg border border-parchment/10 bg-parchment/3 p-5"
          >
            <h3 className="font-semibold text-parchment">{item.title}</h3>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {PITFALL_FIELDS.map(({ key, labelClass }) => (
                <div key={key} className="contents">
                  <dt className={labelClass}>{ui.pitfall[key]}</dt>
                  <dd className="text-parchment/90">{item[key]}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </NotesSection>
  );
};

type Verification = { id: string; body: ReactNode };

const VerificationList = ({ items }: { items: Verification[] }) => {
  const ui = getLabUi();

  return (
    <NotesSection title={ui.sections.verification}>
      <ol className="list-decimal space-y-2 ps-5 text-parchment/90 marker:text-muted-foreground/70">
        {items.map((item) => (
          <li key={item.id}>{item.body}</li>
        ))}
      </ol>
    </NotesSection>
  );
};

export type { Concept, Pitfall, Verification };
export {
  ConceptList,
  NotesHeader,
  NotesSection,
  PitfallList,
  VerificationList,
};
