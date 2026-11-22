import {
  ConceptList,
  NotesHeader,
  NotesSection,
  PitfallList,
  StepList,
  VerificationList,
} from "@/app/lab/_components";
import { useLabUi } from "@/app/lab/_i18n";
import { useUnit03Content } from "../_content";
import DriverTimeline from "./DriverTimeline";

const Notes = () => {
  const content = useUnit03Content();
  const ui = useLabUi();
  const { handoff, findings, limitations } = content;

  return (
    <>
      <NotesHeader unitId="03">{content.intro}</NotesHeader>

      <NotesSection title={ui.sections.progress}>
        <StepList items={content.steps} />
      </NotesSection>

      <NotesSection title={handoff.title}>
        <DriverTimeline labels={handoff.timeline} />
        <div className="mt-6 space-y-3 text-parchment/90">
          {handoff.paragraphs.map((paragraph) => (
            <p key={paragraph.id}>{paragraph.body}</p>
          ))}
        </div>
      </NotesSection>

      <NotesSection title={findings.title}>
        <p className="text-parchment/90">{findings.body}</p>
      </NotesSection>

      <NotesSection title={limitations.title}>
        <div className="space-y-3 text-parchment/90">
          {limitations.paragraphs.map((paragraph) => (
            <p key={paragraph.id}>{paragraph.body}</p>
          ))}
        </div>
      </NotesSection>

      <ConceptList items={content.concepts} />
      <PitfallList items={content.pitfalls} />
      <VerificationList items={content.verifications} />
    </>
  );
};

export default Notes;
