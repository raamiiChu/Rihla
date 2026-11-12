import {
  Code,
  type Concept,
  ConceptList,
  NotesHeader,
  type Pitfall,
  PitfallList,
  type Verification,
  VerificationList,
} from "@/app/lab/_components";

const CONCEPTS: Concept[] = [
  {
    title: "Server Component 與 Client Component",
    body: (
      <>
        App Router 的元件預設是 Server Component，只在伺服器執行。
        <Code>&apos;use client&apos;</Code>
        的意思是「這個元件<strong>也會</strong>
        在瀏覽器執行」，它仍然會先在伺服器上渲染一次 HTML，之後再到瀏覽器
        hydrate。
      </>
    ),
  },
  {
    title: "為什麼用 dynamic 搭配 ssr: false",
    body: (
      <>
        WebGL 需要瀏覽器的 <Code>window</Code> 與 <Code>&lt;canvas&gt;</Code>
        ，在伺服器上渲染 Canvas 沒有意義。<Code>dynamic</Code> 也會做 code
        splitting：three 與 R3F 打包成獨立的
        chunk，文字層與按鈕可以先變得可互動，3D 再接著載入。代價是 Canvas
        會晚一點出現，這段空檔要由 Lenis 的 fallback rAF 迴圈接手（單元 03）。
      </>
    ),
  },
  {
    title: "三層結構",
    body: (
      <>
        <Code>page.tsx</Code>（Server）→ <Code>SceneLoader</Code>（
        <Code>&apos;use client&apos;</Code>，在這裡呼叫 <Code>dynamic</Code>）→{" "}
        <Code>Scene</Code>（放 <Code>&lt;Canvas&gt;</Code>）。Next.js 16 規定{" "}
        <Code>ssr: false</Code> 只能在 Client Component 中使用。
        <Code>dynamic(...)</Code>
        要寫在模組最上層，寫在元件裡會讓每次渲染都產生新元件，Canvas
        被反覆重建。
      </>
    ),
  },
  {
    title: "layout 是整個資料夾的守門員",
    body: (
      <>
        <Code>lab/layout.tsx</Code> 包住底下所有路由，檢查一次就保護整個{" "}
        <Code>/lab</Code>。<Code>notFound()</Code> 是拋出例外，型別為{" "}
        <Code>never</Code>，呼叫後函式就中止，不需要 <Code>return</Code>。
      </>
    ),
  },
  {
    title: "VERCEL_ENV，而不是 NODE_ENV",
    body: (
      <>
        Vercel 的 preview 部署中 <Code>NODE_ENV</Code> 也是{" "}
        <Code>production</Code>，用它判斷會連 preview 一起擋掉。
        <Code>VERCEL_ENV</Code> 才能區分 <Code>production</Code> 與{" "}
        <Code>preview</Code>。它沒有 <Code>NEXT_PUBLIC_</Code>
        前綴，只有伺服器讀得到，不會打包進瀏覽器端的 JS。
      </>
    ),
  },
  {
    title: "Private folder 與 route group",
    body: (
      <>
        底線開頭的資料夾（例如 <Code>_components</Code>
        ）不會被當成路由，適合放只給這個頁面用的元件。括號包住的資料夾（例如{" "}
        <Code>(details)</Code>）是 route group：可以共用一個
        layout，但不會出現在網址裡。
      </>
    ),
  },
];

const PITFALLS: Pitfall[] = [
  {
    title: "Canvas 一片空白，卻沒有任何錯誤",
    symptom: "頁面看不到任何東西，console 也沒有錯誤。",
    cause: "Canvas 會填滿父元素；父元素沒有高度時，Canvas 的高度就是 0。",
    fix: (
      <>
        給父元素明確的高度，例如 <Code>h-dvh</Code>。<Code>dvh</Code>
        在手機上會扣掉網址列，比 <Code>h-screen</Code> 準確。
      </>
    ),
  },
  {
    title: "rotation 寫 45，轉的卻不是 45 度",
    symptom: (
      <>
        <Code>rotation=&#123;[0, 45, 0]&#125;</Code>
        看起來轉了某個角度，不容易發現有錯。
      </>
    ),
    cause:
      "three 的角度單位是弧度。45 弧度約等於轉了 7 圈多，實際角度約 58 度。",
    fix: (
      <>
        用 <Code>MathUtils.degToRad(45)</Code> 或 <Code>Math.PI / 4</Code>。
      </>
    ),
  },
  {
    title: "lint 報格式錯誤，但看不出哪裡不同",
    symptom: "Formatter would have printed the following content",
    cause: (
      <>
        VSCode 在 Windows 上新增的檔案是 CRLF 換行，Biome 要求 LF；全域的{" "}
        <Code>core.autocrlf=true</Code> 也會在 checkout 時轉成 CRLF。
      </>
    ),
    fix: (
      <>
        <Code>.gitattributes</Code> 寫入 <Code>* text=auto eol=lf</Code>，VSCode
        設定 <Code>files.eol</Code> 為 <Code>\n</Code>。
      </>
    ),
  },
  {
    title: "Vitest 讀不到 @/ 路徑別名",
    symptom: (
      <>
        <Code>@/lib/...</Code> 無法解析。
      </>
    ),
    cause: (
      <>
        Next.js 會讀 tsconfig 的 <Code>paths</Code>，但 Vitest 底層的 Vite
        預設不會。
      </>
    ),
    fix: (
      <>
        在 <Code>vitest.config.ts</Code> 設定{" "}
        <Code>resolve.tsconfigPaths: true</Code>（Vite 8 內建）。
      </>
    ),
  },
];

const VERIFICATIONS: Verification[] = [
  {
    id: "no-ssr",
    body: (
      <>
        右鍵 → 檢視原始碼，搜尋 <Code>canvas</Code>
        ：找不到，只看得到「載入中…」，代表 <Code>ssr: false</Code> 有作用。
      </>
    ),
  },
  {
    id: "production-404",
    body: (
      <>
        以 <Code>$env:VERCEL_ENV = &apos;production&apos;; pnpm dev</Code>{" "}
        啟動，<Code>/lab</Code> 會回傳 404。
      </>
    ),
  },
  {
    id: "code-splitting",
    body: (
      <>
        DevTools 的 Network 面板把網速調慢，可以看到「載入中…」先出現，three 的
        chunk 下載完才換成 Canvas。
      </>
    ),
  },
];

const Notes = () => {
  return (
    <>
      <NotesHeader unitId="00">
        建立 <Code>/lab</Code> 路由，只在正式網址封鎖；並用 <Code>dynamic</Code>{" "}
        在客戶端載入 R3F 的 <Code>&lt;Canvas&gt;</Code>
        。旁邊的方塊就是這個頁面的 Canvas。
      </NotesHeader>
      <ConceptList items={CONCEPTS} />
      <PitfallList items={PITFALLS} />
      <VerificationList items={VERIFICATIONS} />
    </>
  );
};

export default Notes;
