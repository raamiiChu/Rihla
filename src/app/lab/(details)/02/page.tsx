import { DemoPane, NotesPane } from "@/app/lab/_components";
import {
  Notes,
  ProgressReadout,
  // ProgressReadoutWrong,
  SmoothScroll,
  StationReadout,
} from "./_components";
import { useUnit02Content } from "./_content";

const Lab02Page = () => {
  const content = useUnit02Content();

  return (
    <>
      <DemoPane caption={content.demoCaption}>
        <div className="flex h-full flex-col items-center justify-center gap-4 text-4xl tabular-nums">
          <StationReadout />
          <ProgressReadout />
          {/* <ProgressReadoutWrong /> */}
        </div>
      </DemoPane>
      <NotesPane>
        <Notes />
      </NotesPane>

      <SmoothScroll />
    </>
  );
};

export default Lab02Page;
