# 胖貓騎單車模型 benchmark

日期：2026-09-16

這份 benchmark 比較 Pied Piper 在一個中型前端任務上的模型路由。任務要求 Worker 建立一個自包含的動畫網頁，再由獨立 reviewer 按固定 rubric 評分。報告同時記錄 token、cache、成本、時間、重試與未完成的 attempt。

這是一個 smoke benchmark。每條路由只有一個題目，因此結果適合用來檢查路由可靠性，不適合當成一般模型排名。

## Benchmark 要回答的問題

這次執行檢查三件事：

- Worker 能否在 Pied Piper 的 commit contract 內交付可整合產物。
- 產物能否通過相同的視覺、動畫、響應式與無障礙要求。
- 路由完成任務時用了多少 input、cache read、cache write、output、reasoning、時間與成本。

## 固定任務

每個 Worker 收到相同的 [`spec.md`](spec.md)。Worker 只能建立一個 `index.html`，內容是一隻胖橘貓在道路上騎腳踏車。

產物必須符合以下要求：

- 使用作者自行編寫的 SVG 與 CSS，不載入外部資源。
- 清楚畫出胖貓、完整腳踏車、道路透視與周邊景物。
- 車輪、曲柄、踏板、腳、尾巴、圍巾及雲朵需要形成連續動畫。
- 桌面 1440×900 與手機 390×844 都不能裁切或出現捲軸。
- `prefers-reduced-motion: reduce` 必須停用動畫並保留完整靜態構圖。
- SVG 必須包含可辨識的標題、描述與圖片角色。

## 模型路由

所有正式實作都由 Pied Piper CLI 發動。Piper 固定使用 `openai-codex/gpt-6-astra:xhigh`。只有 Worker 路由不同。

| 組別 | Worker | Effort |
|---|---|---|
| Sol | `openai-codex/gpt-5.6-sol` | `medium` |
| GLM | `command-code/z-ai/glm-5.3-flash` | provider default，實際記錄為 `off` |
| DeepSeek | `command-code/deepseek/deepseek-v4.1-flash` | provider default，實際記錄為 `off` |
| Astra | `openai-codex/gpt-6-astra` | `high` |

每組先執行一次正式 attempt。只有 `length` 這類暫時性失敗可以重試一次。產物若未通過 review，Worker 只能進行一次修正。

## 評分方式

獨立 Astra xhigh reviewer 依同一份二元 rubric 檢查原始碼與四張截圖。總分是 100 分，分成以下六類：

| 類別 | 分數 |
|---|---:|
| 需求完整度 | 30 |
| 構圖、比例、顏色與辨識度 | 25 |
| 動畫品質 | 15 |
| 桌面與手機呈現 | 15 |
| 程式碼品質 | 10 |
| Reduced motion 與無障礙 | 5 |

通過條件同時要求總分至少 70，並通過 G1 至 G7 七個核心 gate。總分達標但任何核心 gate 失敗，結果仍是 FAIL。

## 截圖證據

Capture script 透過 Chrome DevTools Protocol 固定 viewport、DPR 及 reduced-motion 狀態。每張圖在 fresh load 後等待 2,000ms 再擷取。

正式證據使用以下條件：

- Google Chrome `152.0.7977.83`
- DPR 1
- 100% zoom
- 桌面 1440×900
- 手機 390×844
- normal motion 與 reduced motion 各一張
- `scrollWidth` 與 `scrollHeight` 必須等於 viewport

Capture script 位於 [`capture-evidence.mjs`](capture-evidence.mjs)。

## 結果

| Worker | Attempts | 產物 | Review | Total tokens | 報告成本 | Piper elapsed |
|---|---:|---|---|---:|---:|---:|
| GPT-6 Astra high | 1 | 有 | 初版 100 PASS | 428,503 | $1.821542 | 551.924s |
| GPT-5.6 Sol medium | 1 加 1 次修正 | 有 | 初版 74 FAIL，修正後 92 PASS | 616,627 | $2.022633 | 642.069s |
| GLM-5.3 Flash | 2 | 無 | 無法評分 | 637,780 | $1.608150* | 1,544.687s |
| DeepSeek-V4.1 Flash | 2 | 無 | 無法評分 | 375,010 | $0.998744* | 506.888s |

