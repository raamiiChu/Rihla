import { DemoPane, NotesPane } from "@/app/lab/_components";
import { SmoothScroll } from "@/components";
import { Notes, SceneLoader } from "./_components";
import { useUnit04Content } from "./_content";

const Lab04Page = () => {
  const content = useUnit04Content();

  return (
    <>
      <DemoPane caption={content.demoCaption}>
        <SceneLoader />
      </DemoPane>
      <NotesPane>
        <Notes />
      </NotesPane>

      <SmoothScroll />
    </>
  );
};

export default Lab04Page;
