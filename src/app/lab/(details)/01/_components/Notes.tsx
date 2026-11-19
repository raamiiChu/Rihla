import {
  Ar,
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
  GLYPH_COLUMNS,
  GLYPH_ROWS,
  METRIC_COLUMNS,
  METRIC_ROWS,
  PITFALLS,
  STEPS,
  VERIFICATIONS,
} from "../_content/notes";

const Notes = () => (
  <>
    <NotesHeader unitId="01">
      驗證 fontkit 能不能正確排出阿拉伯文：這是整個專案最大的技術風險。旁邊是用
      Amiri 排出 <Ar>دهلي</Ar> 的結果，虛線標出每個字形的位置與 xAdvance。
    </NotesHeader>

    <NotesSection title="進度">
      <StepList items={STEPS} />
    </NotesSection>

    <NotesSection title="目前的結論">
      <ul className="list-disc space-y-2 ps-5 text-parchment/90 marker:text-muted-foreground/70">
        <li>
          fontkit 回傳的 <Code>glyphs</Code> 是<strong>視覺順序</strong>
          ：第 0 個是畫面最左邊的 <Ar>ي</Ar>，所以筆從 x = 0 往右走即可。
        </li>
        <li>
          兩套字型排出的 <Ar>دهلي رحلة لا</Ar> 都跟瀏覽器（HarfBuzz）一致，包括
          Noto 用偏移量擺放的點。fontkit 可以用在這個專案。
        </li>
        <li>
          <strong>採用 Amiri</strong>：與 DOM 引言使用的字型一致，而且以 Bulaq
          印刷體為基礎的古典 Naskh 風格，符合 14
          世紀的主題。霓虹燈管般的輪廓效果，到單元 10 再確認一次。
        </li>
        <li>
          排版邏輯已整理到 <Code>scripts/lib/shape.ts</Code>：
          <Code>layoutText</Code> 回傳 SVG 座標的純資料（每個字形一個{" "}
          <Code>d</Code>），單元 10 直接取用。
        </li>
      </ul>
    </NotesSection>

    <NotesSection title="量測數據">
      <div className="space-y-6">
        <DataTable
          caption="字型度量值"
          columns={METRIC_COLUMNS}
          rows={METRIC_ROWS}
        />
        <DataTable
          caption={
            <>
              Amiri 排版 <Ar>دهلي</Ar> 的每個 glyph
            </>
          }
          columns={GLYPH_COLUMNS}
          rows={GLYPH_ROWS}
        />
      </div>
    </NotesSection>

    <ConceptList items={CONCEPTS} />
    <PitfallList items={PITFALLS} />
    <VerificationList items={VERIFICATIONS} />
  </>
);

export default Notes;
