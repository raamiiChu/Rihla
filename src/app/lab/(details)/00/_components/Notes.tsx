import {
  Code,
  ConceptList,
  NotesHeader,
  PitfallList,
  VerificationList,
} from "@/app/lab/_components";
import { CONCEPTS, PITFALLS, VERIFICATIONS } from "../_content/notes";

const Notes = () => {
  return (
    <>
      <NotesHeader unitId="00">
        建立 <Code>/lab</Code> 路由，只在正式網址封鎖；並用 <Code>dynamic</Code>{" "}
        在客戶端載入 R3F 的 <Code>&lt;Canvas&gt;</Code>
        。旁邊的方塊就是這個頁面的 Canvas。
      </NotesHeader>
      <ConceptList items={CONCEPTS} />
      <PitfallList items={PITFALLS} />
      <VerificationList items={VERIFICATIONS} />
    </>
  );
};

export default Notes;
