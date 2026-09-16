# 胖貓騎單車：三路 Pied Piper 雙模型 smoke benchmark

日期：2026-09-16

## 結論

這個題目本身不大；加入固定 SVG/CSS 動畫、桌面與手機、reduced motion、無外部資源、二元 rubric、獨立 review、一次修正與完整用量記錄後，適合作為**中型 orchestration smoke test**。它不適合用來聲稱模型排名，因為每條路由只有一個題目，而且 GLM、DeepSeek 兩組沒有交付可評分產物。

在本次 Pied Piper CLI 實測中，唯一可用組合是：

- Piper／Oracle：`openai-codex/gpt-6-astra:xhigh`
- Worker：`openai-codex/gpt-5.6-sol:medium`

Sol 初版為 **74/100、FAIL**：總分過 70，但 G2 失敗，因鞍座與座管完全被貓身遮住。唯一修正輪後為 **92/100、PASS**，七個核心 gate 全過。GLM 與 DeepSeek 各跑一次加一次允許的 transient retry；四個 Worker attempt 都以 `length` 結束，沒有 `index.html` commit，Pied Piper 因此拒絕整合。

這支持「目前這個 Pied Piper + Pi/Command Code 路徑選 Sol medium」的工程決策；它只說明此路徑在這個題目的可靠性，不代表 GLM 或 DeepSeek 的一般能力較差。

## 執行方式

三個正式 arm、兩個 transient retry、兩次有效 Astra review，以及 Sol 的唯一修正輪，全部由 Pied Piper CLI 發動；沒有使用 `astra-*-oracle` skills 代跑。只有在使用者更正執行方式之前完成的共用規格 Oracle 是直接 Pi session，因此它只列為 shared setup 成本，不計入任何 arm 的成績或路由判定。

## 路由與結果

| 組別 | Piper | Worker 實際路由 | Attempt | 結果 |
|---|---|---|---:|---|
| A / Sol | Astra `xhigh` | GPT-5.6 Sol `medium` | 1 | 產出並整合；初評 74 FAIL；修正後 92 PASS |
| B / GLM | Astra `xhigh` | GLM-5.3-Flash `off` | 2 | 兩次 `length`；均無 commit、無產物 |
| C / DeepSeek | Astra `xhigh` | DeepSeek-V4.1-Flash `off` | 2 | 兩次 `length`；均無 commit、無產物 |

GLM、DeepSeek 的 requested effort 是 provider default；Pied Piper 的 effective route 記錄為 `off`。報告不把它改寫成 medium 或 high。

原定匿名 A/B/C 視覺選擇無法成立：B、C 沒有可預覽產物。A 的身份因此直接揭露為 Sol 組。

## 用量摘要

以下 token 直接彙總 Pi JSONL 的 `input`、`cacheRead`、`cacheWrite`、`output`、`reasoning`、`totalTokens`。`reasoning` 是另列欄位，不能再加到 `totalTokens`。Elapsed 是各組 Piper session 的 wall-clock span；Worker 與 Piper 重疊，不把兩者 duration 相加。

| 階段 | Input | Cache read | Cache write | Output | Reasoning | Total tokens | 報告成本 | Piper elapsed |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Sol 初版 | 46,828 | 168,192 | 0 | 9,747 | 2,941 | 224,767 | $0.901959 | 285.681s |
| Sol 唯一修正輪 | 57,336 | 323,840 | 0 | 10,684 | 5,428 | 391,860 | $1.120674 | 356.388s |
| Sol 實作合計 | 104,164 | 492,032 | 0 | 20,431 | 8,369 | 616,627 | $2.022633 | 642.069s |
| GLM 兩次 attempt | 93,139 | 501,888 | 0 | 42,753 | 36,505 | 637,780 | $1.608150* | 1,544.687s |
| DeepSeek 兩次 attempt | 46,510 | 287,360 | 0 | 41,140 | 35,634 | 375,010 | $0.998744* | 506.888s |
| 共用規格 Oracle | 1,168 | 0 | 0 | 6,999 | 4,018 | 8,167 | $0.361630 | 214.597s |
| 全部 reviewer／評估 overhead | 77,545 | 200,576 | 0 | 30,590 | 27,234 | 308,711 | $2.505526 | 見 `usage.json` |
| 全部已記錄 session | 322,526 | 1,481,856 | 0 | 141,913 | 111,760 | 1,946,295 | $7.496683* | 不可直接相加比較 |

`*` Command Code Worker 的 cost 在 Pi 原始紀錄中為 provider-reported `0`。表中保留原值，沒有估算或宣稱免費；GLM／DeepSeek 的報告成本實際上只反映 Astra Piper 成本。

完整逐 session 數據、時間戳、stop reason、raw session 相對路徑與 cost status 在 [`usage.json`](usage.json)。

