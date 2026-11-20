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
    id: "curve",
    title: (
      <>
        建立 8 個控制點的 <Code>CatmullRomCurve3</Code>，並用細線畫出來
      </>
    ),
    done: true,
  },
  {
    id: "control-points",
    title: "在控制點放小球，確認線穿過每一個控制點",
    done: true,
  },
  {
    id: "lut",
    title: (
      <>
        <Code>buildRailLUT</Code>：依弧長取樣，存成 <Code>Float32Array</Code>
      </>
    ),
    done: true,
  },
  {
    id: "camera-state",
    title: (
      <>
        <Code>getCameraState</Code>：插值後在 <Code>useFrame</Code> 套用到鏡頭
      </>
    ),
    done: true,
  },
  {
    id: "parallel-transport",
    title: "加入垂直段觀察翻轉，再用 parallel transport 修正",
    done: true,
  },
  {
    id: "levelling",
    title: "水平路段把 up 逐步拉回世界 up（levelling），迴圈頂點維持頭朝下",
    done: true,
  },
  {
    id: "tests",
    title: (
      <>
        必做測試：<Code>getCameraState</Code> 的起點、終點與 up 連續性
      </>
    ),
    done: true,
  },
];

type SegmentRow = {
  id: string;
  segment: string;
  length: string;
};

const SEGMENT_COLUMNS: Column<SegmentRow>[] = [
  { key: "segment", label: "段" },
  { key: "length", label: "控制點距離", numeric: true },
];

const SEGMENT_ROWS: SegmentRow[] = [
  { id: "0-1", segment: "0 → 1", length: "6.2" },
  { id: "1-2", segment: "1 → 2", length: "11.5" },
  { id: "2-3", segment: "2 → 3", length: "13.2" },
  { id: "3-4", segment: "3 → 4", length: "4.9" },
  { id: "4-5", segment: "4 → 5", length: "13.5" },
  { id: "5-6", segment: "5 → 6", length: "3.3" },
  { id: "6-7", segment: "6 → 7", length: "15.4" },
];

type LineRow = {
  id: string;
  approach: ReactNode;
  underlying: ReactNode;
  width: string;
  disposal: string;
  usedFor: string;
};

const LINE_COLUMNS: Column<LineRow>[] = [
  { key: "approach", label: "寫法" },
  { key: "underlying", label: "底層類別" },
  { key: "width", label: "線寬" },
  { key: "disposal", label: "釋放資源" },
  { key: "usedFor", label: "本專案用在" },
];

const LINE_ROWS: LineRow[] = [
  {
    id: "three-line",
    approach: <Code>&lt;threeLine&gt;</Code>,
    underlying: <Code>THREE.Line</Code>,
    width: "固定 1px",
    disposal: "R3F 自動",
    usedFor: "除錯線（本單元）",
  },
  {
    id: "drei-line",
    approach: (
      <>
        drei <Code>&lt;Line&gt;</Code>
      </>
    ),
    underlying: (
      <>
        <Code>Line2</Code>（three-stdlib）
      </>
    ),
    width: "可調",
    disposal: "drei 自動",
    usedFor: "不使用",
  },
  {
    id: "line2",
    approach: (
      <>
        自建 <Code>Line2</Code> + <Code>&lt;primitive&gt;</Code>
      </>
    ),
    underlying: (
      <>
        <Code>Line2</Code>（three）
      </>
    ),
    width: "可調",
    disposal: "自己負責",
    usedFor: "旅程線（單元 09 起）",
  },
];

type RotationRow = {
  id: string;
  representation: ReactNode;
  size: number;
  tradeoff: ReactNode;
  usedFor: ReactNode;
};

const ROTATION_COLUMNS: Column<RotationRow>[] = [
  { key: "representation", label: "表示法" },
  { key: "size", label: "數量", numeric: true },
  { key: "tradeoff", label: "優缺點" },
  { key: "usedFor", label: "本單元用在" },
];

const Tradeoff = ({ pro, con }: { pro: string; con: string }) => (
  <>
    <span className="block">優：{pro}</span>
    <span className="block">缺：{con}</span>
  </>
);

const ROTATION_ROWS: RotationRow[] = [
  {
    id: "euler",
    representation: (
      <>
        Euler 角（<Code>rotation</Code>）
      </>
    ),
    size: 3,
    tradeoff: (
      <Tradeoff pro="直觀，適合手動擺放" con="萬向節死鎖，插值路徑不自然" />
    ),
    usedFor: "不使用",
  },
  {
    id: "matrix",
    representation: (
      <>
        旋轉矩陣（<Code>Matrix4</Code> 的 3×3 部分）
      </>
    ),
    size: 9,
    tradeoff: <Tradeoff pro="三欄就是三根座標軸" con="數字多，不方便插值" />,
    usedFor: (
      <>
        <Code>lookAt</Code> 的中間產物
      </>
    ),
  },
  {
    id: "quaternion",
    representation: (
      <>
        Quaternion（<Code>quaternion</Code>）
      </>
    ),
    size: 4,
    tradeoff: <Tradeoff pro="沒有死鎖，可用 slerp 插值" con="數字看不出朝向" />,
    usedFor: (
      <>
        <Code>CameraState</Code> 儲存朝向、<Code>copy</Code> 進鏡頭
      </>
    ),
  },
];

type LayoutRow = {
  id: string;
  field: string;
  offset: number;
  size: number;
  purpose: string;
};

const LAYOUT_COLUMNS: Column<LayoutRow>[] = [
  { key: "field", label: "欄位" },
  { key: "offset", label: "偏移", numeric: true },
  { key: "size", label: "float 數", numeric: true },
  { key: "purpose", label: "用途" },
];

const LAYOUT_ROWS: LayoutRow[] = [
  {
    id: "position",
    field: "position",
    offset: 0,
    size: 3,
    purpose: "鏡頭位置",
  },
  {
    id: "tangent",
    field: "tangent",
    offset: 3,
    size: 3,
    purpose: "前進方向（單位向量）",
  },
  {
    id: "up",
    field: "up",
    offset: 6,
    size: 3,
    purpose: "鏡頭的上方，與 tangent 垂直",
  },
];

