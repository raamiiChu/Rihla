import { Ar, DemoPane, NotesPane } from "@/app/lab/_components";
import { GlyphDiagram, Notes } from "./_components";

const Lab01Page = () => {
  return (
    <>
      <DemoPane
        caption={
          <>
            以 Amiri 排出的 <Ar>دهلي</Ar>，標出字型度量值與每個字形的 xAdvance。
          </>
        }
      >
        <GlyphDiagram />
      </DemoPane>
      <NotesPane>
        <Notes />
      </NotesPane>
    </>
  );
};

export default Lab01Page;
