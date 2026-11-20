import {
  Code,
  ConceptList,
  DataTable,
  NotesHeader,
  NotesSection,
  PitfallList,
  StepList,
  VerificationList,
} from "@/app/lab/_components";
import {
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
} from "../_content/notes";

const Notes = () => (
  <>
    <NotesHeader unitId="04">
      鏡頭沿曲線前進，並把「progress →
      鏡頭狀態」寫成純函式。曲線事先算成查找表，up 向量以 parallel transport
      沿軌道傳遞，經過垂直段也不會翻轉；水平路段再逐步回正，消除殘留的傾斜。
    </NotesHeader>

    <NotesSection title="進度">
      <StepList items={STEPS} />
    </NotesSection>

    <NotesSection title="控制點的設計">
      <div className="mb-4 space-y-3 text-parchment/90">
        <p>
          <Code>curve.ts</Code>{" "}
          有兩條曲線，各自用來觀察不同的問題。示範欄右上角的按鈕在兩者之間切換，預設是{" "}
          <Code>LOOP_CURVE</Code>。
        </p>
        <p>
          <Code>WAVE_CURVE</Code>（8 個控制點，全長約 68）：z 從 0 延伸到 -60，y
          在 -4 到 5 之間上下交錯。相鄰控制點的距離刻意不平均（最短 3.3、最長
          15.4，差將近 5 倍），步驟 3 比較 <Code>getPoint</Code> 與{" "}
          <Code>getPointAt</Code> 時速度差異才明顯。
        </p>
      </div>
      <DataTable
        caption="WAVE_CURVE 相鄰控制點之間的距離"
        columns={SEGMENT_COLUMNS}
        rows={SEGMENT_ROWS}
      />
      <p className="mt-4 text-parchment/90">
        <Code>LOOP_CURVE</Code>（6 個控制點，全長約
        173）：像雲霄飛車的垂直迴圈，沿 -z 前進、爬升，在頂點倒著往 +z
        走，從靠近入口的一側落下，再從迴圈下方繼續往前。前進方向兩度接近垂直，用來觀察固定
        up 的翻轉、parallel transport 與 levelling。x
        從入口到出口偏移，讓出口錯開入口；也因此迴圈不在同一個平面上，tangent
        從未真正垂直，純 parallel transport 出迴圈後會殘留約 41° 的傾斜。
      </p>
    </NotesSection>

    <NotesSection title="三種畫線方式">
      <DataTable
        caption="threeLine、drei Line 與自建 Line2 的比較"
        columns={LINE_COLUMNS}
        rows={LINE_ROWS}
      />
    </NotesSection>

    <NotesSection title="查找表的資料排列">
      <p className="mb-4 text-parchment/90">
        每個取樣點 9 個 float（<Code>STRIDE = 9</Code>），第 <Code>i</Code>{" "}
        個取樣點從 <Code>i * STRIDE</Code> 開始。
      </p>
      <DataTable
        caption="查找表每個取樣點的欄位、偏移與用途"
        columns={LAYOUT_COLUMNS}
        rows={LAYOUT_ROWS}
      />
    </NotesSection>

    <NotesSection title="弧長等分與參數等分">
      <div className="space-y-3 text-parchment/90">
        <p>
          以下以 <Code>WAVE_CURVE</Code> 為例，觀察時先用按鈕切到 Wave。
          <Code>LutPoints</Code> 以 64 個取樣點同時畫出兩組點：綠點來自{" "}
          <Code>buildRailLUT</Code>（弧長等分），紅點來自{" "}
          <Code>curve.getPoints(63)</Code>
          （參數等分）。綠點沿整條軌道等距；紅點在 5 → 6 段（3.3）擠在一起，在 6
          → 7 段（15.4）很稀疏。
        </p>
        <p>
          取樣數改成 8 時，紅點剛好落在 8 個控制點上，綠點只有頭尾兩點重合。把{" "}
          <Code>t</Code> 想成時間就很清楚：用 <Code>getPoint</Code>{" "}
          驅動鏡頭，每一段都分到相同的時間，6 → 7 段要用同樣的時間走將近 5
          倍的距離，速度也就快將近 5 倍。這是鏡頭必須用 <Code>getPointAt</Code>{" "}
          的理由。
        </p>
      </div>
    </NotesSection>

    <NotesSection title="旋轉的三種表示法">
      <div className="mb-4 space-y-3 text-parchment/90">
        <p>
          Euler 角把旋轉拆成依序繞三根軸的三次轉動（three 預設順序是{" "}
          <Code>XYZ</Code>
          ），像三層互相套住的環。中間那次轉到 90°
          時，第一根軸和第三根軸會重疊，兩個角度轉的是同一個方向，少了一個自由度，這就是萬向節死鎖（gimbal
          lock）。例如鏡頭仰頭看正上方時，「左右轉」和「歪頭」變成同一個動作，有些朝向的微小變化要靠角度大幅跳動才表示得出來。
        </p>
        <p>
          Quaternion
          把旋轉寫成「繞某一根軸轉某個角度」的單一動作，不是依序的三次轉動，所以沒有死鎖。three
          的 <Code>Object3D</Code> 同時有 <Code>rotation</Code> 與{" "}
          <Code>quaternion</Code>，兩者自動同步，改其中一個另一個會跟著變。
        </p>
        <p>
          注意：用 quaternion 不代表鏡頭不會翻轉。固定 up 造成的翻轉發生在{" "}
          <Code>lookAt</Code> 用外積求「右方」的那一步：前進方向與 up
          平行時參考方向失效，跟最後用哪一種表示法儲存無關，要靠 parallel
          transport 解決。
        </p>
      </div>
      <DataTable
        caption="Euler 角、旋轉矩陣與 quaternion 的比較"
        columns={ROTATION_COLUMNS}
        rows={ROTATION_ROWS}
      />
    </NotesSection>

    <ConceptList title="數學重點" items={MATH} />
    <ConceptList items={CONCEPTS} />

    <NotesSection title="Levelling：水平路段回正">
      <div className="mb-4 space-y-3 text-parchment/90">
        <p>
          Parallel transport 只保證連續，不保證朝上。<Code>LOOP_CURVE</Code>{" "}
          繞完一圈回到水平路段時，地平線歪了約 41°。Levelling 在建表的每一步，把
          up 往「與 tangent
          垂直、又最朝上的方向」拉近一點，拉多少由三個比例相乘決定。
        </p>
      </div>
      <DataTable
        caption="決定每一步回正多少的三個比例"
        columns={GATE_COLUMNS}
        rows={GATE_ROWS}
      />
      <p className="my-4 text-parchment/90">
        以臨時實作校準：只看軌道坡度不夠，迴圈頂點的 tangent
        是水平的，頭朝下的鏡頭也會被拉向世界 up。
      </p>
      <DataTable
        caption="LOOP_CURVE 上三種版本的比較"
        columns={LEVELLING_RESULT_COLUMNS}
        rows={LEVELLING_RESULT_ROWS}
      />
    </NotesSection>

    <ConceptList title="Levelling 重點" items={LEVELLING} />

    <PitfallList items={PITFALLS} />
    <VerificationList items={VERIFICATIONS} />
  </>
);

export default Notes;
