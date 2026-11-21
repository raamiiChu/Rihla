import type { ReactNode } from "react";
import {
  Code,
  type Column,
  type Concept,
  type Pitfall,
  type Step,
  type Verification,
} from "@/app/lab/_components";
import type { Flow } from "../_components/FlowDiagram";

const STEPS: Step[] = [
  {
    id: "timeline",
    title: (
      <>
        設計 3 站的迷你 <Code>timeline</Code>，包含飛行段與停留段
      </>
    ),
    done: true,
  },
  {
    id: "station-index",
    title: (
      <>
        <Code>stationIndex</Code> 改成從 timeline 計算
      </>
    ),
    done: true,
  },
  {
    id: "dwell",
    title: "鏡頭在停留段減速或停住",
    done: true,
  },
  {
    id: "skip",
    title: "SKIP 按鈕：每按一次抵達一站，平滑捲動",
    done: true,
  },
  {
    id: "navigation",
    title: "跳到任一站的導覽，途中會經過其他站時改用 immediate",
    done: true,
  },
];

const BUILD_FLOWS: Flow[] = [
  {
    id: "ranges",
    title: "時間軸",
    steps: [
      { kind: "data", id: "weights", label: "每站的權重" },
      { kind: "fn", id: "build", label: <Code>buildStationRanges</Code> },
      { kind: "data", id: "ranges", label: "每站的邊界" },
    ],
  },
  {
    id: "lut",
    title: "軌道",
    steps: [
      { kind: "data", id: "points", label: "控制點" },
      { kind: "fn", id: "curve", label: <Code>new CatmullRomCurve3</Code> },
      { kind: "data", id: "curve-data", label: "曲線" },
      { kind: "fn", id: "lut-fn", label: <Code>buildRailLUT</Code> },
      { kind: "data", id: "lut", label: "LUT" },
    ],
  },
  {
    id: "rail-positions",
    title: "站點在軌道上的位置",
    steps: [
      { kind: "data", id: "curve", label: "曲線" },
      {
        kind: "fn",
        id: "positions-fn",
        label: <Code>getStationRailPositions</Code>,
        uses: "＋ 站點的控制點",
      },
      { kind: "data", id: "positions", label: "每站的 u" },
    ],
  },
];

const FRAME_FLOWS: Flow[] = [
  {
    id: "camera",
    title: "鏡頭（RailCamera 的 useFrame）",
    steps: [
      { kind: "data", id: "progress", label: "progress" },
      {
        kind: "fn",
        id: "rail-fn",
        label: <Code>getRailProgress</Code>,
        uses: "＋ 邊界、每站的 u",
      },
      { kind: "data", id: "u", label: "軌道 u" },
      {
        kind: "fn",
        id: "camera-fn",
        label: <Code>getCameraState</Code>,
        uses: "＋ LUT",
      },
      { kind: "data", id: "state", label: "位置與朝向" },
      { kind: "fn", id: "copy", label: <Code>copy</Code> },
      { kind: "data", id: "camera", label: "鏡頭" },
    ],
  },
  {
    id: "skip",
    title: "SKIP（點擊）",
    steps: [
      { kind: "data", id: "progress", label: "progress" },
      {
        kind: "fn",
        id: "skip-fn",
        label: <Code>getSkipDestination</Code>,
        uses: "＋ 邊界",
      },
      { kind: "data", id: "destination", label: "目的地" },
      { kind: "fn", id: "scroll-fn", label: <Code>scrollToProgress</Code> },
      { kind: "data", id: "lenis", label: "Lenis 平滑捲動" },
      { kind: "fn", id: "set-fn", label: <Code>setProgress</Code> },
      { kind: "data", id: "next-progress", label: "progress" },
    ],
  },
  {
    id: "navigation",
    title: "導覽選單（點擊）",
    steps: [
      { kind: "data", id: "nav-progress", label: "progress ＋ 目的地" },
      {
        kind: "fn",
        id: "count-fn",
        label: <Code>countDestinationsBetween</Code>,
        uses: "＋ 邊界",
      },
      { kind: "data", id: "immediate", label: "immediate" },
      {
        kind: "fn",
        id: "nav-scroll-fn",
        label: <Code>scrollToProgress</Code>,
      },
      { kind: "data", id: "nav-lenis", label: "Lenis 捲動或直接跳轉" },
    ],
  },
];

type RangeRow = {
  id: string;
  station: ReactNode;
  weights: string;
  flightStart: string;
  flightEnd: string;
  dwellEnd: string;
  rail: string;
};

