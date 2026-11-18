import type { ReactNode } from "react";
import {
  Ar,
  Code,
  type Column,
  type Concept,
  ConceptList,
  DataTable,
  NotesHeader,
  NotesSection,
  type Pitfall,
  PitfallList,
  type Step,
  StepList,
  type Verification,
  VerificationList,
} from "@/app/lab/_components";
import { AMIRI_METRICS, DIHLI_GLYPHS } from "./dihli";

const STEPS: Step[] = [
  { id: "font-info", title: "開啟字型，印出度量值與 feature", done: true },
  {
    id: "glyph-run",
    title: (
      <>
        排版 <Ar>دهلي</Ar>，逐一印出每個 glyph
      </>
    ),
    done: true,
  },
  { id: "svg", title: "輸出成 SVG", done: true },
  { id: "compare", title: "跟瀏覽器的排版結果比對", done: true },
  { id: "noto", title: "換成 Noto Naskh Arabic 比較", done: true },
  { id: "harakat", title: "移除標音符號（stripHarakat 與測試）", done: true },
  {
    id: "extract",
    title: (
      <>
        整理成正式模組：<Code>scripts/lib/shape.ts</Code> 與 characterisation
        test
      </>
    ),
    done: true,
  },
];

type MetricRow = {
  id: string;
  font: string;
  unitsPerEm: number;
  ascent: number;
  descent: number;
};

const METRIC_COLUMNS: Column<MetricRow>[] = [
  { key: "font", label: "字型" },
  { key: "unitsPerEm", label: "unitsPerEm", numeric: true },
  { key: "ascent", label: "ascent", numeric: true },
  { key: "descent", label: "descent", numeric: true },
];

const METRIC_ROWS: MetricRow[] = [
  { id: "amiri", font: "Amiri Regular（採用）", ...AMIRI_METRICS },
  {
    id: "noto",
    font: "Noto Naskh Arabic Regular",
    unitsPerEm: 1000,
    ascent: 1069,
    descent: -634,
  },
];

type GlyphRow = {
  id: string;
  index: number;
  letter: ReactNode;
  codePoint: string;
  form: string;
  shapedId: number;
  nominalId: number;
  xAdvance: number;
};

const GLYPH_COLUMNS: Column<GlyphRow>[] = [
  { key: "index", label: "i", numeric: true },
  { key: "letter", label: "字母" },
  { key: "codePoint", label: "碼位" },
  { key: "form", label: "字形" },
  { key: "shapedId", label: "shapedId", numeric: true },
  { key: "nominalId", label: "nominalId", numeric: true },
  { key: "xAdvance", label: "xAdvance", numeric: true },
];

const GLYPH_ROWS: GlyphRow[] = DIHLI_GLYPHS.map((glyph, index) => ({
  id: glyph.codePoint,
  index,
  ...glyph,
  letter: <Ar>{glyph.letter}</Ar>,
}));