type GateRow = {
  id: string;
  factor: string;
  question: string;
  formula: ReactNode;
  full: string;
  none: string;
};

const GATE_COLUMNS: Column<GateRow>[] = [
  { key: "factor", label: "比例" },
  { key: "question", label: "回答的問題" },
  { key: "formula", label: "算式" },
  { key: "full", label: "全力回正" },
  { key: "none", label: "不回正" },
];

const GATE_ROWS: GateRow[] = [
  {
    id: "distance",
    factor: "距離",
    question: "這一步走了多遠？",
    formula: <Code>1 − e^(−rate × 步長)</Code>,
    full: "—",
    none: "rate 為 0",
  },
  {
    id: "vertical",
    factor: "垂直門檻",
    question: "軌道有多陡？",
    formula: <Code>1 − smoothstep(|tangent · WORLD_UP|, 0.5, 0.8)</Code>,
    full: "坡度 30° 以下",
    none: "坡度 53° 以上",
  },
  {
    id: "upright",
    factor: "正立門檻",
    question: "鏡頭有多正立？",
    formula: <Code>smoothstep(up · target, 0, 0.5)</Code>,
    full: "傾斜 60° 以下",
    none: "傾斜 90° 以上",
  },
];

type LevellingResultRow = {
  id: string;
  version: string;
  exitTilt: string;
  sampleDifference: string;
  top: string;
};

const LEVELLING_RESULT_COLUMNS: Column<LevellingResultRow>[] = [
  { key: "version", label: "版本（rate 0.1）" },
  { key: "exitTilt", label: "出口傾斜", numeric: true },
  { key: "sampleDifference", label: "1024 vs 256", numeric: true },
  { key: "top", label: "迴圈頂點" },
];

const LEVELLING_RESULT_ROWS: LevellingResultRow[] = [
  {
    id: "none",
    version: "不回正（純 parallel transport）",
    exitTilt: "41.1°",
    sampleDifference: "0.014°",
    top: "頭朝下",
  },
  {
    id: "vertical-only",
    version: "只有垂直門檻",
    exitTilt: "16.5°",
    sampleDifference: "153°",
    top: "頭朝下，出迴圈後又翻成頭朝下",
  },
  {
    id: "both",
    version: "垂直門檻 + 正立門檻",
    exitTilt: "0.27°",
    sampleDifference: "0.008°",
    top: "頭朝下",
  },
];

const LEVELLING: Concept[] = [
  {
    title: "為什麼需要回正：holonomy",
    body: (
      <>
        沿著不在同一個平面上的路徑傳遞方向，回到水平時會殘留一個旋轉。
        <Code>LOOP_CURVE</Code> 的 x 有偏移、在空間中扭轉，純 parallel transport
        出迴圈後地平線歪了約 41°；完全在一個平面上的迴圈殘留為 0。
      </>
    ),
  },
  {
    title: "做法：每一步往最正立的方向靠近一點",
    body: (
      <>
        傳遞與 Gram–Schmidt 之後，算出 target（<Code>WORLD_UP</Code> 對 tangent
        做 <Code>makePerpendicular</Code>，與 tangent 垂直又最朝上的方向），
        <Code>up.lerp(target, weight).normalize()</Code>。weight
        是距離、垂直門檻、正立門檻三個比例相乘，任何一個為 0 就不回正。up 與
        target 都和 tangent 垂直，lerp
        的結果仍在同一個垂直平面上，不需要再投影。
        <Code>getCameraState</Code> 完全不用改：朝向在建表時就決定好了。
      </>
    ),
  },
  {
    title: "速率依弧長計算：指數衰減",
    body: (
      <>
        每一步的比例是 <Code>1 − Math.exp(−rate × stepLength)</Code>
        ，前進距離 d 後剩下的傾斜是 <Code>e^(−rate × d)</Code>
        。指數讓兩個半步的效果完全等於一個整步，所以結果與取樣數無關；寫成「每個取樣點回正
        1%」時，1024 與 256 個取樣點的出口差了 16.6°。rate 0.1 約每前進 10
        單位傾斜剩 37%。LUT 依弧長等分，步長在迴圈外算一次：
        <Code>curve.getLength() / (samples - 1)</Code>。
      </>
    ),
  },
  {
    title: "smoothstep 讓回正漸強漸弱",
    body: (
      <>
        <Code>MathUtils.smoothstep(x, min, max)</Code> 在 x ≤ min 時為 0、x ≥
        max 時為 1，中間是兩端斜率為 0 的 S 形曲線。用 <Code>if</Code>{" "}
        切開的話，回正會突然開始或停止，roll
        的速度出現折角。垂直門檻要「越陡越不回正」，所以取{" "}
        <Code>1 − smoothstep</Code>。
      </>
    ),
  },
  {
    title: "為什麼需要正立門檻",
    body: (
      <>
        迴圈頂點的 tangent 是水平的，垂直門檻全部放行，但鏡頭頭朝下，up 與
        target 幾乎相反。兩個相反的向量 lerp 會經過接近零的向量，normalise
        後方向不穩定，等於在迴圈中段再翻一次（上表「只有垂直門檻」）。正立門檻要求{" "}
        <Code>up · target</Code> 夠大才回正。代價是傾斜超過 90°
        的鏡頭永遠不會被回正，正式軌道沒有迴圈，可以接受。
      </>
    ),
  },
  {
    title: "三個 dot 各自回答一個問題",
    body: (
      <>
        <Code>tangent · WORLD_UP</Code> 是軌道有多陡（垂直門檻），
        <Code>up · target</Code> 是鏡頭有多正立（正立門檻），
        <Code>up · tangent</Code> 是 up 偏離垂直平面多少（
        <Code>makePerpendicular</Code> 內部，做完後永遠是 0）。
      </>
    ),
  },
  {
    title: "測試：把傳遞與回正分開",
    body: (
      <>
        回正刻意讓 up 繞著 tangent 多轉，「up 轉的角度不超過
        forward」只對純傳遞成立。
        <Code>buildRailLUT</Code> 加上 <Code>&#123; levellingRate &#125;</Code>{" "}
        選項（Introduce Parameter），該測試傳 <Code>levellingRate: 0</Code>
        。另外三個測試：出口傾斜小於 2°、1024 與 256 個取樣點相差小於
        1°、迴圈頂點 <Code>up.y</Code> 小於
        -0.9。後兩個在不回正時就會通過，是守門的測試：上表兩種錯誤的實作都會讓它們失敗。
      </>
    ),
  },
  {
    title: "computeFrenetFrames 無法回正",
    body: (
      <>
        three 的 <Code>computeFrenetFrames</Code> 實作是 parallel
        transport，但初始 normal 依 tangent 分量絕對值最小的軸選取，算法是{" "}
        <Code>tangent × (tangent × 軸)</Code>
        ，可能朝下，要自己對齊<Code>WORLD_UP</Code>{" "}
        。它一次算完整組回傳，回正必須在每一步之間介入，所以只能用自己的迴圈。
        <Code>closed</Code> 的分攤扭轉是讓封閉曲線頭尾接上，和回正不同。
      </>
    ),
  },
];