const RANGE_COLUMNS: Column<RangeRow>[] = [
  { key: "station", label: "站點" },
  { key: "weights", label: "flight / dwell", numeric: true },
  { key: "flightStart", label: "flightStart", numeric: true },
  { key: "flightEnd", label: "flightEnd", numeric: true },
  { key: "dwellEnd", label: "dwellEnd", numeric: true },
  { key: "rail", label: "軌道位置 u", numeric: true },
];

const RANGE_ROWS: RangeRow[] = [
  {
    id: "tangier",
    station: <Code>tangier</Code>,
    weights: "0 / 10",
    flightStart: "0",
    flightEnd: "0",
    dwellEnd: "0.3030",
    rail: "0",
  },
  {
    id: "mecca",
    station: <Code>mecca</Code>,
    weights: "3 / 5",
    flightStart: "0.3030",
    flightEnd: "0.3939",
    dwellEnd: "0.5455",
    rail: "0.3802",
  },
  {
    id: "samarkand",
    station: <Code>samarkand</Code>,
    weights: "5 / 10",
    flightStart: "0.5455",
    flightEnd: "0.6970",
    dwellEnd: "1",
    rail: "1",
  },
];

type CoordinateRow = {
  id: string;
  name: string;
  meaning: string;
  values: ReactNode;
};

const COORDINATE_COLUMNS: Column<CoordinateRow>[] = [
  { key: "name", label: "座標" },
  { key: "meaning", label: "意思" },
  { key: "values", label: "這些值屬於它" },
];

const COORDINATE_ROWS: CoordinateRow[] = [
  {
    id: "progress",
    name: "progress",
    meaning: "捲動了多少",
    values: (
      <>
        <Code>progress</Code>、<Code>flightStart</Code>、<Code>flightEnd</Code>
        、<Code>dwellEnd</Code>
      </>
    ),
  },
  {
    id: "rail",
    name: "軌道 u",
    meaning: "鏡頭在軌道上走了多少（弧長比例）",
    values: (
      <>
        <Code>stationRailPositions</Code>、<Code>getRailProgress</Code> 的回傳值
      </>
    ),
  },
  {
    id: "ratio",
    name: "比例",
    meaning: "飛行段走了多少，沒有單位",
    values: (
      <>
        <Code>smoothstep</Code> 的回傳值，連接上面兩種座標
      </>
    ),
  },
];

type QueryRow = {
  id: string;
  fn: ReactNode;
  file: ReactNode;
  answer: string;
  when: string;
};

const QUERY_COLUMNS: Column<QueryRow>[] = [
  { key: "fn", label: "函式" },
  { key: "file", label: "檔案" },
  { key: "answer", label: "回答的問題" },
  { key: "when", label: "呼叫時機" },
];

const QUERY_ROWS: QueryRow[] = [
  {
    id: "ranges",
    fn: <Code>buildStationRanges</Code>,
    file: <Code>timeline/stations.ts</Code>,
    answer: "權重換算成 0–1 的邊界",
    when: "模組載入時一次",
  },
  {
    id: "index",
    fn: <Code>getStationIndex</Code>,
    file: <Code>timeline/stations.ts</Code>,
    answer: "progress 落在第幾站",
    when: "每次寫入 progress",
  },
  {
    id: "skip",
    fn: <Code>getSkipDestination</Code>,
    file: <Code>timeline/stations.ts</Code>,
    answer: "SKIP 落在哪裡，沒有下一站時為 null",
    when: "selector 與點擊",
  },
  {
    id: "count",
    fn: <Code>countDestinationsBetween</Code>,
    file: <Code>timeline/stations.ts</Code>,
    answer: "跳轉途中整段經過幾個停留段",
    when: "點擊",
  },
  {
    id: "rail-positions",
    fn: <Code>getStationRailPositions</Code>,
    file: <Code>camera/pacing.ts</Code>,
    answer: "每站在軌道上的 u",
    when: "建立軌道時一次",
  },
  {
    id: "rail-progress",
    fn: <Code>getRailProgress</Code>,
    file: <Code>camera/pacing.ts</Code>,
    answer: "progress 換成軌道 u",
    when: "每幀",
  },
];