## 評分

### 初版：74/100，FAIL

- 核心 gate：G2 FAIL；其餘 G1、G3–G7 PASS。
- 鞍座與座管被不透明貓身完全遮住，無法辨識承重坐姿。
- 腿部以曲柄中心作為近似膝關節，雖保持踏板接觸，視覺上不自然。
- 雲帶 18 秒循環在桌面側邊可見重置。

完整結果：[`reviews/sol-initial.md`](reviews/sol-initial.md)

### 唯一修正版：92/100，PASS

- 核心 gate：G1–G7 全部 PASS。
- 鞍座／座管與承重關係已可辨識；桌面與 390×844 手機均完整、無捲軸；reduced-motion 靜態構圖完整。
- 尚未解決：腿部仍以剛性 360° 轉動維持踏板接觸，V2 與 M4 扣 8 分。
- 修正政策只允許一輪，因此保留 finding，不再繼續改。

完整結果：[`reviews/sol-corrected.md`](reviews/sol-corrected.md)

## 截圖證據

全部正式證據使用 Google Chrome `152.0.7977.83`，CDP device-metrics override，DPR 1、100% zoom，fresh load 後 2,000ms 擷取。capture script 在每次擷取前驗證：

- `innerWidth`／`innerHeight` 精確等於 1440×900 或 390×844；
- `devicePixelRatio === 1`；
- document `scrollWidth`／`scrollHeight` 等於 viewport。

初版：

- [`desktop-normal.png`](evidence/initial/desktop-normal.png)
- [`mobile-normal.png`](evidence/initial/mobile-normal.png)
- [`desktop-reduced.png`](evidence/initial/desktop-reduced.png)
- [`mobile-reduced.png`](evidence/initial/mobile-reduced.png)

修正版：

- [`desktop-normal.png`](evidence/corrected/desktop-normal.png)
- [`mobile-normal.png`](evidence/corrected/mobile-normal.png)
- [`desktop-reduced.png`](evidence/corrected/desktop-reduced.png)
- [`mobile-reduced.png`](evidence/corrected/mobile-reduced.png)

Capture implementation：[`capture-evidence.mjs`](capture-evidence.mjs)

## 產物與執行識別

- Frozen spec：[`spec.md`](spec.md)
- Sol 初版：[`artifacts/sol-initial.html`](artifacts/sol-initial.html)
  - Change `change-401942eb-83c`
  - Run `run-77a72922-597`
  - Result `result-950aedd1-06f`
  - Integrated head `c9c8392bb8ebfa2b76619ad61c2a959e3697c47f`
- Sol 修正版：[`artifacts/sol-corrected.html`](artifacts/sol-corrected.html)
  - Change `change-1e810976-4a0`
  - Run `run-1cb2b1f0-cbf`
  - Result `result-5b795eb5-25b`
  - Integrated head `b87d2120e7b2e47433b8f86eb24f64a9f6325277`
- GLM 第一次：`run-3ec60118-502` / `result-212581f2-938`
- GLM 重試：`run-9d10e7e7-b47` / `result-e3306429-2be`
- DeepSeek 第一次：`run-bcd83151-e25` / `result-eacd8d05-6c7`
- DeepSeek 重試：`run-2dc98754-75d` / `result-2c111ea2-f39`

原始 Pi／Pied Piper session 留在 `.scratch/benchmarks/fat-cat-dual-model/`，不複製到版本控制；`usage.json` 記錄每一條相對路徑。

## Harness 發現

1. Command Code 兩條 Flash 路由在同一份長規格下都把大量 token 消耗在 reasoning，最後碰到約 16K output length，沒有進入可整合 commit。一次重試沒有改善。
2. 這個失敗不是 reviewer 判定的視覺品質差，而是 writer contract 沒完成。對 Pied Piper 而言，無 commit 就應該拒絕整合。
3. Chrome CLI 的 `--window-size=390,844` 在 macOS headless 不能單獨證明 CSS viewport 是 390×844；最初的截圖曾因此造成假裁切。正式證據改用 CDP，並保留兩次無效 reviewer session 的 token 作為 evaluation overhead。
4. 由於錯誤的早期截圖曾把「手機裁切」放進唯一修正輪，Sol Worker 沒有處理初評後來確認的腿部關節問題。這是 benchmark harness 準確度會直接影響修正預算的實例。

## 限制

- 一題、每條路由一次正式 attempt 加一次僅限 transient failure 的 retry，不能推論長期勝率。
- GLM、DeepSeek 沒有產物，無法做原定的三件視覺盲選。
- Astra reviewer 是 rubric judge，不是人類美術評審。
- 報告成本是各 provider 透過 Pi 回報的值；不是訂閱帳單，也沒有補估 Command Code 成本。
