import { DemoPane, NotesPane } from "@/app/lab/_components";
import { Notes, SceneLoader } from "./_components";
import { useUnit00Content } from "./_content";

const Lab00Page = () => {
  const content = useUnit00Content();

  return (
    <>
      <DemoPane caption={content.demoCaption}>
        <SceneLoader />
      </DemoPane>
      <NotesPane>
        <Notes />
      </NotesPane>
    </>
  );
};

export default Lab00Page;