const MATH: Concept[] = [
  {
    title: "點與方向",
    body: (
      <>
        兩者在 three 裡都是 <Code>Vector3</Code>
        ，型別檢查分不出來。點是空間中的位置（position、target），方向只代表朝向，通常是長度
        1 的單位向量（tangent、up）。點 + 方向 × 距離 = 另一個點，例如{" "}
        <Code>target = position + tangent</Code>；點 − 點 = 方向，例如{" "}
        <Code>eye - target</Code>。點不需要 normalise，方向通常需要。
      </>
    ),
  },
  {
    title: "內積 dot：兩個方向有多一致",
    body: (
      <>
        <Code>a · b = ax·bx + ay·by + az·bz = |a| |b| cos θ</Code>
        。兩者都是單位向量時，結果就是夾角的 cos：方向相同為 1、垂直為 0、相反為
        -1。本單元用它判斷 up 是否與 tangent 垂直（≈
        0），也用它的符號判斷兩個方向是同側還是反側。
      </>
    ),
  },
  {
    title: "外積 cross：同時垂直於兩者的方向",
    body: (
      <>
        <Code>a × b</Code> 垂直於 <Code>a</Code> 與 <Code>b</Code>
        ，方向依右手定則，長度是 <Code>|a| |b| sin θ</Code>
        。順序有差：<Code>b × a = −(a × b)</Code>。兩者平行時 sin θ = 0
        ，結果是零向量，得不到方向，這正是固定 up 在垂直段失效的原因。
      </>
    ),
  },
  {
    title: "投影：一個向量在另一個方向上的影子",
    body: (
      <>
        <Code>d</Code> 是單位向量時，<Code>v · d</Code> 就是 <Code>v</Code> 投在{" "}
        <Code>d</Code> 方向上的影子長度，<Code>d × (v · d)</Code>{" "}
        是影子向量。這也是方向必須先 normalise 的原因之一：<Code>d</Code>{" "}
        長度不是 1 時，dot 就不再等於影子長度。
      </>
    ),
  },
  {
    title: "Gram–Schmidt：扣掉影子，留下垂直的部分",
    body: (
      <>
        up 減掉它在 tangent 上的影子，剩下的就和 tangent 垂直，再 normalise
        回長度 1。公式是 <Code>up − tangent × (up · tangent)</Code>
        ，剩下的長度是 <Code>|up| sin θ</Code>。實作為{" "}
        <Code>makePerpendicular</Code>：先算 <Code>up · tangent</Code>
        ，再 <Code>addScaledVector(tangent, -length)</Code> 與{" "}
        <Code>normalize()</Code>，影子長度必須在修改 up 之前算好。例如 tangent
        往右上 45°、up 朝正上方，結果是往左上 45°：垂直，而且仍然大致朝上。up 與
        tangent 平行時什麼都不剩，無法 normalise。
      </>
    ),
  },
  {
    title: "lookAt 怎麼組出三根軸",
    body: (
      <>
        z = normalise(<Code>eye − target</Code>)，x = normalise(
        <Code>up × z</Code>)，y = <Code>z × x</Code>
        。三根軸就是旋轉矩陣的三欄，描述「物件自己的 x、y、z
        在世界中指向哪裡」。up 只是參考，不必和 z 垂直，最後由{" "}
        <Code>z × x</Code> 重新算出真正的 y。
      </>
    ),
  },
  {
    title: "最小旋轉：setFromUnitVectors",
    body: (
      <>
        把方向 a 轉到方向 b 的旋轉有無限多種：任何一種轉完後再繞 b 多轉幾度，b
        都不變，多出的那圈就是鏡頭的 roll。
        <Code>Quaternion.setFromUnitVectors(a, b)</Code>{" "}
        求的是轉動角度最小的那一個：軸是 <Code>a × b</Code>
        ，角度是兩者的夾角，完全不含繞 b
        的轉動。兩個參數都必須是單位向量，順序是「從 a 轉到 b」。parallel
        transport 每一步把這個旋轉套用到 up，up 就只跟著 tangent 轉，不會自己
        roll。
      </>
    ),
  },
  {
    title: "用角度比較判斷有沒有多轉",
    body: (
      <>
        <Code>a.angleTo(b)</Code> 回傳兩個方向的夾角（弧度）。最小旋轉讓 up
        轉的角度不超過 tangent 轉的角度，所以測試逐步比較鏡頭 up 與 forward
        的轉角：up 多轉的部分就是 roll。固定 up 在迴圈上最多多轉約
        0.19，parallel transport 約 1e-7。
      </>
    ),
  },
];

