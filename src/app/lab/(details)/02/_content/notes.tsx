import type { ReactNode } from "react";
import {
  Code,
  type Column,
  type Concept,
  type Pitfall,
  type Step,
  type Verification,
} from "@/app/lab/_components";

const STEPS: Step[] = [
  {
    id: "store",
    title: (
      <>
        建立 store：<Code>progress</Code>、<Code>stationIndex</Code>、
        <Code>setProgress</Code>
      </>
    ),
    done: true,
  },
  {
    id: "smooth-scroll",
    title: "SmoothScroll：建立 Lenis、自己的 rAF 迴圈、寫入 store",
    done: true,
  },
  {
    id: "station-readout",
    title: (
      <>
        StationReadout：用 selector 顯示 <Code>stationIndex</Code>
      </>
    ),
    done: true,
  },
  {
    id: "progress-readout",
    title: (
      <>
        ProgressReadout：rAF 讀 <Code>getState()</Code>，直接寫進 DOM
      </>
    ),
    done: true,
  },
  {
    id: "anti-pattern",
    title: (
      <>
        錯誤示範：用 selector 訂閱 <Code>progress</Code>
      </>
    ),
    done: true,
  },
  {
    id: "devtools",
    title: "用 React DevTools 的 Highlight updates 驗收",
    done: true,
  },
];

type ReadRow = {
  id: string;
  syntax: ReactNode;
  rerender: string;
  usage: string;
};

const READ_COLUMNS: Column<ReadRow>[] = [
  { key: "syntax", label: "寫法" },
  { key: "rerender", label: "重新渲染" },
  { key: "usage", label: "用在哪裡" },
];

const READ_ROWS: ReadRow[] = [
  {
    id: "selector",
    syntax: <Code>{"useScrollStore((s) => s.stationIndex)"}</Code>,
    rerender: "只在選到的值改變時",
    usage: "DOM 元件讀取低頻欄位",
  },
  {
    id: "get-state",
    syntax: <Code>useScrollStore.getState().progress</Code>,
    rerender: "不會",
    usage: "useFrame、rAF 迴圈、事件回呼",
  },
  {
    id: "set",
    syntax: <Code>{"getState().setProgress(…)"}</Code>,
    rerender: "只影響有訂閱該欄位的元件",
    usage: "Lenis 的 scroll 事件",
  },
];

