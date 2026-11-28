import {
  ConceptList,
  NotesHeader,
  NotesSection,
  PitfallList,
  StepList,
  VerificationList,
} from "@/app/lab/_components";
import { getLabUi } from "@/app/lab/_i18n";
import { useUnit07Content } from "../_content";
import FlowChart from "./FlowChart";
import { NEAREST_LAYOUT, RESAMPLE_LAYOUT } from "./flowLayouts";

const Notes = () => {
  const content = useUnit07Content();
  const ui = getLabUi();
  const { flowCharts } = content;

  return (
    <>
      <NotesHeader unitId="07">{content.intro}</NotesHeader>

      <NotesSection title={ui.sections.progress}>
        <StepList items={content.steps} />
      </NotesSection>

      <NotesSection title={flowCharts.title}>
        <p className="mb-4 text-parchment/90">{flowCharts.intro}</p>
        <div className="space-y-8">
          <FlowChart
            title={flowCharts.resample.title}
            layout={RESAMPLE_LAYOUT}
            labels={flowCharts.resample.labels}
          />
          <FlowChart
            title={flowCharts.nearest.title}
            layout={NEAREST_LAYOUT}
            labels={flowCharts.nearest.labels}
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
