import { MotionConfig } from "motion/react";
import { DemoPane, NotesPane } from "@/app/lab/_components";
import { SmoothScroll } from "@/components";
import {
  JumpMask,
  Notes,
  PacingReadout,
  SceneLoader,
  SkipButton,
  StationLinesSwitch,
  StationNav,
} from "./_components";
import { useUnit06Content } from "./_content";
import { JumpMaskProvider } from "./_contexts/JumpMaskProvider";

const Lab06Page = () => {
  const { demoCaption, demo } = useUnit06Content();

  return (
    <>
      <MotionConfig reducedMotion="user">
        <DemoPane caption={demoCaption}>
          <div className="relative h-full">
            <JumpMaskProvider>
              <SceneLoader />
              {/* z-20 sits above the 3D labels, which are capped at 10. */}
              <div className="absolute inset-s-4 top-4 z-20 rounded-lg bg-background/70 backdrop-blur-sm">
                <StationNav label={demo.navLabel} />
              </div>
              <div className="absolute inset-e-4 top-4 z-20">
                <SkipButton />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4">
                <PacingReadout labels={demo.readout} />
              </div>
              <StationLinesSwitch labels={demo.linesSwitch} />

              <JumpMask />
            </JumpMaskProvider>
          </div>
        </DemoPane>
      </MotionConfig>

      <NotesPane>
        <Notes />
      </NotesPane>

      <SmoothScroll />
    </>
  );
};

export default Lab06Page;