const CONCEPTS: Concept[] = [
  {
    title: "高頻與低頻資料分開讀取",
    body: (
      <>
        <Code>progress</Code> 每幀都在變，若當成 React state
        訂閱，元件每秒會重新渲染約 60 次。<Code>stationIndex</Code>{" "}
        整段捲動只變幾次，用 selector 訂閱沒有問題。同一個
        store，兩種欄位用兩種方式讀。
      </>
    ),
  },
  {
    title: "selector 用 Object.is 判斷要不要重新渲染",
    body: (
      <>
        每次 store 更新，zustand 會重新執行 selector，再以{" "}
        <Code>Object.is</Code> 比較新舊結果。<Code>stationIndex</Code> 從 1 寫成
        1，結果相同，元件就不會動，所以每幀寫入也沒關係。不帶 selector 呼叫{" "}
        <Code>useScrollStore()</Code> 等於選取整個 state 物件，每次{" "}
        <Code>set</Code> 都產生新物件，元件就會每幀重新渲染。
      </>
    ),
  },
  {
    title: "zustand 5 的 TypeScript 寫法",
    body: (
      <>
        <Code>{"create<ScrollState>()((set) => ({ … }))"}</Code>{" "}
        多出來的空括號是刻意的：先傳型別、再傳函式，讓 TypeScript 能正確推斷
        middleware 的型別。
      </>
    ),
  },
  {
    title: "stationIndex 依區間計算",
    body: (
      <>
        用邊界陣列加上 <Code>findIndex</Code>，不寫成{" "}
        <Code>Math.floor(progress * 3)</Code>：之後每站的長度不會相同。單元 05
        只要把邊界陣列換成從 timeline 讀取。
      </>
    ),
  },
  {
    title: "Lenis 如何做到平滑捲動",
    body: (
      <>
        攔截滾輪與觸控事件，記下目標位置，每一幀讓目前位置往目標靠近一點（
        <Code>lerp</Code>，預設 10%），再寫回 <Code>window.scrollTo</Code>
        。這一步必須每幀執行，所以要有人每幀呼叫 <Code>lenis.raf(time)</Code>。
      </>
    ),
  },
  {
    title: "autoRaf: false，迴圈自己寫",
    body: (
      <>
        <Code>autoRaf: true</Code> 時，Lenis 的 <Code>raf()</Code>{" "}
        結尾會自己再排下一幀。它跟 R3F 是兩個獨立的 rAF
        callback，同一幀內誰先執行沒有保證，鏡頭可能讀到上一幀的
        progress。若又在 <Code>addEffect</Code> 裡手動呼叫 <Code>raf()</Code>
        ，每次呼叫都會再生出一條永不停止的迴圈。所以規定一律{" "}
        <Code>autoRaf: false</Code>；這個單元自己寫的迴圈，就是單元 03 的
        fallback 迴圈。
      </>
    ),
  },
  {
    title: "Lenis 要在 useEffect 裡建立",
    body: (
      <>
        寫在模組最上層：<Code>&apos;use client&apos;</Code>{" "}
        元件仍會在伺服器執行，而且實例永遠不會被銷毀，離開頁面後還會接管其他頁的捲動。寫在元件本體：每次渲染都建立一個新的。
        <Code>useEffect</Code> 只在瀏覽器、掛載後執行，卸載時執行
        cleanup，生命週期跟元件綁在一起。
      </>
    ),
  },
  {
    title: "rAF 迴圈與 closure",
    body: (
      <>
        <Code>requestAnimationFrame</Code> 只會呼叫一次，callback
        裡要再請求一次才會形成迴圈；每次都回傳新的 id，所以用 <Code>let</Code>{" "}
        變數每幀覆寫。cleanup 與 <Code>loop</Code> 在同一個 effect 裡建立，
        closure 捕捉的是變數本身，cleanup 讀到的就是最新的 id，不需要{" "}
        <Code>useRef</Code>。
      </>
    ),
  },
  {
    title: "cleanup 的順序與建立相反",
    body: (
      <>
        先 <Code>cancelAnimationFrame</Code>，再取消註冊（
        <Code>lenis.on()</Code> 的回傳值就是取消函式），最後{" "}
        <Code>lenis.destroy()</Code>，避免已銷毀的實例在下一幀又被呼叫{" "}
        <Code>raf()</Code>。
      </>
    ),
  },
  {
    title: "destroy() 會清掉所有監聽，但 unsubscribe 仍是好習慣",
    body: (
      <>
        <Code>lenis.destroy()</Code> 內部會清空 emitter（
        <Code>this.events = {"{}"}</Code>），所有 <Code>lenis.on()</Code>{" "}
        註冊的監聽一併移除。監聽與 Lenis 在同一個 effect
        裡一起建立、一起銷毀時，<Code>unsubscribe()</Code>{" "}
        是多餘的，這裡保留只是為了明確。正式專案中 Lenis
        可能放在根層級、活得比監聽它的元件久，元件卸載時 Lenis
        不會被銷毀，這時一定要自己 <Code>unsubscribe()</Code>
        ，否則監聽會一直留著，造成記憶體洩漏。
      </>
    ),
  },
  {
    title: "Lenis 預設遵循減少動態效果",
    body: (
      <>
        Lenis 1.3 的 <Code>respectReducedMotion</Code> 預設為 <Code>true</Code>
        ：系統開啟減少動態效果時，<Code>lerp</Code> 會被設成
        1，平滑捲動直接消失。Windows 關掉「動畫效果」就會觸發。單元 16
        可能可以利用這個選項簡化即時切換。
      </>
    ),
  },
  {
    title: "繞過 React：用 ref 直接寫 DOM",
    body: (
      <>
        ProgressReadout 沒有任何會變的 state，數字是 rAF 迴圈讀{" "}
        <Code>getState()</Code> 後寫進 <Code>ref.current.textContent</Code>
        ，React 完全不知道，所以元件只渲染一次。單元 03 在 <Code>useFrame</Code>{" "}
        裡直接改 <Code>mesh.position</Code> 是同一個概念。span
        的初始文字要寫死成常數（
        <Code>0.0000</Code>），不能交給 React 渲染會變的值，否則 React
        重新渲染時會蓋掉迴圈寫入的數字。
      </>
    ),
  },
  {
    title: "selector 回傳新物件，等於每幀重新渲染",
    body: (
      <>
        <Code>{"useScrollStore((s) => ({ index: s.stationIndex }))"}</Code>{" "}
        每次都回傳新的物件，<Code>Object.is</Code> 永遠是 <Code>false</Code>
        。選單一個原始值最理想；需要多個值時用 <Code>useShallow</Code>
        ，它會逐一比較物件的每個欄位。
      </>
    ),
  },
  {
    title: "'use client' 的界線越往下越好",
    body: (
      <>
        <Code>DemoPane</Code> 維持 Server Component，只有用到 hook 的
        StationReadout、ProgressReadout 加上 <Code>&apos;use client&apos;</Code>
        。Server Component 可以把 Client Component 當成 children 渲染。
      </>
    ),
  },
  {
    title: "aria-live 只給低頻的內容",
    body: (
      <>
        live region 裡的文字一改變，螢幕閱讀器就會唸出來。stationIndex
        只在跨站時改變，適合放在 <Code>aria-live=&quot;polite&quot;</Code> 的{" "}
        <Code>&lt;output&gt;</Code> 裡；progress
        每幀都在變，放進去就會不停唸數字。同樣是會變的數字，更新頻率不同，處理方式也不同。
      </>
    ),
  },
  {
    title: "多條 rAF 迴圈之間沒有順序保證",
    body: (
      <>
        SmoothScroll 與 ProgressReadout 各有一條迴圈，同一幀內誰先執行沒有保證，
        ProgressReadout
        可能顯示上一幀的值。顯示數字看不出差別，但鏡頭看得出來。單元 03
        把每幀要做的事收進 R3F 的同一個迴圈，固定成「更新捲動 → 寫入 store →
        讀取」。
      </>
    ),
  },
];

