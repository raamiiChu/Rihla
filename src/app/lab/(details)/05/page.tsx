import { DemoPane, NotesPane } from "@/app/lab/_components";
import { SmoothScroll } from "@/components";
import {
  Notes,
  PacingReadout,
  SceneLoader,
  SkipButton,
  StationNav,
} from "./_components";

const Lab05Page = () => {
  return (
    <>
      <DemoPane caption="捲動時鏡頭沿 3 站的迷你時間軸前進，在停留段減速。">
        <div className="relative h-full">
          <SceneLoader />
          {/* z-20 sits above the 3D labels, which are capped at 10. */}
          <div className="absolute inset-s-4 top-4 z-20 rounded-lg bg-background/70 backdrop-blur-sm">
            <StationNav />
          </div>
          <div className="absolute inset-e-4 top-4 z-20">
            <SkipButton />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4">
            <PacingReadout />
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

export default Lab05Page;
