# Pied Piper architecture

Pied Piper is a local Node.js CLI built on Pi's TUI, model runtime, tools, and
session manager. It has no daemon, backlog database, web service, or merge
worker. One durable change owns one immutable model pair.

```text
User
  │ requirements and decisions
  ▼
Piper — GPT-6 Astra xhigh, read-only main Pi session
  ├─ ChangeBrief + plan
  ├─ Supervisor ──▶ scoped read/write Workers (selected mode)
  ├─ Workspace  ──▶ isolated writer worktrees ──▶ serial integration
  ├─ Verification catalog ──▶ fixed argv checks
  ├─ optional Graphify ──▶ bounded exact-head metadata
  └─ Delivery ──▶ fresh Reviewer ──▶ reviewed/unreviewed GitHub PR
```

For a visual version, open the
[interactive architecture map](design/piedpiper-piper-controller/architecture.html)
and [change workflow](design/piedpiper-piper-controller/workflow.html).

## Controller and routes

`src/piedpiper/modes.ts` is the route catalog. Piper is always
`openai-codex/gpt-6-astra` at `xhigh`. `low`, `medium-sol`, and `high` select the
Worker route. Experimental Command Code provider routes are hidden unless the
development flag is set.

`src/piedpiper/routes.ts` activates a route through Pi and reads it back before a
prompt is sent. A missing provider, model, credential, unsupported effort, or
mismatch stops the run. Resume validates the persisted snapshot and rejects
mode or concurrency changes; it never substitutes another model.

The main session tool allowlist contains inspection, planning, delegation,
integration, verification, and delivery tools. It omits `bash`, `edit`, and
`write`; the extension also blocks Pi's native user-bash route. Piper therefore
coordinates code changes but cannot author them through supported product paths.

## Module ownership

- `src/piedpiper/cli.ts` creates or resumes a change, selects the immutable mode,
  starts the pinned Piper session, and handles optional plugin/Graphify choices.
- `src/piedpiper/brief.ts` owns the revisioned goal, acceptance criteria,
  non-goals, and decisions. New requirements invalidate current approval without
  deleting previous findings.
- `src/piedpiper/extension.ts` exposes Piper's bounded tools and native status
  widgets. Product-facing roles are Piper, Worker, and Reviewer.
- `src/piedpiper/supervisor.ts` owns Pi RPC children, route handshakes, capacity,
  overlapping-scope admission, steering, cancellation, cleanup, and result-first
  delivery. The default is two active Workers and the saved maximum cannot exceed
  four.
- `src/piedpiper/workspace.ts` creates the feature and writer worktrees, validates
  Git identity and owned paths, commits Worker results, and serializes
  integration.
- `src/piedpiper/verification.ts` maps public check IDs to fixed executables and
  argv. Model-authored shell strings never cross the verification boundary.
- `src/piedpiper/review-packet.ts` validates and hashes the bounded context passed
  to a fresh Reviewer.
- `src/piedpiper/graphify.ts` optionally maintains one exact-head graph for the
  main feature worktree. It never installs Graphify and fails open to source
  inspection.
- `src/piedpiper/delivery.ts` owns verification, immutable packet/diff artifacts,
  fresh Review, publication intent, command ledger, remote reconciliation, and
  PR create/update. It has no merge operation.
- `src/piedpiper/state.ts` atomically stores coordination evidence under the Git
  common directory. Pi remains the transcript owner; credentials, private
  reasoning, and full tool output are not copied into change state.

The current verification catalog contains `build`, `typecheck`, `biome`, and
`git-whitespace`. These fixed commands target the repository's locked
Bun/TypeScript/Biome toolchain; adding support for another project shape requires
an explicit product code change, not model-supplied shell.

## Change and review context

The ChangeBrief and checklist are separate. A completed checklist item is a
progress claim, not proof. Updating either makes any accepted/requested Review
stale while preserving the prior decision and findings for the next packet.

Before requested Review, Delivery writes two immutable files:

1. a structured ReviewPacket JSON with change identity, brief, mode snapshot,
   plan evidence, base/head, check observations, prior review, and optional
   Graphify references;
2. a separate complete binary base-to-head diff with its own digest.

The packet excludes the main transcript, private reasoning, full tool history,
and unrelated Worker summaries. Check and Graphify output are untrusted data.
Acceptance is bound to packet digest, requirements hash, input generation,
brief/plan revisions, base, and exact head, and is rechecked immediately before
publication. Skipping Review is stored as `unreviewed`, never `accepted`.

## Optional Graphify

When an existing Graphify CLI is detected, a new interactive change asks once
before the first full code graph. Decline or cancellation is persisted so resume
does not ask repeatedly. Runtime graph artifacts live beside durable Pied Piper
state, outside the feature worktree.

Requested Review triggers an incremental update. Pied Piper checks the graph's
`built_at_commit`, hashes `graph.json` and `GRAPH_REPORT.md`, and rechecks the Git
head. Missing CLI, failed commands, malformed output, stale revision, or missing
files simply omit graph metadata. The Reviewer then uses source and the complete
diff.

The repository also contains a pre-implementation
[interactive Graphify baseline](../graphify-out/graph.html) and
[report](../graphify-out/GRAPH_REPORT.md) for contributors.

## Safety and recovery

The source checkout is never the feature workspace, so its dirty files are not
moved or committed. Writer changes must stay inside their normalized ownership
scope. Agent environments omit GitHub, npm, askpass, and SSH-agent credentials.
These controls protect supported product paths; they are not an OS sandbox
against malicious same-user code.

Workers may create local result commits in their isolated worktrees. Only
explicit Delivery may push or create/update a PR. It checks the remote base,
exact local head, ReviewPacket binding, and PR readback, and records uncertain
remote results before retry. It never calls merge or enables auto-merge.

Each change keeps stable branch/workspace/session identity, runs, results,
integration state, Review binding, publication record, and command ledger.
Restart marks unconfirmed children interrupted rather than replaying them under a
new route. Cancellation moves coordination to `needs_replan`. Duplicate result
messages, conflicts, and uncertain Git outcomes are reconciled without resets.

New state lives under `<git-common-dir>/piedpiper/changes`; non-repository state
lives under `~/.piedpiper/changes`. A legacy v1 or `.openamp` record requires an
explicit mode and brief reconciliation; legacy files remain unchanged.

## Further reading

- [Approved controller design](design/piedpiper-piper-controller.md)
- [Canonical specification](specs/piedpiper-piper-controller.md)
- [Historical architecture](legacy/)