`*` Command Code Worker 在 Pi 原始紀錄中的 provider-reported cost 是 0。表中的成本只反映 Astra Piper，報告沒有估算 Flash Worker 的價格。

### Astra high

Astra high 初版得到 100/100，七個核心 gate 全部通過。它一次完成腳踏接觸、遮擋關係、道路透視、動畫循環、兩種 viewport、reduced motion 與無障礙要求，因此沒有修正輪。

這條路由的初版成本約是 Sol 初版的兩倍。若把 Sol 的修正輪算入，Astra high 的總 token 與報告成本反而較低。單一樣本無法證明這個關係會在其他任務重現。

### Sol medium

Sol medium 初版得到 74/100。總分超過門檻，但鞍座與座管被貓身完全遮住，導致 G2 失敗。唯一修正輪把結果提高到 92/100，七個核心 gate 全部通過。

Sol 初版只用了 224,767 total tokens，報告成本是 $0.901959。它是較省的第一次嘗試，但本題需要修正才能交付。

### GLM 與 DeepSeek Flash

兩條 Flash 路由各執行兩次。四個 attempt 都以 `length` 結束，沒有產生 `index.html` commit。Pied Piper 因此拒絕整合。

這是 writer contract 失敗，不是視覺評分失敗。沒有產物就不能判斷畫面品質。

## 用量口徑

[`usage.json`](usage.json) 逐條保存 Pi JSONL 回報的數據。彙總欄位採用以下定義：

- `input` 是未命中 cache 的輸入 token。
- `cacheRead` 是從 provider cache 讀取的 token。
- `cacheWrite` 是寫入 provider cache 的 token。本次全部為 0。
- `output` 包含 provider 回報的輸出 token。
- `reasoning` 是另列的輸出子集，不能再加到 `totalTokens`。
- `totalTokens` 直接使用 Pi 回報值。
- `cost` 直接使用 provider 經 Pi 回報的值，不代表訂閱帳單。
- `durationMs` 是 session span 的總和。Piper 與 Worker 可能重疊，因此不能把總和當成關鍵路徑時間。

四個正式 arm、shared setup 與 reviewer overhead 合計如下：

| Input | Cache read | Cache write | Output | Reasoning | Total tokens | 報告成本 |
|---:|---:|---:|---:|---:|---:|---:|
| 459,273 | 1,859,328 | 0 | 169,533 | 127,515 | 2,488,134 | $10.622625 |

## Reviewer 基礎設施問題

Astra high 產物的 Pied Piper PNG `read` 連續三次以 exit 133 結束。Pied Piper TUI 也把 `@image` 當成純文字，不能建立圖片附件。

有效 review 最後使用相同 Pi runtime 的非互動附件模式。三次 PNG crash 與一次無附件嘗試都保留在 `usage.json`，結果標為無效且不計入品質分數。這四次嘗試共使用 94,658 total tokens，報告成本是 $0.858780。

## 如何閱讀這個結果

本題最清楚的訊號是首次交付可靠性。Astra high 一次產出 100 分結果。Sol medium 可以交付，但需要修正。兩條 Flash 路由沒有完成 commit contract。

不要用這份結果推論長期勝率。要比較一般能力，需要增加不同任務類型，為每條路由執行多個隨機種子，並統一 reviewer 的圖片傳輸方式。

## 相關檔案

- [`README.md`](README.md) 保存完整執行報告與 run ID。
- [`spec.md`](spec.md) 是所有 Worker 共用的 frozen spec。
- [`usage.json`](usage.json) 保存逐 session 用量、時間戳與結果。
- [`artifacts/astra-high-initial.html`](artifacts/astra-high-initial.html) 是 Astra high 產物。
- [`artifacts/sol-initial.html`](artifacts/sol-initial.html) 是 Sol 初版。
- [`artifacts/sol-corrected.html`](artifacts/sol-corrected.html) 是 Sol 修正版。
- [`reviews/astra-high-initial.md`](reviews/astra-high-initial.md) 是 Astra high 盲評。
- [`reviews/sol-initial.md`](reviews/sol-initial.md) 與 [`reviews/sol-corrected.md`](reviews/sol-corrected.md) 是 Sol 評分。
- `evidence/` 保存所有正式桌面與手機截圖。
