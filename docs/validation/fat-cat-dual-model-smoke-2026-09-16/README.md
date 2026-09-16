# 胖貓騎單車：四路 Pied Piper 模型 smoke benchmark

日期：2026-09-16

先讀 [`BENCHMARK.md`](BENCHMARK.md)，可快速了解任務、方法、結果與用量口徑。本頁保留完整執行紀錄。

## 結論

這個題目本身不大；加入固定 SVG/CSS 動畫、桌面與手機、reduced motion、無外部資源、二元 rubric、獨立 review、一次修正與完整用量記錄後，適合作為**中型 orchestration smoke test**。它不適合用來聲稱模型排名，因為每條路由只有一個題目，而且 GLM、DeepSeek 兩組沒有交付可評分產物。

在本次 Pied Piper CLI 實測中，有兩個可用組合：

- Piper／Oracle：`openai-codex/gpt-6-astra:xhigh`
- Worker：`openai-codex/gpt-5.6-sol:medium` 或 `openai-codex/gpt-6-astra:high`

Sol 初版為 **74/100、FAIL**：總分過 70，但 G2 失敗，因鞍座與座管完全被貓身遮住。唯一修正輪後為 **92/100、PASS**，七個核心 gate 全過。新增的 Astra-high Worker 初版為 **100/100、PASS**，不需要修正輪。GLM 與 DeepSeek 各跑一次加一次允許的 transient retry；四個 Worker attempt 都以 `length` 結束，沒有 `index.html` commit，Pied Piper 因此拒絕整合。

若目標是這類中型、視覺與動畫要求密集的單檔任務，Astra-high 在本次樣本中一次通過且品質最高；Sol-medium 需要一輪修正，但實作成本較低。GLM／DeepSeek 的結果只說明目前這個 Pi/Command Code 路徑沒有完成 writer contract，不代表它們的一般能力較差。

## 執行方式

四個正式 arm、兩個 transient retry、Sol 的唯一修正輪與既有兩次有效 review，都由 Pied Piper CLI 發動；沒有使用 `astra-*-oracle` skills 代跑。Astra-high 建置也完整經 Pied Piper CLI 執行。其視覺 review 因 Pied Piper 目前的 PNG `read` 路徑連續三次以 exit 133 崩潰，且互動入口不會展開 `@image` 附件，最後改用相同 Pi runtime 的非互動 CLI 直接附圖；這個 workaround 與所有無效 reviewer 開銷均明列在 `usage.json`。使用者更正執行方式之前完成的共用規格 Oracle 只列為 shared setup 成本，不計入任何 arm 的成績或路由判定。

## 路由與結果

| 組別 | Piper | Worker 實際路由 | Attempt | 結果 |
|---|---|---|---:|---|
| A / Sol | Astra `xhigh` | GPT-5.6 Sol `medium` | 1 | 產出並整合；初評 74 FAIL；修正後 92 PASS |
| B / GLM | Astra `xhigh` | GLM-5.3-Flash `off` | 2 | 兩次 `length`；均無 commit、無產物 |
| C / DeepSeek | Astra `xhigh` | DeepSeek-V4.1-Flash `off` | 2 | 兩次 `length`；均無 commit、無產物 |
| D / Astra | Astra `xhigh` | GPT-6 Astra `high` | 1 | 產出並整合；初評 100 PASS；不需修正 |

GLM、DeepSeek 的 requested effort 是 provider default；Pied Piper 的 effective route 記錄為 `off`。報告不把它改寫成 medium 或 high。

原定匿名 A/B/C 視覺選擇無法成立：B、C 沒有可預覽產物。新增的 D 在 review 前只以匿名代號呈現。

## 用量摘要

以下 token 直接彙總 Pi JSONL 的 `input`、`cacheRead`、`cacheWrite`、`output`、`reasoning`、`totalTokens`。`reasoning` 是另列欄位，不能再加到 `totalTokens`。Elapsed 是各組 Piper session 的 wall-clock span；Worker 與 Piper 重疊，不把兩者 duration 相加。

