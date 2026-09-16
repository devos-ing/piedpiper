<p align="center">
  <img src="output/imagegen/pied-piper-avatar-cute.png" alt="Pied Piper 專案頭像" width="220" />
</p>

# Pied Piper

[English](README.md) · [繁體中文](README.zh-HK.md)

Pied Piper 是以 Pi 建立的本地互動 coding CLI。Piper 負責保持使用者對話、
需求、計畫及交付狀態一致，而且本身只有讀取權限。真正修改程式碼的是
Worker；writer Worker 會在獨立 Git worktree 內工作，並只可修改獲分配的範圍。

```text
你 → 選擇固定 mode → Piper（Astra xhigh、唯讀）
                       ├─ 維護 ChangeBrief 與計畫
                       ├─ 委派有範圍的 Worker
                       ├─ 逐一整合結果
                       └─ 按需要啟動全新 Reviewer
                                      ↓
                         已審查或明確標示未審查的 PR
```

這個 controller 模式受 Amp Dial／Oracle 啟發，但 Pied Piper 自己負責固定模型
組合、context packet、整合及交付邊界，並不是複製 Amp 的實作。

## 環境需求

- Node.js 22.19 或以上
- Git 與 GitHub CLI
- 已在 Pi 登入並可用的所選模型
- 目標專案本身的 build 工具

## 開始使用

```bash
npm install --global piedpiper
piedpiper
```

互動啟動會要求選擇 mode，預設游標在 `medium-sol`。非互動建立必須指定：

```bash
piedpiper --mode medium-sol
piedpiper --mode low --max-workers 2 --base main
piedpiper --resume change-abc123def456
```

每個 change 都會保存解析後的模型組合及 Worker 上限。Resume 不可更改；若想
換 mode，請建立新 change。模型、登入、provider 或有效 route 無法確認時會停止
並顯示設定指引，不會暗中 fallback 或升級模型。

| Mode | Piper | Worker |
| --- | --- | --- |
| `low` | GPT-6 Astra，`xhigh` | GPT-5.6 Terra，`low` |
| `medium-sol` | GPT-6 Astra，`xhigh` | GPT-5.6 Sol，`medium` |
| `high` | GPT-6 Astra，`xhigh` | GPT-6 Astra，`high` |

Command Code provider 的開發測試 route 只會在
`PIEDPIPER_EXPERIMENTAL_MODES=1` 時顯示。Pi 仍是唯一 agent backend；一般安裝
流程不會安裝或設定實驗 provider。

## 工作如何流動

Pied Piper 會建立專用 `piedpiper/<change-id>` 功能 worktree，啟動它的原 checkout
及未提交檔案不會被移動或提交。

- Piper 保存有 revision 的 `ChangeBrief` 及 checklist。
- Worker 會收到 `read`／`write` 權限、路徑範圍、目前 brief 與 plan revision。
- 預設最多同時兩個 Worker，上限四個；重疊的寫入範圍會排隊。
- Writer 結果會先核對 ownership scope，再逐一整合。
- Delivery 只可選產品定義的 verification check ID，不接受模型提交 shell 指令。
- 要求 Review 時，會建立全新的 Astra xhigh 唯讀 session，並以不可變 packet
  綁定 brief、plan、base、精確 head、完整 diff 及驗證證據。
- 跳過 Review 會明確記為未審查；是否 merge 只由使用者決定。

目前 check ID 為 `build`、`typecheck`、`biome` 及 `git-whitespace`。它們假設
repository 使用 Pied Piper 的 Bun／TypeScript／Biome locked toolchain；不支援的
repository 會停止，不會改為接受任意 shell 指令。

互動命令：

- `/plan` 展開或收起 checklist 及證據備註。
- `/agents` 顯示 Worker 與 Reviewer 狀態。
- `/agent-send <run-id> <message>` 向執行中的 Worker 補充指令。
- `/agent-cancel <run-id>` 取消指定 Worker，不會重新啟動整個 change。
- Pi 原生登入、session、取消與 compaction 指令仍可使用；Pied Piper 保存的 route
  仍是執行依據。

不在 Git repository 時，Pied Piper 仍提供可恢復的 Pi 對話，但停用 writer 委派
及 PR 交付。只有明確啟動的 Delivery 可在安全檢查後 push、建立或更新 PR；它
永不 merge 或啟用 auto-merge。

## Context 與可選 Graphify

最終 Reviewer 不會繼承主對話全文、Piper 私有 reasoning、完整 tool history 或
無關 Worker 摘要。它收到的是有界 ReviewPacket，並可按需要讀取分開保存的完整
diff 及 source。

Graphify 完全可選。若電腦已安裝 Graphify CLI，Pied Piper 會在首次完整 index 前
詢問一次；不會自動安裝。之後只在主要 feature worktree、要求 Review 前更新。
CLI 不存在、更新失敗或資料 stale 時會省略 graph context，繼續用 source 審查。

## 了解架構

先看兩個互動頁面：

- [Piper 架構圖](docs/design/piedpiper-piper-controller/architecture.html)
- [Change workflow](docs/design/piedpiper-piper-controller/workflow.html)

再按需要閱讀 [架構指南](docs/architecture.md)、
[核准設計](docs/design/piedpiper-piper-controller.md) 及
[規格](docs/specs/piedpiper-piper-controller.md)。實作前的 code graph 可看
[Graphify 互動圖](graphify-out/graph.html) 或
[文字報告](graphify-out/GRAPH_REPORT.md)。

## 開發

```bash
bun install --frozen-lockfile
bun run build
bun run typecheck
```

Pied Piper 以 TypeScript 實作，npm package 只包含編譯後的
`dist/piedpiper` runtime。`openamp` 沒有 executable alias。舊 `.openamp` change
state 可透過明確 migration 繼續使用，舊檔案不會被改寫。

產品歷史：[CHANGELOG.md](CHANGELOG.md)。

授權：[Apache 2.0](LICENSE)。