const CONCEPTS: Concept[] = [
  {
    title: "寫權重，不寫邊界",
    body: (
      <>
        資料只寫每站的相對權重 <Code>{"{ id, flight, dwell }"}</Code>
        ，邊界由前綴和除以總和算出。改一站的長度，後面的邊界自動跟著移動；直接寫邊界的話，要手動調整後面所有的值，容易出現重疊或空隙。換算結果是衍生資料，和鏡頭的查找表一樣只是快取，不違反單一資料來源。
      </>
    ),
  },
  {
    title: "as const satisfies",
    body: (
      <>
        <Code>as const</Code> 讓字面值變成深層 readonly、字串保留字面型別；
        <Code>satisfies</Code>{" "}
        檢查形狀，但不把型別放寬。兩者一起用，才能從資料反推{" "}
        <Code>StationId</Code>（
        <Code>{'(typeof STATION_WEIGHTS)[number]["id"]'}</Code>
        ）。單站型別的 <Code>id</Code> 要寫 <Code>string</Code>
        ，寫成反推出的 union 會形成循環參考。
      </>
    ),
  },
  {
    title: "左閉右開的區間",
    body: (
      <>
        每站的區間是 <Code>[flightStart, dwellEnd)</Code>
        ，剛好落在邊界時算下一站，每個點只屬於一站。長度為 0
        的站是空集合，自然不會被選中；只有最後一站要包含 1。ranges
        依序排列又首尾相接，所以掃描時只比較 <Code>dwellEnd</Code> 就夠了。
      </>
    ),
  },
  {
    title: "控制點的 t 換成弧長 u",
    body: (
      <>
        第 i 個控制點在 <Code>t = i / (n − 1)</Code>，但鏡頭吃的是弧長比例 u。
        <Code>getLengths()</Code> 是 t 等分的累計弧長表，
        <Code>getUtoTmapping</Code> 用它把 u 換成
        t；反過來查同一張表，就是精確的反函式。取樣數必須用預設值，換成別的取樣數，算出的
        u 會稍微偏離控制點。
      </>
    ),
  },
  {
    title: "停留段完全停住，飛行段用 smoothstep",
    body: (
      <>
        smoothstep 兩端的速度是 0，停留段的速度也是
        0，兩者剛好接上，不會有速度跳變。停留時畫面仍由形變與文字驅動，不會像卡住。改成停留時慢慢前進的話，速度不再是
        0，就要換一種 easing。
      </>
    ),
  },
  {
    title: "用 id 查詢，順序只由 timeline 決定",
    body: (
      <>
        站點的控制點寫成 <Code>{"Record<DemoStationId, number>"}</Code>
        ，再依 timeline 的順序以 id 查出索引。timeline
        多一站卻忘了補，會直接編譯失敗；key 寫成什麼順序都不影響結果。
      </>
    ),
  },
  {
    title: "selector 回傳低頻的衍生值",
    body: (
      <>
        SkipButton 以 selector 從 progress 算出 SKIP 目的地。selector
        每次寫入都會執行，但回傳值只在跨站時改變，zustand 以{" "}
        <Code>Object.is</Code> 比較，所以一整段捲動只 re-render
        幾次。規則禁止的是「每幀 re-render」，和 store 的{" "}
        <Code>stationIndex</Code> 是同一套機制。
      </>
    ),
  },
  {
    title: "useScrollStore.subscribe 取代 rAF 輪詢",
    body: (
      <>
        PacingReadout 在 <Code>subscribe</Code> 的 listener 裡直接寫{" "}
        <Code>textContent</Code>，只在 store
        被寫入時執行，停止捲動就不再執行，元件也不會 re-render。
        <Code>subscribe</Code> 不會立即執行一次，掛載時要先用{" "}
        <Code>getState()</Code> 寫入初始值。
      </>
    ),
  },
  {
    title: "immediate 依「整段經過的停留段」判斷",
    body: (
      <>
        用 index 算距離會漏掉「飛往 b 途中跳到 c」：此時 index 已經是
        b，距離只有 1，但途中會完整經過 b 的停留段。改成數「整段停留段落在 from
        與 to
        之間」的站：只經過一部分代表離開出發站或抵達目的地，不算。只依兩端的較小值與較大值比較，往前往回自然對稱。
      </>
    ),
  },
  {
    title: "lab 05 有自己的時間軸",
    body: (
      <>
        <Code>_utils/timeline.ts</Code> 的 <Code>DEMO_STATION_WEIGHTS</Code>{" "}
        與正式的 <Code>src/data/timeline.ts</Code>{" "}
        分開：函式共用、數字分開，正式時間軸改動時示範頁不受影響。加上{" "}
        <Code>DEMO_</Code> 前綴，避免 auto-import 選到正式資料。也因此 lab 05
        不能讀 store 的 <Code>stationIndex</Code>，要自己用{" "}
        <Code>DEMO_STATION_RANGES</Code> 計算。
      </>
    ),
  },
];

