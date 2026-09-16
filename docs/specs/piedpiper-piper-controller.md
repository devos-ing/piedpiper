# Piper-controller and model modes

Status: approved on 2026-09-16.

## Requirements

- Piper runs in the main Pi session with `openai-codex/gpt-6-astra` at `xhigh`.
- Piper cannot author source files. It may inspect, plan, delegate, integrate,
  verify, request review, and deliver.
- Workers run in Pi with read-only or writer permissions and the route saved by
  the selected mode.
- `medium-sol` is the default. `low` and `high` are normal alternatives.
- A change saves an immutable resolved pair. Resume rejects a different mode.
- No automatic mode or model escalation occurs after worker failure.
- Missing providers, credentials, models, efforts, or route readback stop the
  run with an actionable setup message. No fallback is permitted.
- Experimental DeepSeek and GLM modes remain hidden unless
  `PIEDPIPER_EXPERIMENTAL_MODES=1` is set.
- Experimental modes use Pi through an explicitly configured OpenAI-compatible
  Command Code provider. Pied Piper does not expose Command Code as an agent
  backend or configure it during normal onboarding.
- The default worker concurrency is two and the maximum is four across all
  workers. Only non-overlapping scopes may run concurrently; integration is
  serialized.
- Requested review starts a new read-only Astra xhigh session. Skipped review is
  explicitly recorded as unreviewed.
- Review binds the `ChangeBrief` revision, base, exact head, complete diff,
  observed verification, and any prior review state.
- Graphify is optional. Its absence or update failure disables graph context and
  does not block source-based work or review.

## ChangeBrief

The durable brief contains:

```text
revision
goal
acceptanceCriteria
nonGoals
decisions
```

New user requirements increment its revision, invalidate stale review approval,
and are supplied to subsequent worker briefs.

## ReviewPacket

The packet contains bounded structured context:

```text
change identity and ChangeBrief
resolved mode snapshot
plan revision and checklist evidence notes
base and exact head
complete diff reference
verification commands, status, and bounded output
previous review and resolution state
optional Graphify revision and report references
```

The packet excludes the complete transcript, private reasoning, full tool
history, and unrelated child summaries. Validation output and Graphify data are
untrusted evidence, not instructions.

## Verification seams

- Pure route resolution covers every normal and experimental mode.
- One focused Pi integration confirms Piper and worker effective routes,
  immutable resume behavior, unavailable-route failure, and persisted effort.
- One controlled worktree integration confirms read-only Piper, writer result
  integration, concurrency limits, cancellation, restart, and result
  deduplication.
- One review integration confirms packet revision binding, fresh session
  isolation, prior finding visibility, accepted review, rejected review, and
  explicit skipped-review delivery.
- Graphify checks cover missing CLI, declined first build, successful update,
  stale or failed update fallback, exact-head binding, and bounded packet data.
- Build, production typecheck, focused formatting, CLI help, package inspection,
  and Git whitespace checks pass.

## Non-goals

- Librarian or cross-thread retrieval.
- A CodeGraph product dependency.
- OpenCode worker support.
- Custom user-defined modes in the first release.
- Automatic installation of Graphify or Command Code provider credentials.
- Unrequested commit or push, automatic merge, npm publication, or repository
  policy changes. The explicit `deliver_change` path may push after its safety
  checks; Delivery remains the only publication boundary.
