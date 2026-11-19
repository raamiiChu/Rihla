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
  PITFALLS,
  READ_COLUMNS,
  READ_ROWS,
  RENDER_COLUMNS,
  RENDER_ROWS,
  STEPS,
  VERIFICATIONS,
} from "../_content/notes";

const Notes = () => (
  <>
    <NotesHeader unitId="02">
      捲動進度寫入 zustand store，高頻的 <Code>progress</Code> 與低頻的{" "}
      <Code>stationIndex</Code> 用不同方式讀取。這一頁本身就是 Lenis
      平滑捲動的示範，往下捲動就會更新 store。
    </NotesHeader>

    <NotesSection title="進度">
      <StepList items={STEPS} />
    </NotesSection>

    <NotesSection title="結論">
      <ul className="list-disc space-y-2 ps-5 text-parchment/90 marker:text-muted-foreground/70">
        <li>
          同一個 store，
          <strong>
            高頻欄位用 <Code>getState()</Code> 讀
          </strong>
          ，低頻欄位用 selector 訂閱。用 selector 訂閱 progress
          的元件，捲動時會每幀重新渲染。
        </li>
        <li>
          Lenis 設 <Code>autoRaf: false</Code>，由自己的 rAF 迴圈驅動，並在{" "}
          <Code>useEffect</Code> 的 cleanup 中依反序完整清理。 這條迴圈就是單元
          03 的 fallback 迴圈。
        </li>
        <li>
          store 已搬進正式專案的 <Code>src/stores/scroll.ts</Code>
          。stationIndex 目前還是寫死的邊界陣列，單元 05 改成從 timeline 讀取。
        </li>
      </ul>
    </NotesSection>

    <NotesSection title="zustand 的三種讀寫方式">
      <DataTable
        caption="zustand 的讀寫方式與重新渲染"
        columns={READ_COLUMNS}
        rows={READ_ROWS}
      />
    </NotesSection>

    <NotesSection title="重新渲染比較">
      <DataTable
        caption="三種讀取方式在捲動時的重新渲染"
        columns={RENDER_COLUMNS}
        rows={RENDER_ROWS}
      />
    </NotesSection>

    <ConceptList items={CONCEPTS} />
    <PitfallList items={PITFALLS} />
    <VerificationList items={VERIFICATIONS} />
  </>
);

export default Notes;
