import {
  Code,
  type Concept,
  type Pitfall,
  type Step,
  type Verification,
} from "@/app/lab/_components";
import type { Unit03Content } from "./types";

const STEPS: Step[] = [
  {
    id: "progress-box",
    title: (
      <>
        ProgressBox：在 <Code>useFrame</Code> 裡依 progress 移動方塊
      </>
    ),
    done: true,
  },
  {
    id: "scroll-driver",
    title: "scrollDriver：集中管理 Lenis 的驅動來源",
    done: true,
  },
  {
    id: "handoff",
    title: (
      <>
        交接：<Code>onCreated</Code> 後改由 <Code>addEffect</Code> 驅動
      </>
    ),
    done: true,
  },
  {
    id: "counter",
    title: "計數器：記錄每幀的呼叫來源與重複次數",
    done: true,
  },
  {
    id: "context-lost",
    title: "Context 遺失時切回 fallback，恢復後交還 R3F",
    done: true,
  },
  {
    id: "delay",
    title: "Canvas 延遲 3 秒載入，確認掛載前仍可捲動",
    done: true,
  },
];

const CONCEPTS: Concept[] = [
  {
    title: "useFrame：每幀、渲染之前",
    body: (
      <>
        <Code>useFrame((state, delta) =&gt; …)</Code> 把 callback 註冊進 R3F
        的迴圈，每幀在 <Code>gl.render()</Code> 之前呼叫一次。
        <Code>state</Code> 裡有 <Code>camera</Code>、<Code>scene</Code>、
        <Code>gl</Code>、<Code>size</Code> 等；<Code>delta</Code>{" "}
        是距離上一幀的秒數。它要靠 Canvas 提供的 context，只能在{" "}
        <Code>&lt;Canvas&gt;</Code> 裡的元件使用。
      </>
    ),
  },
  {
    title: "在 useFrame 裡直接改 three 物件，不經過 React",
    body: (
      <>
        用 <Code>useRef&lt;Mesh&gt;</Code> 拿到 mesh，每幀讀{" "}
        <Code>getState().progress</Code> 後直接改 <Code>position</Code> 與{" "}
        <Code>rotation</Code>。元件沒有會變的 state，只渲染一次；與單元 02 的
        ProgressReadout 是同一個概念。<Code>useFrame</Code> 裡不可呼叫{" "}
        <Code>setState</Code>。
      </>
    ),
  },
  {
    title: "由 progress 決定，而不是隨時間累加",
    body: (
      <>
        <Code>rotation.y = lerp(0, 2π, progress)</Code>{" "}
        往回捲就轉回去、停止捲動就停住；<Code>rotation.y += delta</Code>{" "}
        則會一直轉，同一個位置每次的角度都不同。捲動驅動的畫面必須是 progress
        的函式，這也是鏡頭要寫成純函式的原因。<Code>delta</Code>{" "}
        只用於跟捲動無關的動畫，例如點雲飄動。
      </>
    ),
  },
  {
    title: "不要平滑兩次",
    body: (
      <>
        Lenis 已經把 progress 平滑過，直接指定給 <Code>position</Code>{" "}
        就是平順的。在 <Code>useFrame</Code>{" "}
        裡再加一層緩動，方塊會明顯落後捲動，停下來後還會再滑一段。
      </>
    ),
  },
  {
    title: "畫面看得到多大",
    body: (
      <>
        預設相機在 <Code>z = 5</Code>、<Code>fov = 75°</Code>，
        <Code>z = 0</Code> 平面的可見高度是{" "}
        <Code>2 × 5 × tan(37.5°) ≈ 7.7</Code>，y 約在 ±3.8 之間。方塊在 y = 2 到
        −2 之間移動，邊長 2，不會跑出畫面。
      </>
    ),
  },
  {
    title: "R3F 每一幀的執行順序",
    body: (
      <>
        <Code>loop()</Code> 先排好下一幀，接著依序執行 <Code>addEffect</Code> 的
        callback → 每個 Canvas 的 <Code>useFrame</Code> 與{" "}
        <Code>gl.render()</Code> → <Code>addAfterEffect</Code>
        。在 <Code>addEffect</Code> 裡呼叫 <Code>lenis.raf()</Code>
        ，就能固定「更新捲動 → 讀取 → 渲染」的順序。
      </>
    ),
  },
  {
    title: "addEffect 是全域的，而且只在 R3F 迴圈運作時被呼叫",
    body: (
      <>
        callback 存在模組層級的 Set 裡，跟 Canvas 沒有綁定，Canvas
        卸載時不會自動移除，必須呼叫它回傳的取消函式。沒有任何 Canvas
        需要渲染時（Canvas 卸載，或 <Code>frameloop=&quot;demand&quot;</Code>{" "}
        且畫面閒置），R3F 的迴圈會停止，<Code>addEffect</Code>{" "}
        也跟著停。所以這個專案的 Canvas 維持預設的{" "}
        <Code>frameloop=&quot;always&quot;</Code>。
      </>
    ),
  },
  {
    title: "由一個模組獨佔「誰在驅動」",
    body: (
      <>
        fallback 迴圈與 <Code>addEffect</Code>{" "}
        的啟動和取消如果散落在好幾個元件，很難保證任何時刻只有一個來源。
        <Code>scrollDriver</Code>{" "}
        集中管理這個狀態：每次切換都先停掉目前的來源再啟動新的，重複呼叫也不會出錯（冪等），不變條件只需要在一個檔案裡保證。
      </>
    ),
  },
  {
    title: "ES module 本身就是單例",
    body: (
      <>
        同一個頁面裡，不管多少檔案 import <Code>scrollDriver</Code>
        ，拿到的都是同一份模組與同一份模組層級變數，所以 SmoothScroll 與 Scene
        會操作同一個 driver。驅動狀態是執行中的資源（rAF
        id、取消函式），不是畫面資料，不需要放進 React state 或
        zustand。開發模式下修改這個檔案時，HMR
        會重新執行模組並重設變數；伺服器上的模組則被所有請求共用，所以這些函式只在
        effect 與 <Code>onCreated</Code> 這類瀏覽器端的地方呼叫。
      </>
    ),
  },
  {
    title: "用 null 表示「沒在跑」，驅動來源用推導的",
    body: (
      <>
        只存 <Code>fallbackId</Code> 與 <Code>removeEffect</Code>，
        <Code>getDriver()</Code> 由它們推導出 fallback、r3f 或 none。另外存一個{" "}
        <Code>driver</Code> 欄位，等於同一件事有兩份紀錄，可能互相矛盾。
      </>
    ),
  },
  {
    title: "沒有 Lenis 時什麼都不做",
    body: (
      <>
        卸載時 SmoothScroll 與 Scene 誰的 cleanup 先跑並不確定。
        <Code>detachLenis()</Code> 之後若又有人呼叫{" "}
        <Code>driveWithFallback()</Code>
        ，絕不能重新啟動迴圈，所以兩個 <Code>driveWith…</Code> 一開始都先檢查{" "}
        <Code>lenis</Code>。
      </>
    ),
  },
  {
    title: "用依賴注入避免把 three 拉進主 bundle",
    body: (
      <>
        SmoothScroll 是一般 import，它引用的模組都會進頁面的主要 bundle。若{" "}
        <Code>scrollDriver</Code> 直接 import <Code>addEffect</Code>，R3F
        與它依賴的 three 很可能一起被拉進來，<Code>dynamic</Code> 的 code
        splitting 就白費了。改由已經在 dynamic chunk 裡的 Scene 呼叫{" "}
        <Code>driveWithR3f(addEffect)</Code>，driver 只需要參數的型別；Lenis
        也只用 <Code>import type</Code>。
      </>
    ),
  },
  {
    title: "所有呼叫都經過 tick()",
    body: (
      <>
        fallback 迴圈與 <Code>addEffect</Code> 都呼叫同一個 <Code>tick()</Code>
        ，不直接呼叫 <Code>lenis.raf()</Code>
        。之後計數器只要加在 <Code>tick()</Code> 裡，就能抓到所有呼叫。
      </>
    ),
  },
  {
    title: "onCreated：R3F 準備好接手、還沒畫第一幀",
    body: (
      <>
        Canvas 建立 R3F root 後，renderer 是<strong>非同步</strong>就緒的（v9
        支援 WebGPU）。就緒後才渲染 children 並呼叫{" "}
        <Code>onCreated(state)</Code>
        ，下一次 R3F loop 才開始 <Code>addEffect</Code> → <Code>useFrame</Code>{" "}
        → 第一次渲染，正好是交接的時間點。交接那一刻可能有一幀沒有人呼叫{" "}
        <Code>lenis.raf()</Code>，但只會少一次、不會多一次；Lenis
        以時間差計算位移，下一幀會自動補上。
      </>
    ),
  },
  {
    title: "Canvas 卸載時要交還驅動權",
    body: (
      <>
        沒有 Canvas 需要渲染時 R3F 迴圈會停止，<Code>addEffect</Code>{" "}
        也不再被呼叫。若只移除 Canvas、Lenis 還活著（例如 WebGL
        初始化失敗改顯示靜態畫面），頁面就會捲不動，所以 Scene 的 cleanup 要呼叫{" "}
        <Code>driveWithFallback()</Code>。整頁卸載時 Lenis 可能已經
        detach，這時它會因為「沒有 Lenis」直接 return。
      </>
    ),
  },
  {
    title: "Strict Mode 下 onCreated 只觸發一次",
    body: (
      <>
        R3F 的 Canvas 只在 <Code>&lt;canvas&gt;</Code> 真的離開 DOM 時（
        <Code>!canvas.isConnected</Code>）才卸載 root。Strict Mode
        的模擬卸載不會移除 DOM，所以 root 保留，<Code>onCreated</Code>{" "}
        不會再觸發。若 cleanup 交還驅動權、setup 卻不會取回，就可能停在
        fallback。effect 的 setup 與 cleanup 要對稱：用 <Code>useRef</Code> 記住
        Canvas 是否已建立，setup 時若已建立就呼叫 <Code>driveWithR3f</Code>
        。不影響畫面的值用 ref，不用 state。
      </>
    ),
  },
  {
    title: "呼叫來源由呼叫端傳入，不用 getDriver() 推算",
    body: (
      <>
        計數器要抓的是「兩個來源同時在跑」，也就是狀態已經錯了的情況。這時{" "}
        <Code>getDriver()</Code> 先檢查 <Code>fallbackId</Code>
        ，兩次呼叫都會被算成
        fallback。要偵測狀態錯誤，就不能用那個狀態推算證據： fallback 迴圈呼叫{" "}
        <Code>tick(t, &quot;fallback&quot;)</Code>，交給 <Code>addEffect</Code>{" "}
        的箭頭函式補上 <Code>&quot;r3f&quot;</Code>。<Code>addEffect</Code>{" "}
        回傳的取消函式綁在那次註冊上，包一層不影響 <Code>removeEffect</Code>。
      </>
    ),
  },
  {
    title: "Exclude 與 Record：從既有型別推導",
    body: (
      <>
        <Code>type Source = Exclude&lt;Driver, &quot;none&quot;&gt;</Code>{" "}
        從聯集中拿掉 <Code>&quot;none&quot;</Code>，<Code>Driver</Code>{" "}
        增加來源時會自動跟著變。計數用 <Code>Record&lt;Source, number&gt;</Code>
        ，<Code>counts[source] += 1</Code> 一行處理所有來源，不必寫
        if/else，漏寫 key 時 TypeScript 會報錯。
      </>
    ),
  },
  {
    title: "getStats() 回傳複本",
    body: (
      <>
        直接回傳 <Code>counts</Code>，呼叫端就能改到模組內部的計數。
        <Code>{"{ ...counts }"}</Code> 在執行時就隔開；
        <Code>Readonly&lt;…&gt;</Code>{" "}
        只在編譯時檢查。展開是淺複製，內容只有數字所以足夠。每幀多一個小物件的成本可以忽略，而且這裡沒有
        selector 比較，不會像 zustand 那樣造成 re-render。
      </>
    ),
  },
  {
    title: "高頻數值的顯示：rAF + textContent + data-*",
    body: (
      <>
        統計每幀都在變，跟 progress 一樣不放進 zustand 或 React state。
        DriverReadout 沿用單元 02 的做法：自己的 rAF 迴圈每幀讀{" "}
        <Code>getStats()</Code>、寫 <Code>textContent</Code>
        。這個迴圈只讀不呼叫 <Code>lenis.raf()</Code>
        ，不違反不變條件。狀態改寫成 <Code>data-alert</Code>、
        <Code>data-driver</Code>，顏色交給 Tailwind 的{" "}
        <Code>data-[alert=true]:text-destructive</Code>：JS 只改狀態，CSS
        決定外觀，class 也留在 JSX 裡讓 Biome 排序。數字加上{" "}
        <Code>tabular-nums</Code> 使用等寬數字，跳動時整行不會左右抖動。
      </>
    ),
  },
  {
    title: "WebGL context 遺失與恢復",
    body: (
      <>
        GPU 是整台裝置共用的，瀏覽器可以隨時收回
        context（記憶體不足、分頁在背景太久、驅動重置）。收回時 canvas 觸發{" "}
        <Code>webglcontextlost</Code>，之後的 GL 呼叫都無效；瀏覽器還回來時觸發{" "}
        <Code>webglcontextrestored</Code>
        。要讓瀏覽器嘗試恢復，必須在 lost 事件裡呼叫{" "}
        <Code>preventDefault()</Code>，three 的 <Code>onContextLost</Code>{" "}
        已經做了，listener 只需負責切換驅動來源。
      </>
    ),
  },
  {
    title: "用 WEBGL_lose_context 模擬",
    body: (
      <>
        <Code>
          gl.getContext().getExtension(&quot;WEBGL_lose_context&quot;)
        </Code>{" "}
        提供 <Code>loseContext()</Code> 與 <Code>restoreContext()</Code>
        。extension 物件必須在遺失<strong>之前</strong>取得並保存（在{" "}
        <Code>onCreated</Code> 存進 ref），遺失後 <Code>getExtension()</Code>{" "}
        會回傳 <Code>null</Code>。按鈕上的 <Code>?.</Code> 遇到 null
        會靜默跳過，所以要用 console 的 <Code>Context Lost.</Code>{" "}
        訊息確認真的遺失了。
      </>
    ),
  },
  {
    title: "AbortController：一次移除多個 listener",
    body: (
      <>
        <Code>addEventListener(type, fn, {"{ signal }"})</Code> 把 listener 綁在
        signal 上，<Code>controller.abort()</Code> 時全部一起移除。listener
        可以寫成行內箭頭函式，不必保存參照給 <Code>removeEventListener</Code>。
      </>
    ),
  },
  {
    title: "讓「接上」回傳自己的「拆除」",
    body: (
      <>
        <Code>connectR3f(canvas)</Code> 交給 R3F 並掛上 listener，回傳的函式移除
        listener 並交還 fallback，與 <Code>addEffect</Code>、
        <Code>lenis.on</Code> 回傳取消函式是同一種設計。<Code>onCreated</Code>{" "}
        與 effect setup 都呼叫它，cleanup 只呼叫它回傳的函式，setup 與 cleanup
        由同一個函式定義，不會一邊多一邊少。拆除函式存進 ref，cleanup 呼叫後清成{" "}
        <Code>null</Code>。
      </>
    ),
  },
  {
    title: "卸載時 R3F 會主動讓 context 遺失",
    body: (
      <>
        R3F 卸載 root 時會呼叫 <Code>gl.forceContextLoss()</Code>，觸發{" "}
        <Code>webglcontextlost</Code>。這個事件是非同步派送的，通常 effect
        cleanup 已經 <Code>abort()</Code>
        ；即使 listener 還在，<Code>driveWithFallback()</Code> 也是冪等的，Lenis
        已 detach 時更會直接 return，不會重新啟動迴圈。
      </>
    ),
  },
  {
    title: "dynamic 的載入函式只是「回傳 Promise 的函式」",
    body: (
      <>
        <Code>dynamic</Code> 只等 Promise resolve，期間顯示 <Code>loading</Code>
        ，不在乎 Promise 怎麼來的。先 <Code>await wait(ms)</Code> 再{" "}
        <Code>return import(&quot;./Scene&quot;)</Code> 就能延遲載入；
        <Code>wait</Code> 是把 <Code>setTimeout</Code> 包成 Promise
        的小函式。依序寫是模擬慢速網路（3 秒 + 下載時間）；用{" "}
        <Code>Promise.all</Code> 同時開始則是「載入畫面至少顯示 3
        秒」，正式網站的載入動畫常用後者。
      </>
    ),
  },
  {
    title: "import() 要寫成字面字串，並留在載入函式裡",
    body: (
      <>
        Turbopack 在建置時掃描 <Code>import(&quot;./Scene&quot;)</Code> 才會把
        Scene 與 three 切成獨立 chunk，Next 的編譯器也在{" "}
        <Code>dynamic(...)</Code> 的參數裡找它。路徑不能是變數；呼叫也不能搬到{" "}
        <Code>dynamic</Code> 外面先執行，否則一載入就開始下載，延遲失去意義。
      </>
    ),
  },
];

