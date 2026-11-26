import { Code } from "@/app/lab/_components";
import type { Unit07Content } from "./types";

const content: Unit07Content = {
  intro: (
    <>
      把任意折線轉成固定點數、沿線等距分布的點。之後每個形狀都會先經過這一步，形變時第
      i 點才能對應到第 i 點。函式直接寫在 <Code>src/lib/morph/resample.ts</Code>
      ，這一頁只放示範。
    </>
  ),
  demoCaption:
    "一條點分布很不均勻的折線，重新取樣成等距的點，並標出每個原始頂點對應的取樣點。",
  demoLabels: {
    open: "開放",
    closed: "封閉",
    count: "點數",
    legend: {
      vertex: "原始頂點",
      sample: "取樣點",
      nearest: "最近的取樣點",
    },
  },
  steps: [
    {
      id: "tests",
      title: "把驗收標準寫成 Vitest 測試，開放與封閉曲線各一組",
      done: true,
    },
    {
      id: "resample",
      title: (
        <>
          實作 <Code>resample(src, count, &#123; closed &#125;)</Code>，回傳{" "}
          <Code>&#123; points, sourceT &#125;</Code>
        </>
      ),
      done: true,
    },
    {
      id: "nearest-index",
      title: (
        <>
          實作 <Code>getNearestSampleIndex</Code>
          ，把弧長比例換算成最近的取樣點索引
        </>
      ),
      done: true,
    },
    {
      id: "demo",
      title: (
        <>
          用 <Code>&lt;points&gt;</Code>{" "}
          畫出不均勻的折線與取樣結果，可切換開放、封閉與點數，並標出原始頂點對應的取樣點
        </>
      ),
      done: true,
    },
  ],
  flowCharts: {
    title: "流程圖",
    intro: (
      <>
        <Code>resample</Code> 回傳的 <Code>sourceT</Code> 交給{" "}
        <Code>getNearestSampleIndex</Code>
        ，就能找到每個原始頂點對應的取樣點。兩者必須傳入相同的{" "}
        <Code>count</Code> 與 <Code>closed</Code>，索引才對得上。
      </>
    ),
    resample: {
      title: "resample",
      labels: {
        start: ["resample(src, count, { closed })"],
        valid: ["輸入合法？"],
        error: ["RangeError"],
        table: [
          "① 累積長度表 accumulatedDistances",
          "[i + 1] = [i] + 第 i 段的長度",
          "封閉曲線多一段：最後一點 → 頂點 0",
        ],
        positive: ["總長 L > 0？"],
        sourceT: ["② sourceT = 前 n 項 ÷ L"],
        spacing: ["spacing = L ÷ 間距數", "間距數：封閉 count，開放 count − 1"],
        target: ["③ 第 i 點：target = i × spacing"],
        beyond: ["target 超過", "目前這一段？"],
        nextSegment: ["segment + 1"],
        interpolate: [
          "ratio = 在段內的位置 ÷ 段長",
          "points[i] = lerp(起點, 終點, ratio)",
        ],
        more: ["還有取樣點？"],
        done: ["回傳 { points, sourceT }"],
        yes: ["是"],
        no: ["否"],
      },
    },
    nearest: {
      title: "getNearestSampleIndex",
      labels: {
        start: ["getNearestSampleIndex(t, count, opts)"],
        valid: ["輸入合法？"],
        error: ["RangeError"],
        index: [
          "間距數：封閉 count，開放 count − 1",
          "index = round(t × 間距數)",
        ],
        wrap: ["index === count？"],
        zero: ["回傳 0", "繞回起點"],
        done: ["回傳 index"],
        yes: ["是"],
        no: ["否"],
      },
    },
  },
  concepts: [
    {
      title: "為什麼要重新取樣",
      body: (
        <>
          不同形狀的原始點數與間距都不一樣：圓可能有 64
          點，字形輪廓可能有上千點，而且集中在彎曲處。形變是把 A 的第 i 點移到 B
          的第 i
          點，兩者的點數必須相同，分布也要均勻，否則線條會在某些地方擠成一團、某些地方拉得很長。
        </>
      ),
    },
    {
      title: "累積長度表",
      body: (
        <>
          先算出每個原始頂點離起點的沿線距離：
          <Code>accumulatedDistances[0] = 0</Code>、
          <Code>
            accumulatedDistances[i] = accumulatedDistances[i-1] + |p[i] −
            p[i-1]|
          </Code>
          。總長 L 是 <Code>accumulatedDistances</Code>{" "}
          的最後一項；封閉曲線還要加上最後一點回到起點的那一段。第 k
          個取樣點的目標距離是 <Code>k × 間距</Code>
          ，找出它所在的線段，再對兩端點做線性插值。
        </>
      ),
    },
    {
      title: "開放與封閉曲線的間距不同",
      body: (
        <>
          開放曲線的間距是 <Code>L / (count − 1)</Code>
          ，首尾兩點固定在原始的首尾。封閉曲線的間距是 <Code>L / count</Code>
          ：最後一點不回到起點，它到起點的距離本身就是一個間距。這樣起始索引才能環狀旋轉，單元
          08 的起點對齊依賴這一點。
        </>
      ),
    },
    {
      title: "取樣點的位置是遞增的，不必每次從頭搜尋",
      body: (
        <>
          目標距離隨 k 遞增，所在的線段只會往前移。用一個指標跟著往前走，整體是
          O(n + count)；每個點都從頭找或二分搜尋，就多做了很多次比較。
        </>
      ),
    },
    {
      title: "sourceT：先存比例，需要時再換算成索引",
      body: (
        <>
          等距的取樣點一般不會剛好落在原始頂點上。<Code>sourceT</Code>{" "}
          存每個原始頂點的弧長比例 <Code>accumulatedDistances[i] / L</Code>
          ，這是精確值；需要索引時再換算成最近的取樣點。站點鎖定、終章逐段點亮、
          <Code>instanceCount</Code> 畫到第幾段，都依此對應。
        </>
      ),
    },
    {
      title: "用 64 位元累加，寫入時才轉成 Float32Array",
      body: (
        <>
          JS 的 number 是 64 位元浮點數。累積長度、插值都用 number
          計算，只在寫入 <Code>points</Code> 時才轉成 32
          位元，長度才不會越加越偏。
        </>
      ),
    },
    {
      title: "示範頁用正交相機",
      body: (
        <>
          透視相機會讓近的變大、遠的變小，間距是否相等不能直接用眼睛判斷。
          <Code>&lt;Canvas orthographic&gt;</Code>{" "}
          沒有透視，畫面上的距離等於實際距離。
          <Code>zoom</Code> 是「1
          個世界單位等於幾個像素」，依畫面大小計算，讓圖形在手機上也放得下；改完要呼叫{" "}
          <Code>camera.updateProjectionMatrix()</Code>。
        </>
      ),
    },
  ],
  pitfalls: [
    {
      title: "封閉曲線少算了回到起點的那一段",
      symptom: "封閉曲線最後一點到起點的距離比其他間距大，形狀的缺口很明顯。",
      cause: (
        <>
          累積長度表只走到最後一個頂點，總長 L 沒有包含最後一點回到起點的線段。
        </>
      ),
      fix: (
        <>
          封閉時線段數是 <Code>vertexCount</Code>，第 i 段的終點寫成{" "}
          <Code>(i + 1) % vertexCount</Code>，最後一段自然回到頂點 0。
        </>
      ),
    },
    {
      title: "重複的頂點讓插值變成 NaN",
      symptom: (
        <>
          原始資料有兩個相同的頂點時，輸出的點出現 <Code>NaN</Code>。
        </>
      ),
      cause: "長度為 0 的線段，插值比例的分母是 0。",
      fix: (
        <>
          線段長度為 0 時比例直接設為 0。整條線長度為 0 則無法取樣，丟出{" "}
          <Code>RangeError</Code>。
        </>
      ),
    },
    {
      title: "封閉曲線的索引超出範圍",
      symptom: (
        <>
          <Code>t</Code> 接近 1 時，<Code>getNearestSampleIndex</Code> 回傳{" "}
          <Code>count</Code>，不是合法的索引。
        </>
      ),
      cause: (
        <>
          <Code>Math.round(t × count)</Code> 會進位到 <Code>count</Code>
          ，但封閉曲線的最後一點不重複起點，索引只到 <Code>count − 1</Code>。
        </>
      ),
      fix: (
        <>
          索引 <Code>count</Code> 就是繞一圈回到起點，換成 0。
        </>
      ),
    },
  ],
  verifications: [
    {
      id: "count",
      body: "輸出的點數等於 count，開放與封閉都一樣。",
    },
    {
      id: "even",
      body: "輸出的點沿線等距分布，不會在短邊擠成一團。",
    },
    {
      id: "closed-gap",
      body: "封閉曲線最後一點到起點的距離，與其他相鄰點的間距相同。",
    },
    {
      id: "open-ends",
      body: "開放曲線的首尾點與原始的首尾點相同。",
    },
    {
      id: "nearest",
      body: "每個原始頂點與它最近的取樣點，距離小於半個取樣間距。",
    },
    {
      id: "tests",
      body: (
        <>
          以上各項都寫成 Vitest 測試，<Code>pnpm test</Code> 全部通過。
        </>
      ),
    },
  ],
};

export default content;
