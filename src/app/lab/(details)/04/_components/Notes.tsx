import {
  ConceptList,
  DataTable,
  NotesHeader,
  NotesSection,
  PitfallList,
  StepList,
  VerificationList,
} from "@/app/lab/_components";
import { useLabUi } from "@/app/lab/_i18n";
import {
  getGateTable,
  getLayoutTable,
  getLevellingTable,
  getLineTable,
  getRotationTable,
  getSegmentTable,
  useUnit04Content,
} from "../_content";

const Notes = () => {
  const content = useUnit04Content();
  const ui = useLabUi();
  const { sections, tables } = content;
  const segmentTable = getSegmentTable(tables);
  const lineTable = getLineTable(tables);
  const layoutTable = getLayoutTable(tables);
  const rotationTable = getRotationTable(tables);
  const gateTable = getGateTable(tables);
  const levellingTable = getLevellingTable(tables);

  return (
    <>
      <NotesHeader unitId="04">{content.intro}</NotesHeader>

      <NotesSection title={ui.sections.progress}>
        <StepList items={content.steps} />
      </NotesSection>

      <NotesSection title={sections.controlPoints.title}>
        <div className="mb-4 space-y-3 text-parchment/90">
          {sections.controlPoints.before.map((paragraph) => (
            <p key={paragraph.id}>{paragraph.body}</p>
          ))}
        </div>
        <DataTable {...segmentTable} />
        <p className="mt-4 text-parchment/90">{sections.controlPoints.after}</p>
      </NotesSection>

      <NotesSection title={sections.lines.title}>
        <DataTable {...lineTable} />
      </NotesSection>

      <NotesSection title={sections.layout.title}>
        <p className="mb-4 text-parchment/90">{sections.layout.intro}</p>
        <DataTable {...layoutTable} />
      </NotesSection>

      <NotesSection title={sections.sampling.title}>
        <div className="space-y-3 text-parchment/90">
          {sections.sampling.paragraphs.map((paragraph) => (
            <p key={paragraph.id}>{paragraph.body}</p>
          ))}
        </div>
      </NotesSection>

      <NotesSection title={sections.rotation.title}>
        <div className="mb-4 space-y-3 text-parchment/90">
          {sections.rotation.paragraphs.map((paragraph) => (
            <p key={paragraph.id}>{paragraph.body}</p>
          ))}
        </div>
        <DataTable {...rotationTable} />
      </NotesSection>

      <ConceptList title={content.math.title} items={content.math.items} />
      <ConceptList items={content.concepts} />

      <NotesSection title={sections.levelling.title}>
        <p className="mb-4 text-parchment/90">{sections.levelling.intro}</p>
        <DataTable {...gateTable} />
        <p className="my-4 text-parchment/90">{sections.levelling.between}</p>
        <DataTable {...levellingTable} />
      </NotesSection>

      <ConceptList
        title={content.levelling.title}
        items={content.levelling.items}
      />

      <PitfallList items={content.pitfalls} />
      <VerificationList items={content.verifications} />
    </>
  );
};

export default Notes;