const PITFALLS: Pitfall[] = [
  {
    title: "以為 <Canvas ref> 有值就代表 R3F 已就緒",
    symptom: (
      <>
        重新整理後 fallback 的次數接近 0，驅動來源一開始就是 r3f；WebGL
        初始化失敗時頁面會永遠捲不動。
      </>
    ),
    cause: (
      <>
        R3F 以 <Code>useImperativeHandle</Code> 把 ref 指向{" "}
        <Code>&lt;canvas&gt;</Code>，commit 階段就有值，比 effect 還早；renderer
        卻是之後才非同步就緒。effect 看到 ref 有值就交給
        R3F，就緒前的空窗沒有人驅動 Lenis。
      </>
    ),
    fix: (
      <>
        拿掉 <Code>ref</Code> prop，改在 <Code>onCreated</Code> 裡手動寫入{" "}
        <Code>canvasRef.current = state.gl.domElement</Code>，「ref
        有值」才等於「已就緒」。
      </>
    ),
  },
  {
    title: "在 onCreated 裡回傳 cleanup",
    symptom: "listener 永遠不會被移除。",
    cause: (
      <>
        <Code>onCreated</Code> 只是一般的 callback，不是 effect，R3F
        不理會它的回傳值。
      </>
    ),
    fix: "把拆除函式存進 ref，由 effect 的 cleanup 呼叫。",
  },
  {
    title: "effect 提早 return，連 cleanup 都沒註冊",
    symptom: "只卸載 Canvas 時不會交還 fallback，頁面捲不動。",
    cause: (
      <>
        寫成「尚未建立就 return」，第一次執行時 <Code>onCreated</Code>{" "}
        還沒觸發，effect 直接結束；依賴陣列是 <Code>[]</Code>
        ，之後不會再執行，cleanup 從來沒有註冊。
      </>
    ),
    fix: "條件只包住 setup 的部分，cleanup 一律 return。",
  },
  {
    title: "有文字的按鈕又加了 aria-label",
    symptom: <>畫面寫「Lose context」，螢幕閱讀器卻念「Loss context」。</>,
    cause: (
      <>
        <Code>aria-label</Code>{" "}
        會覆蓋可見文字成為無障礙名稱；名稱對不上時，語音控制的使用者說出看到的字也點不到（WCAG
        2.5.3 Label in Name）。
      </>
    ),
    fix: (
      <>
        有可見文字就不加 <Code>aria-label</Code>，只有 icon 按鈕才需要。
        <Code>role=&quot;toolbar&quot;</Code>{" "}
        承諾方向鍵導覽，沒有實作也不要宣告。
      </>
    ),
  },
  {
    title: "延遲載入後，方塊先出現在頂端",
    symptom:
      "捲到中間後重新整理，Canvas 出現時方塊在頂端，捲動一下才瞬間移到正確位置。",
    cause: (
      <>
        SmoothScroll 只訂閱 <Code>&quot;scroll&quot;</Code>{" "}
        事件，瀏覽器的捲動還原不會觸發它，store 的 progress 停在 0。
      </>
    ),
    fix: (
      <>
        建立 Lenis 後先以 <Code>lenis.progress</Code> 寫入一次
        store，再訂閱。屬於單元 02 的範圍，詳見單元 02 的筆記。
      </>
    ),
  },
];

