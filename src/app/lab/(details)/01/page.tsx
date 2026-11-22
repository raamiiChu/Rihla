import { DemoPane, NotesPane } from "@/app/lab/_components";
import { GlyphDiagram, Notes } from "./_components";
import { useUnit01Content } from "./_content";

const Lab01Page = () => {
  const content = useUnit01Content();

  return (
    <>
      <DemoPane caption={content.demoCaption}>
        <GlyphDiagram title={content.diagramTitle} />
      </DemoPane>
      <NotesPane>
        <Notes />
      </NotesPane>
    </>
  );
};

export default Lab01Page;
