import { DemoPane, NotesPane } from "@/app/lab/_components";
import { DriverReadout, Notes, SceneLoader, SmoothScroll } from "./_components";

const Lab03Page = () => {
  return (
    <>
      <DemoPane caption="隨捲動移動的方塊，以及目前驅動 Lenis 的來源與呼叫次數。">
        {/* Positioning context for the readout; DemoPane is only sticky from lg. */}
        <div className="relative h-full">
          <SceneLoader />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
            <DriverReadout />
          </div>
        </div>
      </DemoPane>
      <NotesPane>
        <Notes />
      </NotesPane>

      <SmoothScroll />
    </>
  );
};

export default Lab03Page;
