# Piper-controller architecture

Status: implemented controller design.

Pied Piper uses one strong, read-only controller and one or more bounded workers.
The controller keeps the user conversation, decisions, checklist, integration,
and delivery state coherent. Workers receive smaller tasks and are the only
agents allowed to author code.

- [Interactive architecture](piedpiper-piper-controller/architecture.html)
- [Change workflow](piedpiper-piper-controller/workflow.html)
- [Graphify baseline](../../graphify-out/graph.html)
- [Graphify report](../../graphify-out/GRAPH_REPORT.md)

## The short version

```text
User
  ↓
Choose one immutable mode
  ↓
Piper: GPT-6 Astra xhigh
  ├─ records the brief and plan
  ├─ delegates bounded work
  ├─ integrates one result at a time
  └─ optionally requests fresh review
        ↓
Workers: mode-selected Pi sessions
        ↓
Feature worktree + verification evidence
        ↓
Reviewed or explicitly unreviewed pull request
```

Piper has read, search, planning, coordination, integration, and delivery tools.
It does not have tools that author source files. A writer receives its own
worktree; a read-only worker receives only inspection tools.

This separation is inspired by Amp's Dial and Oracle pattern. Pied Piper uses a
different control model: Piper owns the main conversation, while workers author
the change. See [Amp modes](https://ampcode.com/modes) and
[Amp Oracle](https://ampcode.com/docs/tools).

## Modes

Every change saves one immutable model pair. Resume uses the saved pair and
rejects a different mode.

| Mode | Piper | Worker | Availability |
| --- | --- | --- | --- |
| `low` | `openai-codex/gpt-6-astra`, `xhigh` | `openai-codex/gpt-5.6-terra`, `low` | Normal |
| `medium-sol` | `openai-codex/gpt-6-astra`, `xhigh` | `openai-codex/gpt-5.6-sol`, `medium` | Normal and default |
| `high` | `openai-codex/gpt-6-astra`, `xhigh` | `openai-codex/gpt-6-astra`, `high` | Normal |
| `medium-deepseek` | `openai-codex/gpt-6-astra`, `xhigh` | `command-code/deepseek/deepseek-v4.1-flash`, provider default | Development only |
| `medium-glm` | `openai-codex/gpt-6-astra`, `xhigh` | `command-code/z-ai/glm-5.3-flash`, provider default | Development only |

The development modes require `PIEDPIPER_EXPERIMENTAL_MODES=1`, an explicit Pi
provider entry, and a successful route handshake. Pied Piper does not install or
configure those models for normal users.

The local development provider is Command Code's OpenAI-compatible Provider API.
Pi remains the only agent backend. Command Code supplies model inference, not a
second agent loop.

## Context contract

Piper stores a revisioned `ChangeBrief` with the goal, acceptance criteria,
non-goals, and decisions. The plan stores ordered work and evidence notes. A
checklist item marked complete is a progress claim, not proof.

When review is requested, a new read-only Astra xhigh session receives a bounded
packet:

```text
ChangeBrief
Plan snapshot
Base and exact head
Complete diff reference
Verification commands and observed output
Previous review and current resolution state
Optional bounded Graphify context
```

The reviewer does not inherit the main transcript, Piper reasoning, full tool
history, or every child summary. It can read source and the complete diff when
the packet shows an area that needs deeper inspection.

## Graphify

Graphify is optional. Pied Piper does not install it automatically. When the CLI
is present, a new change may ask once before the first full build. Later updates
are incremental and always target the main feature worktree. Writer worktrees do
not maintain separate graphs.

Before a requested fresh review, Pied Piper updates Graphify to the exact feature
head and records the graph hash. The packet includes only bounded high-level
context such as communities, highly connected nodes, confidence counts, and the
report path. Requirements and source remain authoritative.

The pre-implementation baseline at commit `3862485` contains 1,943 nodes, 4,938
edges, and 83 communities. It is 97% extracted and 3% inferred. Run
`graphify update .` after source changes.

## Delivery and failure behavior

- Missing models or credentials stop the change and show the required setup.
- Pied Piper never silently falls back to another model.
- The default worker concurrency is two; the maximum is four.
- Only disjoint scopes run in parallel.
- Results are integrated one at a time.
- Requested review must accept the exact revision before delivery.
- Skipped review is recorded and labeled as unreviewed.
- Changing mode requires a new change; the earlier change remains resumable.

## Reading order

Start with this document and the architecture map. Use the workflow when you
need the step-by-step lifecycle. Read the canonical specification for acceptance
requirements and failure behavior. The Graphify report is supporting context for
developers investigating the current codebase.
