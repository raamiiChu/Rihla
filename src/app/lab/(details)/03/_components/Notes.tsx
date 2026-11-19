import {
  Code,
  ConceptList,
  NotesHeader,
  NotesSection,
  PitfallList,
  StepList,
  VerificationList,
} from "@/app/lab/_components";
import { CONCEPTS, PITFALLS, STEPS, VERIFICATIONS } from "../_content/notes";
import DriverTimeline from "./DriverTimeline";

const Notes = () => (
  <>
    <NotesHeader unitId="03">
      讓 Lenis 和 R3F 依固定順序執行：Canvas 就緒前由 fallback
      迴圈驅動，就緒後交給 <Code>addEffect</Code>，context
      遺失時再切回來。任何時刻只有一個來源呼叫 <Code>lenis.raf()</Code>。
    </NotesHeader>

    <NotesSection title="進度">
      <StepList items={STEPS} />
    </NotesSection>

    <NotesSection title="驅動來源的切換">
      <DriverTimeline />
      <div className="mt-6 space-y-3 text-parchment/90">
        <p>
          <strong>為什麼不一直用 fallback？</strong>fallback 迴圈與 R3F
          的迴圈是兩個獨立的 rAF
          callback，同一幀裡誰先執行取決於註冊順序，沒有保證。若 R3F 先跑，
          <Code>useFrame</Code> 讀到的是上一幀的
          progress，畫面會落後捲動一幀，捲動時產生細微的抖動。
          <Code>addEffect</Code> 保證在同一次 loop 裡先呼叫{" "}
          <Code>lenis.raf()</Code>，再執行 <Code>useFrame</Code>{" "}
          與渲染，順序固定是「更新捲動 → 讀取 → 渲染」。
        </p>
        <p>
          <strong>為什麼不一直用 addEffect？</strong>它只在 R3F
          的迴圈運作時被呼叫。Canvas 還在 <Code>dynamic</Code> 載入、WebGL
          初始化失敗、Canvas 被卸載時，迴圈都不存在。Lenis
          攔截了原生捲動，沒有人呼叫 <Code>lenis.raf()</Code>{" "}
          頁面就完全捲不動，所以需要一個不依賴 Canvas 的 fallback。
        </p>
        <p>
          <strong>Context 遺失時為什麼要切回去？</strong>實測 R3F
          的迴圈不會停，繼續交給 <Code>addEffect</Code> 其實也能捲動。但這只是
          R3F 與 three
          目前版本的實作細節，文件沒有保證，升級或換瀏覽器都可能改變。切到自己控制的
          fallback，就不依賴別人的實作細節；反過來說，也正因為迴圈不會停，切換時一定要先取消{" "}
          <Code>addEffect</Code>，否則會變成兩個來源。
        </p>
        <p>
          結論：R3F 可用時交給它，換取固定的執行順序；不可用時交給
          fallback，確保頁面能捲動。兩者輪流，任何時刻只有一個。
        </p>
      </div>
    </NotesSection>

    <NotesSection title="實測結果">
      <p className="text-parchment/90">
        Context 遺失時，R3F 的迴圈<strong>不會停</strong>
        ，與原始碼推測一致：R3F 沒有監聽 <Code>webglcontextlost</Code>，three
        只停止 <Code>setAnimationLoop</Code>（R3F 沒有使用），
        <Code>gl.render()</Code> 一開頭檢查 <Code>_isContextLost</Code> 後直接
        return。不掛 listener 時，canvas 變成空白，但 R3F
        的次數持續增加、頁面照常捲動。
      </p>
    </NotesSection>

    <NotesSection title="已知限制">
      <div className="space-y-3 text-parchment/90">
        <p>
          <strong>重建 Lenis 後會一直停在 fallback。</strong>
          <Code>attachLenis()</Code> 一律從 fallback 開始，而{" "}
          <Code>detachLenis()</Code> 會一併取消 <Code>addEffect</Code>
          。若在 Canvas 就緒後重建 Lenis（detach → new Lenis → attach），
          <Code>onCreated</Code> 不會再觸發，沒有人呼叫{" "}
          <Code>driveWithR3f()</Code>，「捲動 → 讀取 →
          渲染」的順序保證也跟著消失。
        </p>
        <p>
          原因是 driver 把兩件獨立的事綁在一起：Lenis 在不在（SmoothScroll
          管理）與 R3F 能不能用（Scene 管理）。這個單元只在頁面卸載時
          detach，不會遇到；單元 16 即時切換減少動態效果時需要重建 Lenis，屆時讓
          driver 另外記住 R3F 是否可用，<Code>attachLenis()</Code>{" "}
          再依此決定從哪個來源開始。
        </p>
      </div>
    </NotesSection>

    <ConceptList items={CONCEPTS} />
    <PitfallList items={PITFALLS} />
    <VerificationList items={VERIFICATIONS} />
  </>
);

export default Notes;
