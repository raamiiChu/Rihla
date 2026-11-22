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
import { getGlyphTable, getMetricTable, useUnit01Content } from "../_content";

const Notes = () => {
  const content = useUnit01Content();
  const ui = useLabUi();
  const { measurements } = content;
  const metricTable = getMetricTable(measurements);
  const glyphTable = getGlyphTable(measurements);

  return (
    <>
      <NotesHeader unitId="01">{content.intro}</NotesHeader>

      <NotesSection title={ui.sections.progress}>
        <StepList items={content.steps} />
      </NotesSection>

      <NotesSection title={content.conclusions.title}>
        <ul className="list-disc space-y-2 ps-5 text-parchment/90 marker:text-muted-foreground/70">
          {content.conclusions.items.map((item) => (
            <li key={item.id}>{item.body}</li>
          ))}
        </ul>
      </NotesSection>

      <NotesSection title={measurements.title}>
        <div className="space-y-6">
          <DataTable
            caption={measurements.metricCaption}
            columns={metricTable.columns}
            rows={metricTable.rows}
          />
          <DataTable
            caption={measurements.glyphCaption}
            columns={glyphTable.columns}
            rows={glyphTable.rows}
          />
        </div>
      </NotesSection>

      <ConceptList items={content.concepts} />
      <PitfallList items={content.pitfalls} />
      <VerificationList items={content.verifications} />
    </>
  );
};

export default Notes;
