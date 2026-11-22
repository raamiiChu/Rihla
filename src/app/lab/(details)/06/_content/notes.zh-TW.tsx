import { Code } from "@/app/lab/_components";
import type { Unit06Content } from "./types";

const content: Unit06Content = {
  intro: (
    <>
      到站時，該站的句子逐行淡入，離開時淡出；切換語言或長距離跳轉時，文字與畫面先淡出再淡入。全部用
      Motion 完成，3D 場景沿用單元 05。
    </>
  ),
  demoCaption: "捲動時鏡頭沿 3 站的迷你時間軸前進，到站時該站的句子逐行淡入。",
  demo: {
    navLabel: "站點",
    linesSwitch: { label: "句子層版本", fixed: "正確版", broken: "錯誤版" },
    readout: {
      station: "當前站點",
      phase: "階段",
      progress: "progress",
      rail: "軌道位置 u",
      skip: "SKIP 目的地",
      flight: "飛行",
      dwell: "停留",
    },
  },
  steps: [
    {
      id: "line-stagger",
      title: "換站時，該站的句子逐行淡入",
      done: true,
    },
    {
      id: "dwell-only",
      title: (
        <>
          句子只在停留段顯示：到站淡入、離開淡出，判斷抽成時間軸的{" "}
          <Code>getDwellingStationIndex</Code>
        </>
      ),
      done: true,
    },
    {
      id: "pointer-events",
      title: (
        <>
          疊在 Canvas 上、不需要點擊的文字層與讀數設為{" "}
          <Code>pointer-events-none</Code>
        </>
      ),
      done: true,
    },
    {
      id: "reduced-motion",
      title: (
        <>
          以 <Code>MotionConfig reducedMotion=&quot;user&quot;</Code>{" "}
          遵循系統的減少動態效果設定
        </>
      ),
      done: true,
    },
    {
      id: "exit-jump",
      title: "切換語言時重現退場跳字，再改成在父層取字串修正",
      done: true,
    },
    {
      id: "mask",
      title: (
        <>
          長距離跳轉：遮罩淡入 → <Code>immediate: true</Code> 跳轉 → 遮罩淡出
        </>
      ),
      done: true,
    },
    {
      id: "mask-exit",
      title: (
        <>
          遮罩跳轉時，舊句子在遮罩後立即退場（<Code>AnimatePresence</Code> 的{" "}
          <Code>custom</Code>）
        </>
      ),
      done: true,
    },
    {
      id: "synced",
      title: (
        <>
          在中間重新整理時不閃出第一站的句子：store 加上 <Code>isSynced</Code>
        </>
      ),
      done: true,
    },
  ],
  concepts: [
    {
      title: "variants 會沿著元件樹往下傳",
      body: (
        <>
          variants 是替動畫狀態取名字，例如 <Code>hidden</Code>、
          <Code>visible</Code>。父元素寫了{" "}
          <Code>animate=&quot;visible&quot;</Code>
          ，子元素只要有同名的 variants 就會跟著切換，不用自己寫{" "}
          <Code>initial</Code>、<Code>animate</Code>
          。父元素的 transition 也因此能控制子元素的節奏。
        </>
      ),
    },
    {
      title: "逐行進場：delayChildren 搭配 stagger",
      body: (
        <>
          在父元素的 transition 寫 <Code>delayChildren: stagger(0.08)</Code>
          ，第 n 個子元素會延遲 n × 0.08 秒。<Code>stagger</Code> 還能用{" "}
          <Code>from</Code> 決定從哪個子元素開始。
        </>
      ),
    },
    {
      title: "用 key 重新播放進場動畫",
      body: (
        <>
          <Code>initial → animate</Code> 只在元件掛載時播放一次。換站時改變{" "}
          <Code>key</Code>，React
          會把它當成新元件重新掛載，進場動畫就會再播一次。
        </>
      ),
    },
    {
      title: "到站才出現：stationIndex 在出發時就已切換",
      body: (
        <>
          <Code>stationIndex</Code> 的範圍是{" "}
          <Code>[flightStart, dwellEnd)</Code>
          ，飛往下一站的那一刻就切換，用它決定句子會在剛出發時就換成下一站。句子改成只在停留段顯示，由時間軸的純函式{" "}
          <Code>getDwellingStationIndex</Code> 判斷：停留中回傳站點
          index，飛行中回傳 <Code>null</Code>，<Code>dwell</Code> 為 0
          的站永遠不會回傳。<Code>StationLines</Code> 與{" "}
          <Code>PacingReadout</Code> 共用這個函式，元件不自行比較邊界；selector
          回傳這個值，只在抵達與離開時重新渲染。
        </>
      ),
    },
    {
      title: "疊在 Canvas 上的 DOM 不能攔截事件",
      body: (
        <>
          文字層容器設 <Code>pointer-events-none</Code>
          ，事件才會穿透到底下的 Canvas；需要點擊的元素再設{" "}
          <Code>pointer-events-auto</Code>
          。透明的遮罩也一樣，平常看不見，卻會擋住所有點擊。
        </>
      ),
    },
    {
      title: "MotionConfig 與減少動態效果",
      body: (
        <>
          <Code>reducedMotion=&quot;user&quot;</Code> 會讀取系統設定：開啟時，
          <Code>x</Code>、<Code>y</Code>、<Code>scale</Code>{" "}
          這類位移動畫直接跳到結果，透明度動畫照常播放。它透過 context
          往下傳，必須包在動畫元件的外面。Motion 的 <Code>MotionConfig</Code>{" "}
          檔案開頭就有 <Code>&quot;use client&quot;</Code>，可以直接寫在 Server
          Component 的 <Code>page.tsx</Code> 裡，不需要另外包一層 client 元件。
        </>
      ),
    },
    {
      title: "AnimatePresence 讓被移除的元件多活一段時間",
      body: (
        <>
          <Code>key</Code> 改變時，React 會立刻卸載舊元件；
          <Code>AnimatePresence</Code> 會攔下舊元件，播完 <Code>exit</Code>{" "}
          才真正卸載。<Code>mode=&quot;wait&quot;</Code>{" "}
          讓新元件等舊元件退場完才進場。它靠直接子元素的 <Code>key</Code>{" "}
          判斷誰離開了。
        </>
      ),
    },
    {
      title: "AnimatePresence 要一直掛著，條件寫在它裡面",
      body: (
        <>
          飛行中若在 <Code>AnimatePresence</Code> 外面 <Code>return null</Code>
          ，它會跟著舊句子一起被卸載，沒有人能播放退場，句子瞬間消失。保持{" "}
          <Code>AnimatePresence</Code> 掛載，在它裡面寫{" "}
          <Code>{"{stationId !== null && <motion.div … />}"}</Code>
          ：子元素消失時，它才會發現舊的 key 不見了並播放 <Code>exit</Code>。
        </>
      ),
    },
    {
      title: "退場跳字：退場中的元件仍會重新渲染",
      body: (
        <>
          退場期間舊元件還在元件樹上。如果它自己從語言 context 取字串，context
          一換，它就會先變成新語言才淡出。在父層取好字串、以 props
          傳入，退場的元件保留的是最後一次收到的 props，就不會跳字。
        </>
      ),
    },
    {
      title: "錯誤版與正確版：差別只在切換語言時",
      body: (
        <>
          錯誤版 <Code>StationLinesWrong</Code> 把容器拆成會自己呼叫{" "}
          <Code>useLabLocale()</Code> 的 <Code>Lines</Code>
          ：切換語言時會跳字，換站時卻不會，因為 <Code>stationId</Code> 是 props
          ，退場期間停在舊值。正確版就是原本的 <Code>StationLines</Code>
          ：語言與句子都在父層算好，<Code>AnimatePresence</Code>{" "}
          保留的是內容已經寫好的 <Code>motion.div</Code>{" "}
          元素，而不是會自己讀語言的元件。兩個版本換站時表現相同，差別只在切換語言時看得出來。
        </>
      ),
    },
    {
      title: "宣告式與命令式動畫",
      body: (
        <>
          逐行淡入是宣告式：寫好目標狀態，由 Motion
          決定何時播放。遮罩是「一步做完才做下一步」的流程，用命令式的{" "}
          <Code>animate()</Code> 比較清楚：它回傳可以 <Code>await</Code>{" "}
          的物件，淡入、跳轉、淡出可以寫成一個 <Code>async</Code> 函式。
        </>
      ),
    },
    {
      title: "退場中的元素要靠 custom 拿到新的值",
      body: (
        <>
          退場中的元素保留的是舊 props，在它身上改 <Code>exit</Code> 它看不到。
          <Code>{"<AnimatePresence custom={…}>"}</Code>{" "}
          的值會即時傳給所有退場中的子元素；variant 寫成函式{" "}
          <Code>{"exit: (custom) => ({ … })"}</Code>
          ，退場開始時才依傳入的值決定 transition。遮罩跳轉時傳入{" "}
          <Code>{"{ isJumping: true }"}</Code>，退場時間就變成 0。
        </>
      ),
    },
    {
      title: "防止重複執行：ref 與 state 各有用途",
      body: (
        <>
          ref 寫入後立即生效，而且每次 render 都是同一個物件，舊的 closure
          也讀得到最新的值，適合擋重複呼叫。state 會觸發
          re-render，適合通知其他元件，但函式讀到的是建立它的那次 render
          的值（stale closure）。只從按鈕的 <Code>onClick</Code> 呼叫時，用
          state 當守衛也不會漏接：React 保證 click
          這類離散事件排入的更新，在下一個離散事件之前完成 render。從{" "}
          <Code>window.addEventListener</Code> 註冊一次的 listener
          呼叫時，就只有 ref 擋得住。
        </>
      ),
    },
    {
      title: "progress 是 0，可能是「在開頭」，也可能是「還不知道」",
      body: (
        <>
          store 以 <Code>isSynced</Code> 區分兩者：初始值為 <Code>false</Code>
          ，由 <Code>setProgress</Code> 設為 <Code>true</Code>。progress
          維持是數字，每幀讀取的 <Code>useFrame</Code> 不需要處理{" "}
          <Code>null</Code>
          ，只有在乎的元件讀這個欄位。句子層把判斷合併進
          selector，「還沒同步」和「飛行中」都回傳 <Code>null</Code>，交給{" "}
          <Code>AnimatePresence</Code> 統一處理。store 是模組層級的單例，
          <Code>SmoothScroll</Code> 的 cleanup 要以{" "}
          <Code>getInitialState()</Code> 重設，否則下一頁會沿用這一頁的狀態。
        </>
      ),
    },
  ],
  pitfalls: [
    {
      title: "staggerChildren 已經被標成 deprecated",
      symptom: (
        <>
          照課綱寫 <Code>staggerChildren</Code>
          ，編輯器把它畫上刪除線。
        </>
      ),
      cause: (
        <>
          Motion 14 的型別定義把 <Code>staggerChildren</Code> 與{" "}
          <Code>staggerDirection</Code> 標成 <Code>@deprecated</Code>。
        </>
      ),
      fix: (
        <>
          改用 <Code>delayChildren: stagger(interval)</Code>，反向則是{" "}
          <Code>stagger(interval, &#123; from: &quot;last&quot; &#125;)</Code>。
          <Code>stagger</Code> 從 <Code>motion/react</Code> 引入。
        </>
      ),
    },
    {
      title: "換站後新掛載的句子沒有依序淡入",
      symptom: (
        <>
          使用 <Code>staggerChildren</Code>
          時，第一次載入會依序淡入；換站後新掛載的句子卻同時出現。
        </>
      ),
      cause: (
        <>
          父元素保留不動、子元素換新時，Motion 會替新掛載的子元素另外計算延遲（
          <Code>animation-state.mjs</Code> 的 <Code>enteringChildren</Code>
          ），但這段程式只讀取父元素 variant 的 <Code>delayChildren</Code>
          ，不讀取 <Code>staggerChildren</Code>。
        </>
      ),
      fix: (
        <>
          使用 <Code>delayChildren: stagger(interval)</Code>
          。這樣不論是父元素切換狀態，還是子元素之後才掛載，都會依序淡入。
        </>
      ),
    },
    {
      title: "initial 與 animate 寫在子元素上，句子同時出現",
      symptom: (
        <>
          父元素設了 <Code>delayChildren</Code>
          ，句子卻在載入時同時淡入，沒有間隔。
        </>
      ),
      cause: (
        <>
          <Code>initial=&quot;hidden&quot; animate=&quot;show&quot;</Code>{" "}
          寫在每個子元素上，父元素只有 <Code>variants</Code>
          ，從頭到尾沒有進入任何狀態，它的 transition
          也就不會被用到。每個子元素各自從掛載的那一刻開始播放。
        </>
      ),
      fix: (
        <>
          把 <Code>initial</Code> 與 <Code>animate</Code>{" "}
          移到父元素，子元素只保留 <Code>variants</Code>
          。父元素切換到 <Code>show</Code>，同名的狀態才會往下傳，並套用父元素的{" "}
          <Code>delayChildren</Code>。
        </>
      ),
    },
    {
      title: "跳到撒馬爾罕後句子沒有出現，階段停在「飛行」",
      symptom: (
        <>
          用導覽跳到撒馬爾罕，畫面停在站上，句子卻沒有出現，讀數的「階段」顯示「飛行」。丹吉爾不會發生。
        </>
      ),
      cause: (
        <>
          撒馬爾罕的 <Code>flightEnd</Code> 是 18 /
          33，換成像素是小數。瀏覽器把捲動位置對齊到實體像素，Lenis 跳轉後的{" "}
          <Code>reset()</Code> 讀回實際的 <Code>scrollY</Code>
          ，結果可能比目標少不到 1 px，progress 就停在 <Code>flightEnd</Code>{" "}
          前面。<Code>devicePixelRatio</Code> 為 1.25 或 1.5
          時最容易發生。丹吉爾的 <Code>flightEnd</Code> 是 0，不會被進位。
        </>
      ),
      fix: (
        <>
          在 <Code>scrollToProgress</Code> 換算像素時，讓落點往停留段多偏 1 CSS
          px（<Code>DWELL_SIDE_BIAS_PX</Code>），並以 <Code>lenis.limit</Code>{" "}
          夾住上限；progress 為 0 時不偏移。1 px 大於任何對齊方式造成的誤差，用{" "}
          <Code>0.5 / devicePixelRatio</Code>{" "}
          剛好等於四捨五入的上限，沒有餘裕。所有跳轉都經過這個函式，SKIP、導覽、遮罩一起修好。
        </>
      ),
    },
    {
      title: "遮罩消失後，舊站的句子還疊在新站的畫面上",
      symptom: (
        <>
          長距離跳轉時，遮罩淡入、淡出都正常，但遮罩消失後，舊站的句子才慢慢淡出，之後新站的句子才進場。
        </>
      ),
      cause: (
        <>
          舊句子要等跳轉改變 progress 才開始退場，退場要 1 秒，遮罩淡出只要 0.2
          秒。<Code>StationLines</Code>{" "}
          不知道這是遮罩跳轉，照平常換站的節奏播放。
        </>
      ),
      fix: (
        <>
          Provider 以 state 提供 <Code>isJumping</Code>，句子層透過{" "}
          <Code>{"<AnimatePresence custom={{ isJumping }}>"}</Code>{" "}
          傳給退場中的元素，<Code>exit</Code> 寫成函式，跳轉時退場時間為 0。
        </>
      ),
    },
    {
      title: "在中間重新整理，先閃出第一站的句子",
      symptom: (
        <>
          捲到飛行段或撒馬爾罕後重新整理，畫面先出現丹吉爾的句子，再切換成正確的狀態。
        </>
      ),
      cause: (
        <>
          store 的 progress 初始值是 0，等於「停在丹吉爾」。伺服器渲染與第一次
          render 都用這個值，直到 <Code>SmoothScroll</Code> 的{" "}
          <Code>useEffect</Code> 建立 Lenis，才寫入實際的位置。
        </>
      ),
      fix: (
        <>
          store 加上 <Code>isSynced</Code>，句子層在同步之前回傳{" "}
          <Code>null</Code>。<Code>SmoothScroll</Code> 的 cleanup
          先取消訂閱，再以 <Code>getInitialState()</Code>{" "}
          重設，避免在單元之間切換時沿用上一頁的進度。
        </>
      ),
    },
  ],
  verifications: [
    {
      id: "stagger",
      body: "捲動到下一站，到站時句子一行一行進場，間隔自然。",
    },
    {
      id: "dwell-only",
      body: "從丹吉爾往下捲：離開停留段時句子淡出，飛行期間沒有句子，抵達麥加時才逐行淡入。讀數的「階段」顯示「飛行」時，畫面上不會有句子。",
    },
    {
      id: "pointer-events",
      body: (
        <>
          在文字層的空白處按右鍵 → 檢查，DevTools 選到的是{" "}
          <Code>&lt;canvas&gt;</Code>。
        </>
      ),
    },
    {
      id: "reduced-motion",
      body: (
        <>
          打開 DevTools → <Code>Ctrl+Shift+P</Code> → 輸入{" "}
          <Code>prefers-reduced-motion</Code>，選擇模擬 <Code>reduce</Code>
          ：句子只淡入、不位移，逐行的間隔還在。改回不模擬後，恢復淡入加位移，不需要重新整理。
        </>
      ),
    },
    {
      id: "exit-jump",
      body: "錯誤版：切換語言時，退場中的文字會先跳成新語言；正確版：退場中的文字維持舊語言直到完全淡出。換站時兩個版本都是舊站的句子淡出後，新站的句子才逐行出現。",
    },
    {
      id: "mask",
      body: "用導覽跳兩站以上，看不到鏡頭高速飛過，也沒有閃出舊畫面；跳轉期間重複點擊不會出錯；抵達後句子照常逐行淡入，讀數的「階段」顯示「停留」。",
    },
    {
      id: "mask-exit",
      body: "長距離跳轉後，遮罩消失時舊站的句子已經不見，只看到新站的句子逐行淡入。一般捲動換站時，舊句子仍然慢慢淡出。",
    },
    {
      id: "synced",
      body: "分別在飛行段、麥加、撒馬爾罕重新整理，畫面不會先閃出丹吉爾的句子。從其他單元切換到本單元時也一樣。",
    },
  ],
};

export default content;