const CONCEPTS: Concept[] = [
  {
    title: "Shaping：同一個字母有不同的字形",
    body: (
      <>
        阿拉伯文的字母依照在單字裡的位置，最多有單獨、字首、字中、字尾 4
        種字形，還有合字與要疊上去的標音符號。<Code>font.layout(text)</Code>
        就是在做這件事，所以回傳的 glyph 數量不一定等於字元數量。
      </>
    ),
  },
  {
    title: "只能向右連接的字母",
    body: (
      <>
        <Ar>ا د ذ ر ز و</Ar> 只能跟前一個字母相連，不能接後一個。所以{" "}
        <Ar>دهلي</Ar> 在畫面上其實是「<Ar>د｜هلي</Ar>」兩段：<Ar>د</Ar>{" "}
        維持單獨形（id 沒變），<Ar>ه</Ar>{" "}
        則成為後一段的字首。兩段之間的空隙是正確的。
      </>
    ),
  },
  {
    title: "Feature 與 GSUB／GPOS",
    body: (
      <>
        <Code>init</Code>、<Code>medi</Code>、<Code>fina</Code> 換成位置字形，
        <Code>rlig</Code> 處理必要合字，<Code>mark</Code>、<Code>mkmk</Code>
        疊上標音符號。GSUB 負責換字形，GPOS 負責調整位置；fontkit 把兩張表的
        feature 合在一起，所以同一個 tag 可能出現兩次，要用 <Code>Set</Code>{" "}
        去除重複。沒有 <Code>isol</Code> 是正常的：預設字形本來就是單獨形。
      </>
    ),
  },
  {
    title: "字型座標：unitsPerEm、ascent、descent",
    body: (
      <>
        <Code>unitsPerEm</Code> 是一個 em 被切成幾格，字形座標都以這個單位表示。
        <Code>ascent</Code> 與 <Code>descent</Code>
        （負數）是基線上下的最大範圍。Amiri 的總高度是 1758，約 1.8
        em：阿拉伯書法上下延伸得比拉丁字母多很多。
      </>
    ),
  },
  {
    title: "Y 軸翻轉",
    body: (
      <>
        字型沿用數學慣例，Y 軸朝上；SVG 與螢幕源自掃描線，Y 軸朝下。所以要{" "}
        <Code>scale(1, -1)</Code>。翻轉後字的上半部落在負數區域，
        <Code>viewBox</Code> 的最小 y 要從 <Code>-ascent</Code>{" "}
        開始。座標分成兩段：中間階段統一用 SVG 座標（Y 軸朝下），跟 Inkscape
        匯出的 SVG 一致；寫入 JSON 前由 <Code>build-glyphs.ts</Code> 統一翻回 Y
        軸朝上，交給 three.js。<Code>ShapedText</Code> 的 <Code>ascent</Code>、
        <Code>descent</Code> 仍是字型座標，方向跟輪廓相反。
      </>
    ),
  },
  {
    title: "用一支筆依序擺放字形",
    body: (
      <>
        筆從 x = 0 開始；每個字形先 <Code>scale</Code> 再{" "}
        <Code>translate(penX + xOffset, -yOffset)</Code>，畫完才把筆往前移{" "}
        <Code>xAdvance</Code>。順序不能反：先平移再翻轉，平移量也會被翻轉。
        <Code>yOffset</Code> 是字型座標，翻轉後也要變號。
      </>
    ),
  },
  {
    title: "用瀏覽器當標準答案",
    body: (
      <>
        瀏覽器內建的排版引擎是 HarfBuzz，也就是業界標準。比對頁把同一套字型以{" "}
        <Code>@font-face</Code> 載入，上面是瀏覽器排出的文字，下面是 fontkit
        輸出的 SVG，兩邊以相同的 em 大小上下對齊，逐字比對。
      </>
    ),
  },
  {
    title: "不同字型的拆字方式不同",
    body: (
      <>
        Noto Naskh 把字尾的 <Ar>ي</Ar> 拆成「無點的字身（
        <Code>uni0649.fina</Code>）＋一個獨立的點字形」，點字形的{" "}
        <Code>codePoints</Code> 是空陣列、<Code>xAdvance</Code> 為 0，靠{" "}
        <Code>xOffset</Code>、<Code>yOffset</Code> 擺到正確位置。Amiri
        則把點畫在字身裡。<Ar>لا</Ar> 在兩套字型裡都是 2 個 glyph（各自換成{" "}
        <Code>rlig</Code> 的形狀），不是 1 個合字字形。
        <strong>
          對單元 10 的影響：輪廓要依實際位置（bbox 的 x）由右往左排序，不能依
          glyph 陣列的索引。
        </strong>
      </>
    ),
  },
];

