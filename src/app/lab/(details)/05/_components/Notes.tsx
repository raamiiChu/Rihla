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
import { getQueryTable, getRangeTable, useUnit05Content } from "../_content";
import FlowDiagram from "./FlowDiagram";

const Notes = () => {
  const content = useUnit05Content();
  const ui = useLabUi();
  const { dataFlow, timeline, coordinates, queries } = content;
  const rangeTable = getRangeTable(timeline.columns);
  const queryTable = getQueryTable(queries);

  return (
    <>
      <NotesHeader unitId="05">{content.intro}</NotesHeader>

      <NotesSection title={ui.sections.progress}>
        <StepList items={content.steps} />
      </NotesSection>

      <NotesSection title={dataFlow.title}>
        <p className="mb-4 text-parchment/90">{dataFlow.intro}</p>
        <h3 className="mb-3 text-parchment">{dataFlow.buildTitle}</h3>
        <FlowDiagram flows={dataFlow.build} />
        <h3 className="mt-6 mb-3 text-parchment">{dataFlow.frameTitle}</h3>
        <FlowDiagram flows={dataFlow.frame} />
      </NotesSection>

      <NotesSection title={timeline.title}>
        <p className="mb-4 text-parchment/90">{timeline.intro}</p>
        <DataTable
          caption={timeline.caption}
          columns={rangeTable.columns}
          rows={rangeTable.rows}
        />
      </NotesSection>

      <NotesSection title={coordinates.title}>
        <p className="mb-4 text-parchment/90">{coordinates.intro}</p>
        <DataTable
          caption={coordinates.caption}
          columns={coordinates.columns}
          rows={coordinates.rows}
        />
      </NotesSection>

      <NotesSection title={queries.title}>
        <DataTable
          caption={queries.caption}
          columns={queryTable.columns}
          rows={queryTable.rows}
        />
      </NotesSection>

      <ConceptList items={content.concepts} />
      <PitfallList items={content.pitfalls} />
      <VerificationList items={content.verifications} />
    </>
  );
};

export default Notes;
