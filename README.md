<p align="center">
  <img src="output/imagegen/pied-piper-avatar-cute.png" alt="Pied Piper project avatar" width="220" />
</p>

# Pied Piper

[English](README.md) · [繁體中文](README.zh-HK.md)

Pied Piper is a local, interactive coding CLI built on Pi. Piper keeps the user
conversation, requirements, plan, and delivery state coherent. Piper is
read-only: Workers are the only agents that author code, each inside a bounded
scope and, for writers, an isolated Git worktree.

```text
You → choose one mode → Piper (Astra xhigh, read-only)
                         ├─ plans and tracks the ChangeBrief
                         ├─ delegates scoped Workers
                         ├─ integrates results one at a time
                         └─ optionally starts a fresh Reviewer
                                      ↓
                         verified or explicitly unreviewed PR
```

The controller pattern is inspired by Amp's Dial and Oracle. Pied Piper's
implementation is different: the controller owns the main session, model pair,
context packet, integration, and delivery boundary.

## Requirements

- Node.js 22.19 or newer
- Git and GitHub CLI
- The selected models authenticated and available through Pi
- The target project's own build tools

## Start

```bash
npm install --global piedpiper
piedpiper
```

An interactive start asks for a mode and initially selects `medium-sol`.
Non-interactive creation must name it:

```bash
piedpiper --mode medium-sol
piedpiper --mode low --max-workers 2 --base main
piedpiper --resume change-abc123def456
```

Each change saves the resolved model pair and worker limit. Resume cannot change
either; choose a new change when you want another mode. Missing credentials,
models, or effective-route confirmation stops with a setup message. Pied Piper
never silently falls back or escalates.

| Mode | Piper | Worker |
| --- | --- | --- |
| `low` | GPT-6 Astra, `xhigh` | GPT-5.6 Terra, `low` |
| `medium-sol` | GPT-6 Astra, `xhigh` | GPT-5.6 Sol, `medium` |
| `high` | GPT-6 Astra, `xhigh` | GPT-6 Astra, `high` |

Development-only Command Code provider routes are hidden behind
`PIEDPIPER_EXPERIMENTAL_MODES=1`. Pi remains the only agent backend; normal
onboarding does not install or configure experimental providers.

## How work moves

Pied Piper creates a dedicated `piedpiper/<change-id>` feature worktree, leaving
the checkout where it was launched—including uncommitted files—unchanged.

- Piper records a revisioned `ChangeBrief` and checklist.
- A Worker receives `read` or `write` permission, a path scope, the current brief,
  and relevant plan revision.
- Two Workers may run by default, up to four. Overlapping write scopes queue.
- Writer results are checked against their ownership scope and integrated
  serially.
- Delivery runs fixed verification check IDs, never model-supplied shell text.
- Requested Review uses a fresh read-only Astra xhigh session and an immutable
  packet bound to the brief, plan, base, exact head, complete diff, and evidence.
- Skipped Review is recorded as unreviewed. Only the user decides whether to
  merge.

The current check IDs are `build`, `typecheck`, `biome`, and `git-whitespace`.
They assume the repository uses the locked Bun/TypeScript/Biome toolchain used by
Pied Piper; unsupported repositories stop rather than accepting a replacement
shell command.

Useful interactive commands:

- `/plan` expands or collapses the saved checklist and evidence notes.
- `/agents` shows Worker and Reviewer state.
- `/agent-send <run-id> <message>` steers one active Worker.
- `/agent-cancel <run-id>` cancels one Worker without restarting it.
- Pi's native login, session, cancellation, and compaction commands remain
  available. The saved Pied Piper route remains authoritative.

Outside a Git repository, Pied Piper keeps a durable Pi conversation but disables
writer delegation and PR delivery. Delivery alone may push and create or update a
PR after its safety checks; it never merges or enables auto-merge.

## Context and optional Graphify

The final Reviewer does not inherit the main transcript, private reasoning, full
tool history, or unrelated child summaries. It receives a bounded ReviewPacket
and can inspect the separately stored complete diff and source when needed.

Graphify is optional. When its CLI is already installed, Pied Piper asks once
before the first full architecture index. It never installs Graphify. Updates run
only in the main feature worktree before requested Review; missing, failed, or
stale graph data is omitted and source-based review continues.

## Understand the architecture

Start with the two interactive views:

- [Piper architecture map](docs/design/piedpiper-piper-controller/architecture.html)
- [Change workflow](docs/design/piedpiper-piper-controller/workflow.html)

Then use [the architecture guide](docs/architecture.md) for component ownership,
[the approved design](docs/design/piedpiper-piper-controller.md) for rationale,
and [the specification](docs/specs/piedpiper-piper-controller.md) for exact
requirements. The pre-implementation code graph is available as an
[interactive Graphify graph](graphify-out/graph.html) and
[text report](graphify-out/GRAPH_REPORT.md).

## Development

```bash
bun install --frozen-lockfile
bun run build
bun run typecheck
```

Pied Piper is implemented in TypeScript. npm packages contain the compiled
`dist/piedpiper` Node.js runtime. `openamp` has no executable alias. Matching
legacy `.openamp` change state remains readable through an explicit migration;
legacy files are left unchanged.

Product history: [CHANGELOG.md](CHANGELOG.md).

License: [Apache 2.0](LICENSE).