const CONCEPTS: Concept[] = [
  {
    title: "Catmull-Rom 穿過每一個控制點",
    body: (
      <>
        與 Bézier 不同，Catmull-Rom
        曲線會實際經過每個控制點，所以放下的點鏡頭都會經過。
        <Code>curveType</Code> 預設為 <Code>centripetal</Code>
        ：依控制點距離的平方根分配參數，距離不平均時也不會出現尖角或打結；
        <Code>catmullrom</Code>（uniform）容易出現尖角，<Code>chordal</Code>{" "}
        的轉彎較寬。
      </>
    ),
  },
  {
    title: "<threeLine> 與 SVG 的 <line>",
    body: (
      <>
        TSX 的 <Code>&lt;line&gt;</Code> 是 SVG 元素。R3F 在型別上把{" "}
        <Code>line</Code>、<Code>path</Code>、<Code>audio</Code>、
        <Code>source</Code> 讓給 HTML/SVG，改提供 <Code>threeLine</Code>{" "}
        等加上前綴的名稱；執行時去掉 <Code>three</Code> 前綴，仍建立{" "}
        <Code>THREE.Line</Code>。只放子元素時 <Code>&lt;line&gt;</Code>{" "}
        也能通過型別檢查，但一加上 <Code>position</Code>、
        <Code>frustumCulled</Code> 等 three 專屬的 prop 就會報錯。R3F 9.8.2
        只在建立時去掉前綴，更新時沒有，所以要以{" "}
        <Code>extend(&#123; ThreeLine: Line &#125;)</Code> 登記這個名稱。
      </>
    ),
  },
  {
    title: "BufferAttribute 與 Float32Array",
    body: (
      <>
        GPU 只接受連續、只有原始數字的記憶體，所以 <Code>Vector3[]</Code>{" "}
        要攤平成 <Code>[x0, y0, z0, x1, …]</Code> 的 <Code>Float32Array</Code>
        ，再由 <Code>BufferAttribute</Code> 的 <Code>itemSize</Code>（3） 告訴
        GPU 每幾個數字是一個頂點。WebGL 的頂點屬性是 32 位元浮點數，不支援 JS 的
        64 位元 <Code>number</Code>。
        <Code>attach=&quot;attributes-position&quot;</Code> 等同於{" "}
        <Code>geometry.setAttribute(&quot;position&quot;, attr)</Code>
        ，名稱要對應 shader 裡的 <Code>attribute vec3 position</Code>。
      </>
    ),
  },
  {
    title: "args 改變就重建物件",
    body: (
      <>
        R3F 以參考比較 <Code>args</Code>
        ，參考一變就重新建立整個物件並重新上傳到
        GPU。資料只依賴常數時，可以算在模組最上層；依賴 props 或 state 時，用{" "}
        <Code>useMemo</Code> 並把它們放進依賴陣列。
      </>
    ),
  },
  {
    title: "R3F 只釋放自己建立的物件",
    body: (
      <>
        元件卸載時，R3F 會釋放以 JSX 建立的物件（例如{" "}
        <Code>&lt;bufferGeometry&gt;</Code>）。透過 prop 傳入的物件，以及{" "}
        <Code>&lt;primitive&gt;</Code> 掛上的物件，R3F 視為外部管理，要自己在{" "}
        <Code>useEffect</Code> 的 cleanup 裡 <Code>dispose()</Code>。
      </>
    ),
  },
  {
    title: "除錯標記用 meshBasicMaterial",
    body: (
      <>
        這個場景沒有燈光。<Code>meshStandardMaterial</Code>{" "}
        需要燈光才看得到，沒有燈光時是全黑；<Code>meshBasicMaterial</Code>{" "}
        不受光照影響，直接顯示設定的顏色，從任何角度看都一樣清楚。
        <Code>lineBasicMaterial</Code>{" "}
        也不受光照影響，所以只畫線時不會察覺場景沒有燈光。
      </>
    ),
  },
  {
    title: "控制點從 curve.points 讀取",
    body: (
      <>
        <Code>CatmullRomCurve3</Code> 把建構時傳入的控制點存在{" "}
        <Code>points</Code> 屬性。小球直接讀它，控制點只寫在{" "}
        <Code>curve.ts</Code> 一處，改曲線時小球自動跟著變。
        <Code>position</Code> 傳入 <Code>Vector3</Code> 時 R3F 會{" "}
        <Code>copy</Code> 數值，不會與曲線共用同一個物件。
      </>
    ),
  },
  {
    title: "drei <Html> 標註 3D 物件",
    body: (
      <>
        <Code>&lt;Html&gt;</Code> 把一般的 HTML 元素疊在 3D
        物件的位置上，跟著鏡頭移動並永遠面向螢幕；放在 <Code>&lt;mesh&gt;</Code>{" "}
        裡就出現在那個 mesh 的位置。
        <Code>center</Code>{" "}
        讓元素以該點為中心。它預設會接收滑鼠事件，從標籤上開始拖曳時
        OrbitControls 收不到，需要時可設定{" "}
        <Code>pointerEvents=&quot;none&quot;</Code>。
      </>
    ),
  },
  {
    title: "getPoint(t) 與 getPointAt(u)",
    body: (
      <>
        <Code>CatmullRomCurve3</Code> 由多段曲線接成。<Code>getPoint(t)</Code>{" "}
        的 <Code>t</Code>{" "}
        是參數，每一段分到相同的範圍，不管那段實際多長，所以控制點距離不平均時速度忽快忽慢。
        <Code>getPointAt(u)</Code> 的 <Code>u</Code> 是弧長比例，
        <Code>u = 0.5</Code> 就是全長的正中間，速度均勻。<Code>u</Code>{" "}
        不是單字縮寫，而是數學上習慣用來命名參數的字母（<Code>s</Code>、
        <Code>t</Code>、<Code>u</Code>、<Code>v</Code>），three 用{" "}
        <Code>t</Code> 表示主參數、<Code>u</Code>{" "}
        表示弧長比例，兩者的換算函式就叫 <Code>getUtoTmapping(u)</Code>。
      </>
    ),
  },
  {
    title: "為什麼要查找表",
    body: (
      <>
        <Code>getPointAt</Code> 每次都要把 <Code>u</Code> 換算成 <Code>t</Code>
        （在弧長表中二分搜尋），還會 <Code>new</Code> 一個 <Code>Vector3</Code>
        回傳。查找表在初始化時一次算好，每幀只找出 progress
        落在哪兩個取樣點之間再線性插值，不搜尋也不配置記憶體。
      </>
    ),
  },
  {
    title: "STRIDE 與 OFFSET",
    body: (
      <>
        <Code>Float32Array</Code>{" "}
        只是一整排數字，沒有「列」的概念，所以每個取樣點的三個向量頭尾相接。
        <Code>STRIDE</Code> 是「一個取樣點佔幾格」（9），與取樣點數量無關；
        <Code>OFFSET</Code>{" "}
        是「欄位在取樣點裡從第幾格開始」（0、3、6）。任何欄位的位置都是{" "}
        <Code>i * STRIDE + OFFSET.欄位</Code>
        ，讀寫一律透過這兩個常數，不在各處手寫 <Code>+1</Code>、<Code>+3</Code>
        。
      </>
    ),
  },
  {
    title: "toArray 與 fromArray 直接讀寫",
    body: (
      <>
        <Code>vector.toArray(array, offset)</Code> 把 x、y、z
        直接寫進指定陣列的指定位置，<Code>vector.fromArray(array, offset)</Code>{" "}
        則反過來讀出。不傳參數的 <Code>toArray()</Code> 會 <Code>new</Code>{" "}
        一個中間陣列，再用 <Code>data.set()</Code> 複製，多了一次配置。
      </>
    ),
  },
  {
    title: "u 的分母是 samples - 1",
    body: (
      <>
        N 個取樣點要涵蓋 0 到 1 的兩端，而 N 個點之間只有 N - 1 個間隔，所以{" "}
        <Code>u = i / (samples - 1)</Code>。<Code>samples</Code> 為 1 時分母是
        0，整個查找表都會是 <Code>NaN</Code>
        ，畫面上只看得到鏡頭消失，因此在入口就拋錯。
      </>
    ),
  },
  {
    title: "arcLengthDivisions 決定 getPointAt 的精度",
    body: (
      <>
        <Code>getPointAt</Code> 靠一張弧長表把 <Code>u</Code> 換成{" "}
        <Code>t</Code>：曲線被切成 <Code>arcLengthDivisions</Code> 段（預設
        200），段與段之間線性插值，所以一段之內的等分只是近似。
        <Code>curve.ts</Code> 的曲線都經由 <Code>createRailCurve(points)</Code>{" "}
        建立，在裡面設為 1000（<Code>WAVE_CURVE</Code> 全長約 68、
        <Code>LOOP_CURVE</Code> 約
        173）。精度跟著「建立」走，每條曲線都有設定，不會因為哪一條正在畫面上而不同。也不設在{" "}
        <Code>buildRailLUT</Code> 裡：純函式不該修改傳進來的曲線。
      </>
    ),
  },
  {
    title: "執行中切換曲線：預先算好，以 key 重新掛載",
    body: (
      <>
        原本各元件在模組層級從同一個常數算出 LUT
        與除錯資料，只在載入時算一次，執行中改不了。改成{" "}
        <Code>_utils/rails.ts</Code> 的 <Code>RAILS</Code>
        ：每條曲線在模組層級一次算好 curve、LUT、除錯用 LUT
        與中心點，切換時不做任何計算。Scene 以 <Code>useState</Code>{" "}
        存曲線名稱，把對應的資料用 props 傳下去。依賴曲線的幾何包在{" "}
        <Code>&lt;group key=&#123;railName&#125;&gt;</Code> 裡：key 一變，React
        卸載舊的子樹，R3F 釋放舊的 geometry，再掛載新的，不必處理既有 buffer
        的更新。
        <Code>RailCamera</Code> 不重新掛載，<Code>useFrame</Code> 每幀讀最新的{" "}
        <Code>lut</Code> prop，下一幀就換到新軌道。
      </>
    ),
  },
  {
    title: "取樣點不是控制點",
    body: (
      <>
        以 <Code>WAVE_CURVE</Code> 為例，<Code>getPoint(t)</Code> 讓 7 段各分到
        1/7 的 <Code>t</Code>
        ，段的交界就是控制點，所以 <Code>getPoints(7)</Code> 的 8 個點剛好落在 8
        個控制點上。
        <Code>getPointAt(u)</Code> 依弧長等分，而控制點之間的距離從 3.3 到 15.4
        不等，它們不在全長的 1/7、2/7……上，只有起點與終點重合。
      </>
    ),
  },
  {
    title: "測試向量時比較距離",
    body: (
      <>
        <Code>toEqual</Code> 也會比較型別：<Code>Float32Array</Code>
        、一般陣列與 <Code>Vector3</Code> 即使數字相同也不相等。而且{" "}
        <Code>Float32Array</Code> 只有約 7 位有效數字、<Code>getPointAt</Code>{" "}
        是近似值，完全相等的比較不可靠。做法是把讀出的值統一成{" "}
        <Code>Vector3</Code>，再以 <Code>distanceTo</Code> 小於{" "}
        <Code>TOLERANCE</Code> 判斷；單一數字用 <Code>toBeCloseTo</Code>。
        <Code>it.each</Code>{" "}
        讓每個取樣點各成一個測試，失敗時名稱直接指出是哪一點。
      </>
    ),
  },
  {
    title: "純函式也可以不配置記憶體",
    body: (
      <>
        <Code>getCameraState</Code> 接收一個 <Code>out</Code>{" "}
        物件並把結果寫進去，計算過程用模組層級的暫存物件。這是 three
        的慣例（例如 <Code>getPointAt(u, optionalTarget)</Code>
        ）。同樣的輸入一定得到同樣的輸出，也不碰 React 與 scene graph。
      </>
    ),
  },
  {
    title: "progress 換算成取樣點",
    body: (
      <>
        <Code>x = progress * (samples - 1)</Code> 把 0–1 換到取樣點的座標，
        <Code>index = Math.floor(x)</Code> 是前一個取樣點，
        <Code>fraction = x - index</Code> 是兩點之間的比例。下一個取樣點要寫成{" "}
        <Code>Math.min(index + 1, samples - 1)</Code>：progress 為 1 時{" "}
        <Code>index</Code> 已經是最後一點，再加 1 就讀到陣列外。
        <Code>fraction</Code> 用減法而不用 <Code>x % 1</Code>
        ，意思直接寫在算式上。
      </>
    ),
  },
  {
    title: "方向向量插值後要 normalise",
    body: (
      <>
        兩個單位向量線性插值，走的是箭頭尖端之間的弦而不是弧，中間的長度小於
        1；兩者方向相反時，插值到 0.5 會變成零向量。tangent 與 up 插值後都要呼叫{" "}
        <Code>normalize()</Code>，position 是點，不需要。精確的弧插值是
        slerp，取樣夠密時 lerp 加 normalise 的誤差看不出來，也比較便宜。
        <Code>lerpVectors</Code> 回傳 <Code>this</Code>，可以直接串接{" "}
        <Code>.normalize()</Code>。
      </>
    ),
  },
  {
    title: "tangent 與 up",
    body: (
      <>
        tangent
        是曲線在這一點的前進方向，決定鏡頭往哪裡看。只知道往哪裡看，鏡頭還能繞著視線轉動（roll），up
        補上「畫面的上方大致朝哪裡」。up 不必與 tangent 完全垂直，
        <Code>lookAt</Code> 會自己修正成互相垂直的三根軸。
      </>
    ),
  },
  {
    title: "鏡頭看向負 Z",
    body: (
      <>
        three 的鏡頭預設看向 <Code>-Z</Code>。用{" "}
        <Code>Matrix4.lookAt(eye, target, up)</Code> 再{" "}
        <Code>Quaternion.setFromRotationMatrix</Code>
        ，會自動處理這個慣例，比自己組基底矩陣不容易差一個負號。
        <Code>Matrix4.lookAt</Code> 的 z 軸是 <Code>eye - target</Code>
        ，從目標指回鏡頭，鏡頭看 <Code>-Z</Code> 正好面向目標；一般物件的正面是{" "}
        <Code>+Z</Code>，所以 <Code>Object3D.lookAt</Code>{" "}
        遇到非鏡頭物件時會在內部對調 eye 與 target。這裡是鏡頭，不要對調。
      </>
    ),
  },
  {
    title: "lookAt 的 target 是點，不是方向",
    body: (
      <>
        方向與點都是 <Code>Vector3</Code>，傳錯型別檢查不會發現。target
        是「站在鏡頭位置往前走一步的那個點」，用{" "}
        <Code>_target.addVectors(position, tangent)</Code> 算出。
        <Code>Matrix4.lookAt</Code>{" "}
        只寫入旋轉部分、不設定平移，只取朝向正好合用。
      </>
    ),
  },
  {
    title: "用 applyQuaternion 測試朝向",
    body: (
      <>
        quaternion 的四個數字很難直接判斷。拿鏡頭本地的 forward{" "}
        <Code>(0, 0, -1)</Code> 與 up <Code>(0, 1, 0)</Code>，以{" "}
        <Code>applyQuaternion</Code> 轉到世界座標，再和預期方向比較{" "}
        <Code>distanceTo</Code>。朝向不應依賴鏡頭所在位置，所以用{" "}
        <Code>it.each</Code> 在多個 progress 各測一次；只測 progress 0
        會讓幾種錯誤碰巧通過。
      </>
    ),
  },
  {
    title: "測試資料要能區分兩種做法",
    body: (
      <>
        控制點等距的直線上，每段長度相同，<Code>getPoint</Code> 與{" "}
        <Code>getPointAt</Code> 結果一樣，誤改成 <Code>getPoint</Code>{" "}
        測試照樣通過。另加控制點 0、1、10 的曲線：全長 10，弧長中點在 x = 5，
        <Code>getPoint(0.5)</Code> 卻落在控制點 1（x = 1）。先換成{" "}
        <Code>getPoint</Code>{" "}
        看它失敗，再換回來看它通過，確認測試真的守住「必須弧長等分」這個決定。
      </>
    ),
  },
  {
    title: "useFrame 裡用 getState() 讀 progress",
    body: (
      <>
        以 hook 訂閱 progress 時，progress 每幀都變，元件就每幀 re-render。
        <Code>useScrollStore.getState()</Code> 只讀取當下的值，不觸發 React。
        <Code>ScrollDriverHandoff</Code> 以 <Code>addEffect</Code> 在每幀 render
        之前呼叫 <Code>lenis.raf()</Code>，<Code>useFrame</Code>{" "}
        讀到的就是這一幀最新的值，順序是「更新捲動 → 寫入 store → 鏡頭讀取」。
      </>
    ),
  },
  {
    title: "寫入 camera 用 copy",
    body: (
      <>
        <Code>Object3D</Code> 的 <Code>position</Code> 與{" "}
        <Code>quaternion</Code> 是唯讀屬性，不能直接指派，要用{" "}
        <Code>copy()</Code> 把值複製進既有物件。<Code>RailCamera</Code>{" "}
        不渲染任何東西，回傳 <Code>null</Code>；和 <Code>OrbitControls</Code>{" "}
        同時存在時兩者每幀都寫入同一台鏡頭，要擇一使用。
      </>
    ),
  },
  {
    title: "兩台鏡頭切換預設",
    body: (
      <>
        Canvas 原本的鏡頭給 <Code>OrbitControls</Code> 俯瞰；
        <Code>RailCamera</Code> 以 drei 的{" "}
        <Code>&lt;PerspectiveCamera&gt;</Code> 自帶一台，<Code>useFrame</Code>{" "}
        寫入 <Code>ref</Code> 指向的這台，而不是 <Code>state.camera</Code>
        （那是目前的預設鏡頭）。<Code>makeDefault</Code> 為 true 時它成為 R3F
        用來 render 的鏡頭，變成 false
        時還原。兩台各自保存位置，切回俯瞰時停在上次轉到的角度。
        <Code>OrbitControls</Code> 的 <Code>makeDefault</Code> 意思不同：只是把
        controls 登記到 store，不會停用它，所以 rail 模式下要直接不渲染它。
      </>
    ),
  },
  {
    title: "data-lenis-prevent",
    body: (
      <>
        Lenis 監聽 window 的 <Code>wheel</Code>，在 Canvas
        上滾輪縮放時頁面也會捲動。元素帶有 <Code>data-lenis-prevent</Code>{" "}
        時，Lenis 忽略從它（含子孫）發出的事件。只有 orbit 模式需要；rail
        模式下滾輪應該照常捲動、驅動鏡頭。Lenis 以 <Code>hasAttribute</Code>{" "}
        判斷，只看屬性在不在，不看值。
      </>
    ),
  },
  {
    title: "固定 up 為什麼會翻轉",
    body: (
      <>
        <Code>lookAt</Code> 用前進方向與 up
        的外積算出「右方」。軌道接近垂直時，前進方向幾乎與{" "}
        <Code>(0, 1, 0)</Code>{" "}
        平行，外積趨近零向量，右方無法決定，一點數值誤差就讓它跳到另一側。
      </>
    ),
  },
  {
    title: "Parallel transport",
    body: (
      <>
        up 沿著軌道一路「帶著走」：每一步用{" "}
        <Code>Quaternion.setFromUnitVectors</Code> 求出把上一個 tangent
        轉到這一個 tangent 的最小旋轉，套用到上一個 up，再扣掉它在 tangent
        上的分量並
        normalize（Gram–Schmidt），修正累積的浮點誤差。每一步只轉一點點，所以不會突然翻轉。代價是不保證
        up 朝上，經過大轉彎後鏡頭可能帶一點傾斜，處理方式見「Levelling」。
      </>
    ),
  },
  {
    title: "prevTangent 要 copy，不能直接指派",
    body: (
      <>
        <Code>Vector3</Code> 是物件，變數存的是指向它的參考，不是數值本身。
        <Code>prevTangent = tangent</Code> 只是讓兩個名稱指向同一個物件：下一圈{" "}
        <Code>getTangentAt(u, tangent)</Code> 寫入 tangent 時 prevTangent
        也跟著變，旋轉永遠是「從自己轉到自己」，up 完全不動。要在迴圈外各自{" "}
        <Code>new</Code> 一個，每圈結束時 <Code>prevTangent.copy(tangent)</Code>{" "}
        把數值複製過去。three
        的方法大多直接修改物件本身，所以「哪些名稱指向同一個物件」要隨時清楚，這和{" "}
        <Code>readVec3</Code> 重新指派、<Code>out.position</Code>{" "}
        讀到舊值是同一類問題。
      </>
    ),
  },
  {
    title: "Frenet frame 的問題",
    body: (
      <>
        Frenet frame 以曲率方向作為法向量：直線段曲率為零時沒有定義，S
        形的反曲點會直接反向。three 的 <Code>computeFrenetFrames</Code>{" "}
        名字雖然叫 Frenet，實作其實接近 parallel transport。
      </>
    ),
  },
];

const PITFALLS: Pitfall[] = [
  {
    title: "useMemo 白做：new Float32Array 寫在 JSX 裡",
    symptom: (
      <>
        <Code>useMemo</Code> 記住了 <Code>number[]</Code>，但{" "}
        <Code>args=&#123;[new Float32Array(positions), 3]&#125;</Code>{" "}
        每次渲染都產生新陣列。
      </>
    ),
    cause: (
      <>
        R3F 以參考比較 <Code>args</Code>，每次都以為參數變了，於是重建{" "}
        <Code>BufferAttribute</Code> 並重新上傳到 GPU。
      </>
    ),
    fix: (
      <>
        把 <Code>new Float32Array(...)</Code> 移進 <Code>useMemo</Code>
        （Move Statements into Function），JSX 裡只放記住的結果。
      </>
    ),
  },
  {
    title: "toEqual 比較 Float32Array 與陣列永遠失敗",
    symptom: (
      <>
        <Code>
          expected Float32Array[ 0, 0, 0 ] to deeply equal [ +0, +0, +0 ]
        </Code>
        ：數字一樣卻判定不相等。
      </>
    ),
    cause: (
      <>
        <Code>toEqual</Code> 也會比較物件的型別。<Code>slice()</Code> 得到{" "}
        <Code>Float32Array</Code>，<Code>toArray()</Code> 得到一般陣列。
      </>
    ),
    fix: (
      <>
        寫一個 <Code>read(lut, i, field)</Code>（Extract Function）以{" "}
        <Code>fromArray</Code> 讀成 <Code>Vector3</Code>，再比較{" "}
        <Code>distanceTo</Code>。
      </>
    ),
  },
  {
    title: "以為第 1 個取樣點就是第 1 個控制點",
    symptom: (
      <>
        測試預期 sample 1 等於 <Code>POINTS[1] = (1, 0, 0)</Code>，實際是{" "}
        <Code>(1.5, 0, 0)</Code>。
      </>
    ),
    cause:
      "取樣點依弧長等分，與控制點的位置無關。長度 3 的直線取 3 個點，sample 1 在全長的正中間。",
    fix: "預期值改成弧長中點，測試名稱寫明「not at control point 1」，提醒兩者是不同的點。",
  },
  {
    title: "LutPoints 的計算寫在元件裡",
    symptom: (
      <>
        <Code>buildRailLUT</Code> 與兩個 <Code>new Float32Array</Code>{" "}
        寫在元件函式裡。
      </>
    ),
    cause:
      "每次渲染都重算並產生新陣列，args 的參考一變，R3F 就重建 attribute。跟 useMemo 白做是同一個坑。",
    fix: "資料只依賴常數，整段移到模組最上層（Move Statements），元件裡只剩 JSX。",
  },
  {
    title: "progress 1 讀到陣列外",
    symptom: (
      <>
        progress 為 1 時鏡頭位置變成 <Code>NaN</Code>。
      </>
    ),
    cause: (
      <>
        <Code>index</Code> 已經是最後一個取樣點，<Code>index + 1</Code>{" "}
        超出陣列，<Code>Float32Array</Code> 越界讀到 <Code>undefined</Code>
        ，插值結果就是 <Code>NaN</Code>。
      </>
    ),
    fix: (
      <>
        <Code>nextIndex = Math.min(index + 1, samples - 1)</Code>
        。這時兩次讀到同一點、<Code>fraction</Code> 為 0，結果就是最後一點。
      </>
    ),
  },
  {
    title: "<threeLine> 第一次 render 正常，更新時才出錯",
    symptom: (
      <>
        加入切換按鈕後，一按就出現{" "}
        <Code>R3F: ThreeLine is not part of the THREE namespace!</Code>
        ，接著是 <Code>removeChild</Code> 與{" "}
        <Code>synchronously unmount a root</Code> 等連鎖錯誤，堆疊指向無關的{" "}
        <Code>ControlPoints</Code>。
      </>
    ),
    cause: (
      <>
        R3F 9.8.2 的 <Code>createInstance</Code> 會去掉 <Code>three</Code>{" "}
        前綴，<Code>commitUpdate</Code> 卻直接用 <Code>threeLine</Code> 查
        catalogue。Scene 有了 state 後 re-render，<Code>RailLine</Code> 跟著
        re-render、拿到新的 props，才第一次走到更新這條路。錯誤讓 Canvas root
        被卸載，drei <Code>&lt;Html&gt;</Code> 的 DOM
        節點被移除兩次，才出現後面兩個錯誤。
      </>
    ),
    fix: (
      <>
        在 <Code>RailLine.tsx</Code> 的模組層級{" "}
        <Code>extend(&#123; ThreeLine: Line &#125;)</Code>
        ，建立與更新都查得到。放在使用它的檔案，import 時一定先於 render
        執行；不可放在 <Code>page.tsx</Code>：Server Component
        的程式碼不會進入瀏覽器，登記不到瀏覽器端的 catalogue。
      </>
    ),
  },
  {
    title: "data-* 屬性傳 boolean 仍然存在",
    symptom: (
      <>
        <Code>
          data-lenis-prevent=&#123;viewMode === &quot;orbit&quot;&#125;
        </Code>
        ：rail 模式下在 Canvas 上滾輪，頁面能捲動但沒有平滑效果。
      </>
    ),
    cause: (
      <>
        React 把 <Code>data-*</Code> 與 <Code>aria-*</Code> 的 boolean
        轉成字串輸出，DOM 上是 <Code>data-lenis-prevent=&quot;false&quot;</Code>
        ，屬性仍然存在。Lenis 以 <Code>hasAttribute</Code>{" "}
        判斷，於是放手交給瀏覽器的原生捲動。
      </>
    ),
    fix: (
      <>
        不需要時傳 <Code>undefined</Code>，React 才不會輸出這個屬性。用 DevTools
        的 Elements 面板確認屬性會出現與消失，而不只是值在變。
      </>
    ),
  },
];

const VERIFICATIONS: Verification[] = [
  {
    id: "uniform-speed",
    body: (
      <>
        捲動時鏡頭沿曲線平順前進。暫時把 <Code>getPointAt</Code> 換成{" "}
        <Code>getPoint</Code>，控制點距離不平均的地方速度會明顯改變。
      </>
    ),
  },
  {
    id: "no-flip",
    body: "經過垂直段時鏡頭不會翻轉；除錯用的 up 短線方向連續，沒有突然反向。",
  },
  {
    id: "pure",
    body: (
      <>
        <Code>rail.ts</Code> 沒有 import 任何 React 或 R3F 的東西，
        <Code>useFrame</Code> 裡沒有 <Code>new</Code>
        ，每幀呼叫的函式也沒有會配置物件的預設參數。
      </>
    ),
  },
  {
    id: "no-rerender",
    body: (
      <>
        捲動時 <Code>RailCamera</Code> 不會 re-render（React DevTools 的
        Highlight updates 不閃爍）。
      </>
    ),
  },
  {
    id: "view-toggle",
    body: "切到 orbit 回到俯瞰、滾輪只縮放不捲動頁面；切回 rail 接上鏡頭當前的位置，滾輪平滑捲動。反覆切換時俯瞰鏡頭停在上次轉到的角度。",
  },
  {
    id: "levelling",
    body: "rail 模式捲過 LOOP_CURVE：迴圈頂點格線在畫面上方、軸向指示器的 y 軸朝下；出迴圈後地平線在幾十單位內轉回水平，看不出突然的 roll。",
  },
  {
    id: "tests",
    body: (
      <>
        <Code>pnpm test</Code> 通過，且「含垂直段的曲線不會反轉」的測試在固定 up
        時失敗、改成 parallel transport 後通過。
      </>
    ),
  },
];

export {
  CONCEPTS,
  GATE_COLUMNS,
  GATE_ROWS,
  LAYOUT_COLUMNS,
  LAYOUT_ROWS,
  LEVELLING,
  LEVELLING_RESULT_COLUMNS,
  LEVELLING_RESULT_ROWS,
  LINE_COLUMNS,
  LINE_ROWS,
  MATH,
  PITFALLS,
  ROTATION_COLUMNS,
  ROTATION_ROWS,
  SEGMENT_COLUMNS,
  SEGMENT_ROWS,
  STEPS,
  VERIFICATIONS,
};
