import {
  ConceptList,
  NotesHeader,
  NotesSection,
  PitfallList,
  StepList,
  VerificationList,
} from "@/app/lab/_components";
import { useLabUi } from "@/app/lab/_i18n";
import { useUnit08Content } from "../_content";

const Notes = () => {
  const content = useUnit08Content();
  const ui = useLabUi();

  return (
    <>
      <NotesHeader unitId="08">{content.intro}</NotesHeader>

      <NotesSection title={ui.sections.progress}>
        <StepList items={content.steps} />
      </NotesSection>

      <ConceptList items={content.concepts} />
      <PitfallList items={content.pitfalls} />
      <VerificationList items={content.verifications} />
    </>
  );
};

export default Notes;