| 階段 | Input | Cache read | Cache write | Output | Reasoning | Total tokens | 報告成本 | Piper elapsed |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Sol 初版 | 46,828 | 168,192 | 0 | 9,747 | 2,941 | 224,767 | $0.901959 | 285.681s |
| Sol 唯一修正輪 | 57,336 | 323,840 | 0 | 10,684 | 5,428 | 391,860 | $1.120674 | 356.388s |
| Sol 實作合計 | 104,164 | 492,032 | 0 | 20,431 | 8,369 | 616,627 | $2.022633 | 642.069s |
| GLM 兩次 attempt | 93,139 | 501,888 | 0 | 42,753 | 36,505 | 637,780 | $1.608150* | 1,544.687s |
| DeepSeek 兩次 attempt | 46,510 | 287,360 | 0 | 41,140 | 35,634 | 375,010 | $0.998744* | 506.888s |
| Astra-high 初版實作 | 68,455 | 344,192 | 0 | 15,856 | 5,671 | 428,503 | $1.821542 | 551.924s |
| 共用規格 Oracle | 1,168 | 0 | 0 | 6,999 | 4,018 | 8,167 | $0.361630 | 214.597s |
| Astra-high 有效 review | 12,207 | 0 | 0 | 6,471 | 5,178 | 18,678 | $0.445620 | 199.439s |
| Astra-high 無效 review overhead | 56,085 | 33,280 | 0 | 5,293 | 4,906 | 94,658 | $0.858780 | 見 `usage.json` |
| 全部 reviewer／評估 overhead | 145,837 | 233,856 | 0 | 42,354 | 37,318 | 422,047 | $3.809926 | 見 `usage.json` |
| 全部已記錄 session | 459,273 | 1,859,328 | 0 | 169,533 | 127,515 | 2,488,134 | $10.622625* | 不可直接相加比較 |

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

### Astra-high 初版：100/100，PASS

- 核心 gate：G1–G7 全部 PASS，無需修正輪。
- reviewer 認定胖貓、車體、道路透視、踩踏接觸、動畫循環、桌面／手機、reduced motion 與無障礙要求全部達標。
- 原始 review 曾先寫 C3 2/3，隨即在同一輸出更正為 3/3；報告保留原文，總分仍為 reviewer 最終宣告的 100/100。

完整結果：[`reviews/astra-high-initial.md`](reviews/astra-high-initial.md)

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

Astra-high 初版：

- [`desktop-normal.png`](evidence/astra-high-initial/desktop-normal.png)
- [`mobile-normal.png`](evidence/astra-high-initial/mobile-normal.png)
- [`desktop-reduced.png`](evidence/astra-high-initial/desktop-reduced.png)
- [`mobile-reduced.png`](evidence/astra-high-initial/mobile-reduced.png)

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
- Astra-high 初版：[`artifacts/astra-high-initial.html`](artifacts/astra-high-initial.html)
  - Change `change-cca62f3c-bcb`
  - Run `run-ca5eaa96-71c`
  - Result `result-52c89f98-f2f`
  - Worker commit `4326ecdf2b086c7b29c82b8c026fc467b3b1cb86`
  - Integrated head `187e58cfefc769fd0ebca0c77464a4ae7d932016`

原始 Pi／Pied Piper session 留在 `.scratch/benchmarks/fat-cat-dual-model/`，不複製到版本控制；`usage.json` 記錄每一條相對路徑。

## Harness 發現

1. Command Code 兩條 Flash 路由在同一份長規格下都把大量 token 消耗在 reasoning，最後碰到約 16K output length，沒有進入可整合 commit。一次重試沒有改善。
2. 這個失敗不是 reviewer 判定的視覺品質差，而是 writer contract 沒完成。對 Pied Piper 而言，無 commit 就應該拒絕整合。
3. Chrome CLI 的 `--window-size=390,844` 在 macOS headless 不能單獨證明 CSS viewport 是 390×844；最初的截圖曾因此造成假裁切。正式證據改用 CDP，並保留兩次無效 reviewer session 的 token 作為 evaluation overhead。
4. 由於錯誤的早期截圖曾把「手機裁切」放進唯一修正輪，Sol Worker 沒有處理初評後來確認的腿部關節問題。這是 benchmark harness 準確度會直接影響修正預算的實例。
5. Astra-high 的 PNG 讀取讓 Pied Piper 內嵌 Pi 程序連續三次 exit 133；互動 TUI 的 `@path` 只傳純文字，不能當 CLI file argument 展開。有效 review 因此使用 Pi 非互動附件模式，這是 harness 限制，不是模型或產物失敗。

## 限制

- 一題、每條路由一次正式 attempt，加上只限 transient failure 的 retry，不能推論長期勝率。
- GLM、DeepSeek 沒有產物，無法做原定的三件視覺盲選。
- Astra reviewer 是 rubric judge，不是人類美術評審。
- Astra-high 的正式可視 review 經相同 Pi runtime 直接附圖，不是 Pied Piper TUI 內的 review；與先前 review 執行路徑不完全相同。
- 報告成本是各 provider 透過 Pi 回報的值；不是訂閱帳單，也沒有補估 Command Code 成本。
