import {
  ConceptList,
  NotesHeader,
  PitfallList,
  VerificationList,
} from "@/app/lab/_components";
import { useUnit00Content } from "../_content";

const Notes = () => {
  const content = useUnit00Content();

  return (
    <>
      <NotesHeader unitId="00">{content.intro}</NotesHeader>
      <ConceptList items={content.concepts} />
      <PitfallList items={content.pitfalls} />
      <VerificationList items={content.verifications} />
    </>
  );
};

export default Notes;
