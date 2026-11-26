import { DemoPane, NotesPane } from "@/app/lab/_components";
import { Demo, Notes } from "./_components";
import { useUnit07Content } from "./_content";

const Lab07Page = () => {
  const { demoCaption, demoLabels } = useUnit07Content();

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

export default Lab07Page;
