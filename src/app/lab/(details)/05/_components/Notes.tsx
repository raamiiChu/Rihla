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
} from "../_content/notes";
import FlowDiagram from "./FlowDiagram";

const Notes = () => (
  <>
    <NotesHeader unitId="05">
      時間軸只寫每站飛行與停留的相對權重，邊界由純函式換算。stationIndex、鏡頭的停留與
      SKIP 的落點都從同一份資料查詢，改一個數字，其他都跟著變。
    </NotesHeader>

    <NotesSection title="進度">
      <StepList items={STEPS} />
    </NotesSection>

    <NotesSection title="資料流">
      <p className="mb-4 text-parchment/90">
        會變的只有 progress。其他資料都在模組載入時算一次，每幀只做查詢。
      </p>
      <h3 className="mb-3 text-parchment">建置時算一次</h3>
      <FlowDiagram flows={BUILD_FLOWS} />
      <h3 className="mt-6 mb-3 text-parchment">每次 progress 改變</h3>
      <FlowDiagram flows={FRAME_FLOWS} />
    </NotesSection>

    <NotesSection title="示範的時間軸">
      <p className="mb-4 text-parchment/90">
        <Code>_utils/timeline.ts</Code> 的權重總和為
        33，邊界是累計權重除以總和。軌道位置來自站點所在的控制點（0、2、4），兩段飛行的長度不同，所以
        mecca 不在 0.5。
      </p>
      <DataTable
        caption="示範時間軸的權重、換算出的邊界與軌道位置"
        columns={RANGE_COLUMNS}
        rows={RANGE_ROWS}
      />
    </NotesSection>

    <NotesSection title="兩種座標">
      <p className="mb-4 text-parchment/90">
        <Code>getRailProgress</Code>{" "}
        把捲動換成軌道上的位置：用捲動算出比例，再用比例在軌道上移動。smoothstep
        的參數全部是捲動座標，lerp 的兩端全部是軌道座標。
      </p>
      <DataTable
        caption="progress、軌道 u 與比例"
        columns={COORDINATE_COLUMNS}
        rows={COORDINATE_ROWS}
      />
    </NotesSection>

    <NotesSection title="查詢函式">
      <DataTable
        caption="時間軸與鏡頭節奏的純函式"
        columns={QUERY_COLUMNS}
        rows={QUERY_ROWS}
      />
    </NotesSection>

    <ConceptList items={CONCEPTS} />
    <PitfallList items={PITFALLS} />
    <VerificationList items={VERIFICATIONS} />
  </>
);

export default Notes;