const PITFALLS: Pitfall[] = [
  {
    title: "只訂閱 scroll 事件，沒有讀初始值",
    symptom:
      "捲到中間後重新整理，畫面還原在中間，progress 與 stationIndex 卻停在 0，要捲動一下才跳到正確的值。",
    cause: (
      <>
        瀏覽器的捲動還原把頁面放回原位，但沒有發生捲動，Lenis 不會發出{" "}
        <Code>&quot;scroll&quot;</Code>{" "}
        事件。事件只回報「變化」，不回報「初始狀態」，store
        在第一次變化前一直是初始值。單元 03 延遲載入 Canvas
        時才發現：方塊先出現在頂端，捲動後才瞬間移到正確位置。
      </>
    ),
    fix: (
      <>
        建立 Lenis 後先以 <Code>lenis.progress</Code> 寫入一次
        store，再訂閱後續變化。React 的 <Code>useSyncExternalStore</Code>{" "}
        同時要求 <Code>subscribe</Code> 與 <Code>getSnapshot</Code>
        也是同樣的道理。捲動還原的時機不一定早於 effect，若仍偶爾停在
        0，代表還原發生在之後，需要另外處理。
      </>
    ),
  },
  {
    title: "Lenis 寫在模組最上層",
    symptom: "可能在伺服器端報錯；離開頁面後，其他頁面的捲動仍被接管。",
    cause: (
      <>
        <Code>&apos;use client&apos;</Code>{" "}
        模組也會在伺服器執行，最上層的程式碼只會跑一次，也沒有地方銷毀它。
      </>
    ),
    fix: (
      <>
        移到 <Code>useEffect</Code> 裡建立，在 cleanup 中 <Code>destroy()</Code>
        。
      </>
    ),
  },
  {
    title: "live region 把 progress 也包進去",
    symptom: "螢幕閱讀器會每幀唸一次 progress。",
    cause: (
      <>
        <Code>&lt;output aria-live&gt;</Code> 同時包住 StationReadout 與
        ProgressReadout。
      </>
    ),
    fix: (
      <>
        <Code>aria-live</Code> 只包住 StationReadout；外層的 flex 排版改用普通的{" "}
        <Code>&lt;div&gt;</Code>。
      </>
    ),
  },
  {
    title: "<output> 裡放了區塊元素",
    symptom: (
      <>
        <Code>&lt;output&gt;</Code> 裡有 <Code>&lt;p&gt;</Code> 或{" "}
        <Code>&lt;div&gt;</Code>，畫面看起來正常。
      </>
    ),
    cause: (
      <>
        <Code>&lt;output&gt;</Code> 只能包含行內內容，放區塊元素是不合法的
        HTML，螢幕閱讀器與 hydration 可能出現預期外的行為。
      </>
    ),
    fix: (
      <>
        改用 <Code>&lt;span&gt;</Code>，排版交給 <Code>&lt;output&gt;</Code>{" "}
        自己的 flex 或外層的 <Code>&lt;div&gt;</Code>。
      </>
    ),
  },
];

