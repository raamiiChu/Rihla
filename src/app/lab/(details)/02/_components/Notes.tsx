import {
  ConceptList,
  DataTable,
  NotesHeader,
  NotesSection,
  PitfallList,
  StepList,
  VerificationList,
} from "@/app/lab/_components";
import { getLabUi } from "@/app/lab/_i18n";
import { getReadTable, getRenderTable, useUnit02Content } from "../_content";

const Notes = () => {
  const content = useUnit02Content();
  const ui = getLabUi();
  const readTable = getReadTable(content.readTable);
  const renderTable = getRenderTable(content.renderTable);

  return (
    <>
      <NotesHeader unitId="02">{content.intro}</NotesHeader>

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

      <NotesSection title={content.readTable.title}>
        <DataTable
          caption={content.readTable.caption}
          columns={readTable.columns}
          rows={readTable.rows}
        />
      </NotesSection>

      <NotesSection title={content.renderTable.title}>
        <DataTable
          caption={content.renderTable.caption}
          columns={renderTable.columns}
          rows={renderTable.rows}
        />
      </NotesSection>

      <ConceptList items={content.concepts} />
      <PitfallList items={content.pitfalls} />
      <VerificationList items={content.verifications} />
    </>
  );
};

export default Notes;
