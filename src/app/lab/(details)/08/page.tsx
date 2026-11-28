import { DemoPane, NotesPane } from "@/app/lab/_components";
import { Demo, Notes } from "./_components";
import { useUnit08Content } from "./_content";

const Lab08Page = () => {
  const { demoCaption, demoLabels } = useUnit08Content();

  return (
    <>
      <DemoPane caption={demoCaption}>
        <Demo labels={demoLabels} />
      </DemoPane>

      <NotesPane>
        <Notes />
      </NotesPane>
    </>
  );
};

export default Lab08Page;