const VERIFICATIONS: Verification[] = [
  {
    id: "attach-detach",
    body: (
      <>
        在 <Code>attachLenis()</Code> 與 <Code>detachLenis()</Code> 後各印出{" "}
        <Code>getDriver()</Code>，重新整理後 console 依序出現 fallback → none →
        fallback（Strict Mode 的掛載兩次），方塊照樣隨捲動移動。
      </>
    ),
  },
  {
    id: "handoff",
    body: (
      <>
        在 <Code>onCreated</Code> 與 Scene 的 cleanup 各印出{" "}
        <Code>getDriver()</Code>，重新整理數次，最後的狀態都是 r3f，不會偶爾停在
        fallback。
      </>
    ),
  },
  {
    id: "canvas-only-unmount",
    body: "只隱藏 Canvas 時頁面仍可捲動、驅動來源為 fallback；再次顯示後 onCreated 觸發，切回 r3f。",
  },
  {
    id: "counter-normal",
    body: "DriverReadout 顯示驅動來源從 fallback 變成 r3f；交接後 fallback 的次數停止增加，R3F 的次數開始增加，同幀重複維持 0。",
  },
  {
    id: "counter-broken",
    body: (
      <>
        暫時註解掉 <Code>driveWithR3f()</Code> 裡的 <Code>stop()</Code>
        ：兩個來源的次數一起增加，同幀重複每幀加 1
        並變成紅色，證明計數器真的在數。改回來後恢復為 0。
      </>
    ),
  },
  {
    id: "before-canvas",
    body: "重新整理後的前 3 秒（Canvas 還沒出現），頁面就能平滑捲動，DriverReadout 顯示 fallback 且次數持續增加。",
  },
  {
    id: "after-canvas",
    body: "Canvas 出現後，驅動來源切換為 r3f，fallback 的次數停住，同幀重複維持 0。",
  },
  {
    id: "scroll-during-delay",
    body: "在空窗期捲到中間再等 Canvas 出現：方塊直接出現在對應的位置。",
  },
  {
    id: "reload-mid-page",
    body: "捲到中間後重新整理、不再捲動：Canvas 出現時方塊直接在中間。",
  },
  {
    id: "context-lost-loop",
    body: (
      <>
        暫時不掛 listener，按「Lose context」：console 出現{" "}
        <Code>THREE.WebGLRenderer: Context Lost.</Code>，canvas 變成空白，但 R3F
        的次數持續增加、頁面仍可平順捲動，證明 R3F 的迴圈沒有停。
      </>
    ),
  },
  {
    id: "context-lost",
    body: "掛上 listener 後按「Lose context」：驅動來源切回 fallback，R3F 的次數停住、fallback 的次數開始增加，同幀重複維持 0，頁面仍可捲動。",
  },
  {
    id: "context-restored",
    body: "一邊捲動一邊按「Restore context」：驅動來源切回 r3f，方塊直接出現在目前捲動位置對應的地方，而不是從遺失前的位置滑過去。",
  },
  {
    id: "no-duplicates",
    body: "整個過程中，同一幀重複呼叫 lenis.raf() 的次數一直是 0。",
  },
];