const PITFALLS: Pitfall[] = [
  {
    title: "getPoints() 不是控制點",
    symptom: "換一條控制點數量不同的曲線，站點位置就錯了。",
    cause: (
      <>
        <Code>getPoints(divisions)</Code> 是沿曲線取樣，預設永遠回傳 6
        個點；unit 04 的軌道剛好有 6 個控制點，所以看不出來。
      </>
    ),
    fix: (
      <>
        控制點在 <Code>curve.points</Code>。
      </>
    ),
  },
  {
    title: "SKIP 在飛行段跳過正在前往的站",
    symptom: "飛往麥加的途中按 SKIP，直接跳到撒馬爾罕。",
    cause: (
      <>
        飛行段時 <Code>stationIndex</Code> 已經是目的地，再 <Code>+ 1</Code>{" "}
        就多跳一站。
      </>
    ),
    fix: (
      <>
        改成搜尋「第一個 <Code>flightEnd</Code> 在前方、且有停留段的站」。四個{" "}
        <Code>if</Code> 換成一個 <Code>find</Code>（Substitute
        Algorithm），沒有停留段的站也會自動跳過。
      </>
    ),
  },
  {
    title: "按鈕的停用狀態只在點擊時更新",
    symptom: "用 SKIP 抵達最後一站後，捲回開頭按鈕仍然停用。",
    cause: "停用狀態存在 useState，只有點擊時才更新，不跟著捲動位置變化。",
    fix: "改用 selector 從 progress 算出目的地，跟著捲動位置更新。",
  },
  {
    title: "站點標記放在控制點上",
    symptom: "停留時看不到標記，標籤疊在畫面正中央。",
    cause: "停留時鏡頭就在控制點上，球包住鏡頭，從內部看不到正面。",
    fix: (
      <>
        用 <Code>getCameraState</Code> 取得停留時的位置與朝向，沿 forward（
        <Code>(0, 0, -1)</Code> 套用 quaternion）往前推一段距離再放置。
      </>
    ),
  },
  {
    title: "3D 標籤蓋過 UI",
    symptom: "站點與控制點的標籤疊在導覽選單上面。",
    cause: (
      <>
        drei 的 <Code>{"<Html>"}</Code> 是真的 DOM，預設{" "}
        <Code>zIndexRange</Code> 為 <Code>[16777271, 0]</Code>
        ，比任何 overlay 都高。
      </>
    ),
    fix: (
      <>
        把 <Code>zIndexRange</Code> 限制在 <Code>[10, 0]</Code>
        ，overlay 設 <Code>z-20</Code>。正式版的文字層用到{" "}
        <Code>{"<Html>"}</Code> 時同樣要處理。
      </>
    ),
  },
];

const VERIFICATIONS: Verification[] = [
  {
    id: "single-source",
    body: (
      <>
        修改 timeline 的一個數字，鏡頭、<Code>stationIndex</Code>、SKIP
        目標都跟著改變，沒有其他地方需要同步修改。
      </>
    ),
  },
  {
    id: "dwell",
    body: "停留段時，PacingReadout 的階段顯示「停留」，軌道位置 u 固定不變；飛行段頭尾的 u 變化慢、中間快。",
  },
  {
    id: "marker",
    body: "停留時，站點的圓環在畫面正中央，是一個正圓，整段停留都不移動。",
  },
  {
    id: "skip",
    body: "停留段按 SKIP 會飛到下一站並停住；飛行段按 SKIP 會抵達正在前往的那一站，不會跳過它。",
  },
  {
    id: "skip-disabled",
    body: "抵達最後一站時 SKIP 變成停用，手動捲回前面又恢復可用。",
  },
  {
    id: "navigation",
    body: "停在 tangier 點 mecca 會平滑飛過去；點 samarkand、或飛往 mecca 途中點 samarkand，會直接跳過去；從 samarkand 點 mecca 會平滑往回飛。目前站點以金色文字標示。",
  },
  {
    id: "tests",
    body: (
      <>
        <Code>pnpm test</Code> 全部通過，包含 <Code>stations.test.ts</Code> 與{" "}
        <Code>pacing.test.ts</Code>。
      </>
    ),
  },
];

export {
  BUILD_FLOWS,
  CONCEPTS,
  COORDINATE_COLUMNS,
  COORDINATE_ROWS,
  FRAME_FLOWS,
  PITFALLS,
  QUERY_COLUMNS,
  QUERY_ROWS,
  RANGE_COLUMNS,
  RANGE_ROWS,
  STEPS,
  VERIFICATIONS,
};
