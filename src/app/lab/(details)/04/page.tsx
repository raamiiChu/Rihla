import { DemoPane, NotesPane } from "@/app/lab/_components";
import { SmoothScroll } from "@/components";
import { Notes, SceneLoader } from "./_components";

const Lab04Page = () => {
  return (
    <>
      <DemoPane caption="捲動時鏡頭沿含垂直迴圈的 Catmull-Rom 曲線前進，可切換成俯瞰視角。">
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