const CONTENT: Unit03Content = {
  intro: (
    <>
      讓 Lenis 和 R3F 依固定順序執行：Canvas 就緒前由 fallback
      迴圈驅動，就緒後交給 <Code>addEffect</Code>，context
      遺失時再切回來。任何時刻只有一個來源呼叫 <Code>lenis.raf()</Code>。
    </>
  ),
  demoCaption: "隨捲動移動的方塊，以及目前驅動 Lenis 的來源與呼叫次數。",
  readout: {
    driver: "驅動來源",
    fallback: "fallback 呼叫",
    r3f: "R3F 呼叫",
    duplicates: "同幀重複呼叫",
  },
  steps: STEPS,
  handoff: {
    title: "驅動來源的切換",
    timeline: {
      drivers: { fallback: "fallback 驅動", r3f: "R3F 驅動", none: "全部停止" },
      notes: {
        initial: "Canvas 掛載前",
        created: "Canvas 就緒",
        lost: "畫面停住，仍可捲動",
        restored: "恢復渲染",
        unmount: "任何階段皆可能",
      },
      unmount: "卸載",
    },
    paragraphs: [
      {
        id: "why-not-fallback",
        body: (
          <>
            <strong>為什麼不一直用 fallback？</strong>fallback 迴圈與 R3F
            的迴圈是兩個獨立的 rAF
            callback，同一幀裡誰先執行取決於註冊順序，沒有保證。若 R3F 先跑，
            <Code>useFrame</Code> 讀到的是上一幀的
            progress，畫面會落後捲動一幀，捲動時產生細微的抖動。
            <Code>addEffect</Code> 保證在同一次 loop 裡先呼叫{" "}
            <Code>lenis.raf()</Code>，再執行 <Code>useFrame</Code>{" "}
            與渲染，順序固定是「更新捲動 → 讀取 → 渲染」。
          </>
        ),
      },
      {
        id: "why-not-add-effect",
        body: (
          <>
            <strong>為什麼不一直用 addEffect？</strong>它只在 R3F
            的迴圈運作時被呼叫。Canvas 還在 <Code>dynamic</Code> 載入、WebGL
            初始化失敗、Canvas 被卸載時，迴圈都不存在。Lenis
            攔截了原生捲動，沒有人呼叫 <Code>lenis.raf()</Code>{" "}
            頁面就完全捲不動，所以需要一個不依賴 Canvas 的 fallback。
          </>
        ),
      },
      {
        id: "why-switch-back",
        body: (
          <>
            <strong>Context 遺失時為什麼要切回去？</strong>實測 R3F
            的迴圈不會停，繼續交給 <Code>addEffect</Code> 其實也能捲動。但這只是
            R3F 與 three
            目前版本的實作細節，文件沒有保證，升級或換瀏覽器都可能改變。切到自己控制的
            fallback，就不依賴別人的實作細節；反過來說，也正因為迴圈不會停，切換時一定要先取消{" "}
            <Code>addEffect</Code>，否則會變成兩個來源。
          </>
        ),
      },
      {
        id: "conclusion",
        body: (
          <>
            結論：R3F 可用時交給它，換取固定的執行順序；不可用時交給
            fallback，確保頁面能捲動。兩者輪流，任何時刻只有一個。
          </>
        ),
      },
    ],
  },
  findings: {
    title: "實測結果",
    body: (
      <>
        Context 遺失時，R3F 的迴圈<strong>不會停</strong>
        ，與原始碼推測一致：R3F 沒有監聽 <Code>webglcontextlost</Code>，three
        只停止 <Code>setAnimationLoop</Code>（R3F 沒有使用），
        <Code>gl.render()</Code> 一開頭檢查 <Code>_isContextLost</Code> 後直接
        return。不掛 listener 時，canvas 變成空白，但 R3F
        的次數持續增加、頁面照常捲動。
      </>
    ),
  },
  limitations: {
    title: "已知限制",
    paragraphs: [
      {
        id: "stuck-on-fallback",
        body: (
          <>
            <strong>重建 Lenis 後會一直停在 fallback。</strong>
            <Code>attachLenis()</Code> 一律從 fallback 開始，而{" "}
            <Code>detachLenis()</Code> 會一併取消 <Code>addEffect</Code>
            。若在 Canvas 就緒後重建 Lenis（detach → new Lenis → attach），
            <Code>onCreated</Code> 不會再觸發，沒有人呼叫{" "}
            <Code>driveWithR3f()</Code>，「捲動 → 讀取 →
            渲染」的順序保證也跟著消失。
          </>
        ),
      },
      {
        id: "cause",
        body: (
          <>
            原因是 driver 把兩件獨立的事綁在一起：Lenis 在不在（SmoothScroll
            管理）與 R3F 能不能用（Scene 管理）。這個單元只在頁面卸載時
            detach，不會遇到；單元 16 即時切換減少動態效果時需要重建
            Lenis，屆時讓 driver 另外記住 R3F 是否可用，
            <Code>attachLenis()</Code> 再依此決定從哪個來源開始。
          </>
        ),
      },
    ],
  },
  concepts: CONCEPTS,
  pitfalls: PITFALLS,
  verifications: VERIFICATIONS,
};

export default CONTENT;