const PITFALLS: Pitfall[] = [
  {
    title: "glyph.name 全部是 undefined",
    symptom: (
      <>
        連 <Code>glyphForCodePoint()</Code> 回傳的預設字形也沒有名稱。
      </>
    ),
    cause: (
      <>
        Amiri 的 <Code>post</Code> 表是 version 3，規格上就不存字形名稱。
      </>
    ),
    fix: (
      <>
        改比較 id：<Code>glyph.id</Code> 與{" "}
        <Code>font.glyphForCodePoint(cp).id</Code> 不同，代表 shaping
        換成了位置字形。
      </>
    ),
  },
  {
    title: "codePoints[0] 可能不存在，TypeScript 卻沒有警告",
    symptom: (
      <>
        <Code>codePoints</Code> 是空陣列時，查到的是 id 0 的{" "}
        <Code>.notdef</Code>，看起來像正常的數字。
      </>
    ),
    cause: (
      <>
        <Code>number[]</Code> 的索引在預設設定下型別是 <Code>number</Code>
        ，不包含 <Code>undefined</Code>（除非開啟{" "}
        <Code>noUncheckedIndexedAccess</Code>）。
      </>
    ),
    fix: (
      <>
        先解構 <Code>const [firstCodePoint] = codePoints</Code>，判斷是否為{" "}
        <Code>undefined</Code> 再查詢。
      </>
    ),
  },
  {
    title: "從檔案總管打開比對頁，字型沒有套用",
    symptom: "瀏覽器那一側顯示成系統預設字型，看起來像排版錯了。",
    cause: (
      <>
        用 <Code>file://</Code> 開啟 HTML
        時，有些瀏覽器會擋下以相對路徑載入的字型檔。
      </>
    ),
    fix: (
      <>
        把字型讀成 base64，以 <Code>data:font/ttf;base64,…</Code> 直接嵌進{" "}
        <Code>@font-face</Code>。
      </>
    ),
  },
  {
    title: "兩套字型的比對列顯示成同一套字型",
    symptom: "Amiri 和 Noto 兩列的瀏覽器文字長得一模一樣。",
    cause: (
      <>
        多個 <Code>@font-face</Code> 用了同一個 <Code>font-family</Code>{" "}
        名稱，最後一個宣告會覆蓋前面的。
      </>
    ),
    fix: (
      <>
        每套字型給一個唯一的名稱，例如 <Code>Test-amiri</Code>、
        <Code>Test-noto</Code>。
      </>
    ),
  },
  {
    title: "比對頁兩側的字大小不同，難以逐字對照",
    symptom: "瀏覽器文字與 SVG 一大一小，無法上下對齊比較。",
    cause: (
      <>
        CSS 的 <Code>font-size</Code> 是一個 em 的大小，SVG 的高度卻是 ascent −
        descent，兩者單位不同。
      </>
    ),
    fix: (
      <>
        SVG 高度設成 <Code>font-size × (ascent − descent) / unitsPerEm</Code>
        ，文字的 <Code>line-height</Code> 也設成相同比例。
      </>
    ),
  },
];

const VERIFICATIONS: Verification[] = [
  {
    id: "run",
    body: (
      <>
        執行 <Code>pnpm lab:01</Code>，打開{" "}
        <Code>scripts/lab/out/dihli-amiri.svg</Code>：<Ar>د</Ar>{" "}
        在最右邊，字不顛倒。
      </>
    ),
  },
  {
    id: "viewbox",
    body: (
      <>
        SVG 的 <Code>viewBox</Code> 應為 <Code>0 -1124 1566 1758</Code>
        ：寬度是 <Code>run.advanceWidth</Code>（469 + 195 + 452 + 450 =
        1566），高度是 <Code>font.ascent - font.descent</Code>（1124 − (−634) =
        1758）。
      </>
    ),
  },
  {
    id: "compare",
    body: (
      <>
        打開 <Code>scripts/lab/out/compare.html</Code>，以 <Ar>دهلي رحلة لا</Ar>{" "}
        逐字比對瀏覽器（HarfBuzz）與 fontkit
        的輸出：連寫、字形、點的位置都一致。
      </>
    ),
  },
  {
    id: "test",
    body: (
      <>
        執行 <Code>pnpm test</Code>：<Code>scripts/lib/shape.test.ts</Code>{" "}
        通過，鎖定 fontkit 3.0.0 回傳視覺順序的行為。
      </>
    ),
  },
  {
    id: "harakat",
    body: (
      <>
        <Code>pnpm lab:01</Code> 的最後一行印出{" "}
        <Code>stripHarakat keeps the outline identical: true</Code>。
      </>
    ),
  },
];

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
