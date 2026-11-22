import { DemoPane, NotesPane } from "@/app/lab/_components";
import { DriverReadout, Notes, SceneLoader, SmoothScroll } from "./_components";
import { useUnit03Content } from "./_content";

const Lab03Page = () => {
  const content = useUnit03Content();

  return (
    <>
      <DemoPane caption={content.demoCaption}>
        {/* Positioning context for the readout; DemoPane is only sticky from lg. */}
        <div className="relative h-full">
          <SceneLoader />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
            <DriverReadout labels={content.readout} />
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
