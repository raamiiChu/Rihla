import { Code } from "@/app/lab/_components";
import type { Unit08Content } from "./types";

const content: Unit08Content = {
  intro: (
    <>
      讓圓形形變成星形，過程中線條不扭轉、不翻轉。星形寫在{" "}
      <Code>src/lib/shapes/star.ts</Code>，對齊寫在{" "}
      <Code>src/lib/morph/align.ts</Code>，這一頁只放示範。
    </>
  ),
  demoCaption:
    "圓形與 {8/3} 星形取成相同點數，以滑桿控制形變比例，比較對齊前後的差別。形變途中先散開成點雲，再收攏成星形。",
  demoLabels: {
    startOffset: "起點偏移",
    reversed: "反向",
    aligned: "對齊",
    morph: "形變比例",
  },
  steps: [
    {
      id: "star",
      title: (
        <>
          寫 <Code>starPolygon(n, k)</Code> 與測試，畫出 {"{8/3}"}
        </>
      ),
      done: true,
    },
    {
      id: "morph",
      title:
        "圓形與星形都以封閉模式重新取樣成相同點數，用滑桿控制插值比例，先不對齊，觀察扭轉",
      done: true,
    },
    {
      id: "align",
      title: (
        <>
          寫 <Code>align(a, b)</Code>{" "}
          與測試：旋轉起始索引，比較兩個方向，選總距離最小的
        </>
      ),
      done: true,
    },
    {
      id: "cloud",
      title: "加入中間的「散開成雜訊點雲」階段",
      done: true,
    },
  ],
  concepts: [
    {
      title: "形變是逐點插值",
      body: (
        <>
          A 與 B 點數相同，第 i 點的位置是 <Code>lerp(A[i], B[i], e(t))</Code>。
          <Code>e</Code> 是 easing
          函式，讓形變慢慢開始、慢慢結束，不會等速得很生硬。
        </>
      ),
    },
    {
      title: "星形多邊形 {n/k}",
      body: (
        <>
          圓上等距放 n 點，從第 0 點出發，每次跳 k 點：第 i 筆走到{" "}
          <Code>(i × k) mod n</Code>。n 與 k 互質時一筆畫走完全部 n 點。
        </>
      ),
    },
    {
      title: "為什麼 {8/2} 不是一筆畫",
      body: (
        <>
          依 <Code>(i × 2) mod 8</Code> 走訪得到 0、2、4、6、0、2、4、6：第 4
          步就回到起點，1、3、5、7 永遠走不到。一般來說，令 d = gcd(n, k)，每 n
          / d 步就回到起點，只走過 n / d 個點，要 d 筆才畫得完，每筆是一個{" "}
          {"{(n/d)/(k/d)}"}。所以 {"{8/2}"} 是兩個錯開 45° 的正方形 {"{4/1}"}，
          {"{6/2}"} 是兩個三角形。這也是 <Code>starPolygon</Code> 要求{" "}
          <Code>gcd(n, k) === 1</Code> 的原因：d 大於 1
          時，照公式畫只會在同一個小形狀上反覆繞圈，交給 <Code>resample</Code>{" "}
          後同一段線會被取樣兩次，點會重疊在一起。
        </>
      ),
    },
    {
      title: "起點與方向不一致，形變就會扭轉或翻轉",
      body: "封閉形狀從哪一點開始、往哪個方向走都是任意的。起點不同時，每個點都要沿圓周跑一段，整條線像被擰轉；方向相反時，點會穿過中心跑到對面，形狀像翻面。",
    },
    {
      title: "旋轉起始索引，比較兩個方向",
      body: (
        <>
          把 A 的起點環狀旋轉 s 格，計算{" "}
          <Code>Σ |A[(i + s) mod N] − B[i]|</Code>
          ，試遍所有 s，反向再試一次，共 2N
          種，選總距離最小的。只有封閉取樣能這樣旋轉：最後一點不重複起點，旋轉後間距不變。計算量是
          2N × N，只在初始化時算一次。
        </>
      ),
    },
    {
      title: "實測：偏移與反向的效果",
      body: (
        <>
          以 {"{8/3}"} 的 8 個尖端追蹤點的路線。未對齊時，偏移 ⅛
          讓整條線擰轉，偏移 ¼
          的位移再加倍；反向後一半的點穿過中心。打開對齊後，6 種設定（3 種偏移 ×
          2 個方向）都排回同一個順序，結果等於「偏移 0、反向」：4 點不動、4
          點穿過中心，比不反向的 2 點不動、2 點穿過中心、4 點走弦的總距離更小。
        </>
      ),
    },
    {
      title: "繞圈數不同時，對齊也無法消除交錯",
      body: (
        <>
          圓沿圓周只繞一圈，{"{8/3}"}{" "}
          的筆畫繞三圈才回到起點，兩者走到同樣弧長比例時角度不同。
          <Code>align</Code>{" "}
          只能選起點與方向，讓總距離最小，但「總距離最小」不等於「看起來最好」：對齊後仍有點穿過中心。正式網站從路線形變成書法時也會遇到，是這個方法的極限，不是錯誤。
        </>
      ),
    },
    {
      title: "形變需要三個陣列：from、to、output",
      body: (
        <>
          from（重新排列過的圓）只在設定改變時以 <Code>useMemo</Code>{" "}
          重算；to（星形）永遠不變；output 以 <Code>useMemo(..., [])</Code>{" "}
          只建立一次，是唯一會被寫入、綁在 GPU 上的陣列。<Code>useFrame</Code>{" "}
          每幀把 <Code>lerp(from[i], to[i], e)</Code> 寫進 output，再設定{" "}
          <Code>needsUpdate</Code>。尖端的點讀同一份 output，以 <Code>set</Code>{" "}
          與 <Code>subarray</Code> 複製到自己的 buffer，不另外計算。
        </>
      ),
    },
    {
      title: "每秒變化很多次的值放在 ref",
      body: (
        <>
          滑桿的 <Code>onValueChange</Code> 只寫{" "}
          <Code>morphProgressRef.current</Code>，拖動時完全不 re-render，由{" "}
          <Code>useFrame</Code> 每幀讀取，和正式網站以 <Code>getState()</Code>{" "}
          讀 <Code>progress</Code> 是同一個原則。
        </>
      ),
    },
    {
      title: "一段插值拆成兩段：A → 點雲 C → B",
      body: (
        <>
          以 <Code>CLOUD_PROGRESS</Code> 把 progress 切成兩段，前半段 A →
          C、後半段 C → B。每段都要把 progress 換算成自己的 0 到 1（inverse
          lerp）再套 easing，<Code>MathUtils.smoothstep(x, min, max)</Code>{" "}
          一次做完這兩件事。一個分支同時決定 from、to、min、max，lerp
          迴圈只寫一份；from 與 to
          只是換參照，每幀做也不配置記憶體。交界處前半段的 eased 是 1、後半段是
          0，兩邊都等於 C，所以不會跳。
        </>
      ),
    },
    {
      title: "點雲只產生一次，在圓盤內均勻分布",
      body: (
        <>
          C 的第 i 點是「A[i] 與 B[i] 的中點 + 第 i
          個隨機偏移」，點雲仍隱約帶著形狀。偏移在模組載入時產生一次，每幀重新隨機會閃爍；放在模組層級，切換設定時點雲的亂法也不變。圓盤內均勻取點用隨機角度加上半徑{" "}
          <Code>spread × √u</Code>：半徑 r 那一圈的周長與 r
          成正比，外圈要分到較多點，直接用 <Code>u</Code> 會擠在中心。
        </>
      ),
    },
    {
      title: "線與點交叉淡入淡出",
      body: (
        <>
          隨機分布的點依序連成線會變成一團亂線，所以點雲階段改畫{" "}
          <Code>&lt;points&gt;</Code>。這裡的 <Code>lineLoop</Code>{" "}
          與點都是一般的 position 陣列，可以共用 output（各自是一個{" "}
          <Code>BufferAttribute</Code>，兩邊都要設 <Code>needsUpdate</Code>
          ）；正式網站的 <Code>Line2</Code>{" "}
          是交錯格式，不能共用。散開程度前半段是 eased、後半段是{" "}
          <Code>1 − eased</Code>，再以{" "}
          <Code>smoothstep(scatter, 0, FADE_END)</Code>{" "}
          重新映射成較窄的區間，點才剛散開，交接就已完成。
          <Code>transparent</Code> 寫在 JSX 上固定不變，<Code>opacity</Code> 是
          uniform，每幀直接寫入，不需要 <Code>needsUpdate</Code>。
        </>
      ),
    },
    {
      title: "先量測再優化",
      body: (
        <>
          <Code>Math.hypot</Code> 為了避免溢位會先縮放，比{" "}
          <Code>Math.sqrt(dx ** 2 + …)</Code> 慢約 10 倍；座標在 ±1
          附近不會溢位，用 <Code>sqrt</Code> 即可（
          <Code>** 2</Code> 與 <Code>x * x</Code>{" "}
          一樣快）。另一方面，以索引計算候選距離、不建立陣列的寫法，若每點都用{" "}
          <Code>%</Code> 繞回，反而比建立陣列慢；改用 <Code>if</Code> 繞回才快
          2–4 倍。<Code>align</Code> 是 O(N²)，N = 512
          時各種寫法都只要數十毫秒，等 <Code>POINT_COUNT</Code>{" "}
          決定後再依量測判斷。
        </>
      ),
    },
  ],
  pitfalls: [
    {
      title: "describe 裡呼叫被測函式，整個檔案變成 no tests",
      symptom: (
        <>
          <Code>starPolygon</Code> 還是 stub 時，Vitest 回報 no tests。
        </>
      ),
      cause: (
        <>
          <Code>describe</Code> 的 callback 在收集測試時就執行，stub
          在那時丟出錯誤，整個檔案收集失敗。
        </>
      ),
      fix: (
        <>
          <Code>describe</Code> 裡只放宣告，呼叫被測函式的程式碼放進{" "}
          <Code>it</Code> 或 <Code>beforeAll</Code>。
        </>
      ),
    },
    {
      title: "直接倒轉陣列，起點跟著跑掉",
      symptom: "反向後，形變同時出現翻轉與擰轉，分不清是哪個造成的。",
      cause: (
        <>
          整個陣列倒過來，第 0 點會變成原本的最後一點，等於同時改了方向和起點。
        </>
      ),
      fix: (
        <>
          第 i 點取原本的第 <Code>(n − i) mod n</Code> 點，第 0
          點保持不動，只改方向。
        </>
      ),
    },
    {
      title: "useFrame 寫在渲染 Canvas 的元件裡",
      symptom:
        "執行時丟出 Hooks can only be used within the Canvas component。",
      cause: (
        <>
          <Code>useFrame</Code> 需要 <Code>&lt;Canvas&gt;</Code> 提供的
          context，渲染 <Code>&lt;Canvas&gt;</Code> 的元件本身不在 Canvas 裡。
        </>
      ),
      fix: (
        <>
          把線拆成子元件（<Code>MorphLine</Code>），<Code>useFrame</Code>{" "}
          放在子元件裡。
        </>
      ),
    },
    {
      title: "output 沒包 useMemo，每次 render 都換掉 attribute",
      symptom: "畫面看起來正常，但切換設定時 position attribute 被重建。",
      cause: (
        <>
          元件本體每次 render 都執行，產生新的 <Code>Float32Array</Code>；
          <Code>&lt;bufferAttribute args&gt;</Code> 一變，R3F 就丟掉舊的
          attribute 重新建立。
        </>
      ),
      fix: (
        <>
          <Code>useMemo(() =&gt; new Float32Array(...), [])</Code>{" "}
          只建立一次，之後每幀只改它的內容。
        </>
      ),
    },
    {
      title: "過了中點，點雲突然變回亂線",
      symptom: "progress 一過 0.5，點還在點雲的位置，線卻瞬間變回不透明。",
      cause: (
        <>
          直接拿 <Code>easedProgress</Code> 當散開程度。後半段它從 0 走到
          1，散開程度卻是從 1 回到 0，一過中點就從 1 跳回 0。
        </>
      ),
      fix: (
        <>
          以 <Code>isScattering</Code> 判斷，後半段改用{" "}
          <Code>1 − easedProgress</Code>。
        </>
      ),
    },
    {
      title: "shadcn Slider 傳單一數值卻出現兩個把手",
      symptom: (
        <>
          <Code>defaultValue={"{0}"}</Code> 畫出範圍選擇器。
        </>
      ),
      cause:
        "產生的元件只在 value 是陣列時才依長度決定把手數量，數字會落到 [min, max]。",
      fix: (
        <>
          抽出 <Code>countThumbs</Code>：數字畫 1 個，陣列依長度，沒有值才畫 2
          個。
        </>
      ),
    },
  ],
  verifications: [
    {
      id: "no-twist",
      body: "對齊後，形變過程線條不扭轉、不翻轉。",
    },
    {
      id: "8-2",
      body: "能說明為什麼 {8/2} 不是一筆畫。",
    },
    {
      id: "cloud",
      body: "拖過中段時，線淡出成靜止的點雲，再收攏成星形，交界處不跳動、看不到亂線。",
    },
    {
      id: "tests",
      body: (
        <>
          測試：<Code>starPolygon</Code> 的點數與首尾閉合；
          <Code>align</Code>{" "}
          對齊後與目標的總距離不大於對齊前，也不大於反向比對的結果。
          <Code>pnpm test</Code> 全部通過。
        </>
      ),
    },
  ],
};

export default content;
