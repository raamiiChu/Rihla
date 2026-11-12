import { DemoPane, NotesPane } from "@/app/lab/_components";
import { Notes, SceneLoader } from "./_components";

const Lab00Page = () => {
  return (
    <>
      <DemoPane caption="以 R3F 渲染的橘色方塊，示範在客戶端載入 Canvas。">
        <SceneLoader />
      </DemoPane>
      <NotesPane>
        <Notes />
      </NotesPane>
    </>
  );
};

export default Lab00Page;