type RenderRow = {
  id: string;
  component: string;
  read: ReactNode;
  highlight: string;
  log: string;
};

const RENDER_COLUMNS: Column<RenderRow>[] = [
  { key: "component", label: "元件" },
  { key: "read", label: "讀取方式" },
  { key: "highlight", label: "Highlight updates" },
  { key: "log", label: "render log" },
];

const RENDER_ROWS: RenderRow[] = [
  {
    id: "station",
    component: "StationReadout",
    read: <Code>{"(s) => s.stationIndex"}</Code>,
    highlight: "只在跨站時閃",
    log: "只在跨站時印出",
  },
  {
    id: "progress",
    component: "ProgressReadout",
    read: <Code>getState() + rAF</Code>,
    highlight: "完全不閃",
    log: "只有一開始印一次",
  },
  {
    id: "wrong",
    component: "ProgressReadoutWrong",
    read: <Code>{"(s) => s.progress"}</Code>,
    highlight: "捲動時一直閃",
    log: "捲動時一直刷",
  },
];

const VERIFICATIONS: Verification[] = [
  {
    id: "strict-mode",
    body: (
      <>
        在 effect 開頭與 cleanup 各加一行 log，重新整理 /lab/02，console
        依序出現 created → destroyed → created：Strict Mode
        的掛載兩次，最後只剩一個 Lenis。
      </>
    ),
  },
  {
    id: "html-class",
    body: (
      <>
        Elements 面板中 <Code>&lt;html&gt;</Code> 有 <Code>lenis</Code> 開頭的
        class；點「← 回到練習場」後 class 消失，/lab 恢復原生捲動。
      </>
    ),
  },
  {
    id: "initial-progress",
    body: "捲到中間後重新整理，不捲動的情況下 ProgressReadout 與 StationReadout 就顯示目前位置的值。",
  },
  {
    id: "highlight-updates",
    body: (
      <>
        在 <Code>page.tsx</Code> 取消 ProgressReadoutWrong 的註解，React
        DevTools 開啟 Highlight updates
        後捲動頁面，三個元件的結果如上方「重新渲染比較」。
      </>
    ),
  },
];

export {
  CONCEPTS,
  PITFALLS,
  READ_COLUMNS,
  READ_ROWS,
  RENDER_COLUMNS,
  RENDER_ROWS,
  STEPS,
  VERIFICATIONS,
};
