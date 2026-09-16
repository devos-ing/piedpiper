# Dual-model medium-effort benchmark research

Date: 2026-09-16

## Recommendation

Use GPT-5.6 Sol at `medium` for the main coding or Implement role. Use GPT-6 Astra at `high` for the read-only Oracle, Scout, and independent Review roles.

DeepSWE v1.1 supplies the missing medium-effort comparison. In its published trial artifact, Sol passed 276 of 452 scored medium-effort trials, or 61.06%. Terra passed 158 of 450, or 35.11%. Luna passed 51 of 452, or 11.28%. Astra passed 329 of 452, or 72.79%. Sol gives up 11.73 percentage points to Astra while costing less than half as much per trial in this dataset. Terra is cheaper, but its 25.95-point deficit to Sol is too large for the everyday writer default.

This pairing fits both repository designs:

- OpenAmp gets `main = openai-codex/gpt-5.6-sol` at `medium` and `oracle = openai-codex/gpt-6-astra` at `high` ([minimal plan](../design/2026-09-15-openamp-minimal-plan.md)).
- Pied Piper can map logical `luna` and `sol` profiles to Astra and logical `terra` to Sol. Scout and Review remain Astra at `high`; normal Implement uses Sol at `medium`; high-risk Implement escalates to Astra at `medium` under the existing route policy ([model routing](../../src/scheduler/model-routing.ts#L36-L55)).

DeepSWE evaluates implementation, not code review. Astra as the Oracle or reviewer is therefore a role-design inference backed by its higher coding result, the repository's existing read-only boundary, and prior live role verification. It is not a published reviewer benchmark.

## Best public anchor: DeepSWE v1.1

DeepSWE is the best current public anchor for this decision because it exposes individual trials with reasoning effort, cost, tokens, steps, duration, harness, and scoring inclusion. Its 113 original tasks cover 91 repositories and five languages. Every model uses the same `mini-swe-agent` harness, shared prompt, and `bash` tool. Its authors say the hand-written verifiers check observable behavior and each task is pinned to an immutable commit ([DeepSWE leaderboard](https://deepswe.datacurve.ai/), [methodology](https://deepswe.datacurve.ai/blog/deepswe#methodology)).

SWE-Bench Pro is a weaker anchor now. OpenAI audited it, estimated that about 30% of its tasks are broken, and retracted its earlier recommendation to adopt the benchmark ([OpenAI audit](https://openai.com/index/separating-signal-from-noise-coding-evaluations/)). The DeepSWE authors separately report far lower verifier disagreement on their reviewed sample, although that remains the benchmark owner's own audit.

### Our medium-effort aggregation

The DeepSWE website defaults to each model's best displayed configuration. The numbers below are our aggregation of the published [v1.1 trial artifact](https://deepswe.datacurve.ai/artifacts/v1.1/trials.json), not a transcription of that default leaderboard.

We selected rows where:

```text
source == "deep-swe"
eval_scope == "full"
included_in_score == true
harness == "mini-swe-agent"
reasoning_effort == "medium"
model in {gpt-5-6-sol, gpt-5-6-terra, gpt-5-6-luna, gpt-6-astra}
```

We then grouped rows by `model`, counted `passed == true`, and took arithmetic means of `cost_usd`, `n_output_tokens`, `n_agent_steps`, and `agent_duration_seconds`. The artifact uses hyphenated labels such as `gpt-5-6-sol`; these are dataset labels, not API model IDs.

| Model at medium | Passed / scored trials | Pass rate | Mean cost / trial | Mean output tokens | Mean steps | Mean duration |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| GPT-6 Astra | 329 / 452 | 72.79% | $4.380 | 20,362 | 26.03 | 884s |
| GPT-5.6 Sol | 276 / 452 | 61.06% | $1.862 | 18,425 | 30.91 | 423s |
| GPT-5.6 Terra | 158 / 450 | 35.11% | $0.583 | 11,747 | 25.15 | 230s |
| GPT-5.6 Luna | 51 / 452 | 11.28% | $0.216 | 8,180 | 23.68 | 182s |

For context, the same filter with Astra at `high` produces 331 passes from 452 trials, or 73.23%, at a mean $5.724, 26,506 output tokens, 27.42 steps, and 1,039 seconds. DeepSWE shows little implementation gain from medium to high Astra on this sample. It does not test whether high effort improves read-only planning or review, so the repository should retain its chosen high Oracle setting until role-specific evidence says otherwise.

### What the numbers support

Sol is the fit for the main writer. Compared with Terra at the same stated effort and harness, it adds 25.95 percentage points of first-pass success. Compared with Astra, it retains most of the pass rate while using 57% lower mean trial cost and about 52% less mean wall time. Fewer first-pass failures also matter in this repository because a failed implementation can trigger another attempt or review cycle.

Terra remains attractive for narrower, low-risk work, but the public medium result does not support it as the default writer. Luna is a throughput option, not a credible default for these long-horizon tasks. Astra remains the fallback for high-risk implementation and the stronger independent reader.

## OpenAI model and pricing evidence

Current OpenAI model pages position Astra for the hardest end-to-end work, Sol for complex professional work, Terra for balancing intelligence and cost, and Luna for cost-sensitive high-volume work. All four support the effort levels needed here. Standard API prices are:

| Model | Input per 1M tokens | Cached input per 1M | Output per 1M tokens |
| --- | ---: | ---: | ---: |
| GPT-6 Astra | $10.00 | $1.00 | $50.00 |
| GPT-5.6 Sol | $4.00 | $0.40 | $20.00 |
| GPT-5.6 Terra | $2.00 | $0.20 | $12.00 |
| GPT-5.6 Luna | $0.20 | $0.02 | $1.20 |

Sources: [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra), [GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol), [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra), and [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna).

API unit prices and DeepSWE's `cost_usd` field are useful comparison signals. They are not Codex subscription billing and do not predict cost per accepted repository ticket.

## Repository evidence

The repository has already verified the all-Astra mixed-effort path. Thirteen live attempts used Astra: four Implement attempts at `medium` and nine Scout or Review attempts at `high`. That report explicitly says it is not a model or savings comparison ([mixed-effort validation](../validation/role-routing-live-2026-09-09.md#what-was-verified)). OpenAmp also records one real Astra `high` Oracle consultation, but no medium main-model bake-off ([Oracle evidence](../design/2026-09-15-openamp-minimal-plan.md#oracle-slice-evidence)).

OpenAmp has also exercised the recommended pair on a real repository change. Sol at `medium` made the feature edits and ran the allowed checks. A fresh Astra reviewer at `high` accepted the exact revision with no findings. The CLI exited successfully, the host made no source edits, and Delivery opened PR #136 ([local task receipt](../../.scratch/auto/openamp-architecture-2026-09-15/live-task.json), [recorded outcome](../../.scratch/auto/openamp-architecture-2026-09-15/outcomes.jsonl)). This is one successful task, not a controlled model comparison, but it confirms that the pairing works through the actual OpenAmp path.

No additional paid benchmark is needed before using this as the preview default. Keep collecting the following evidence on ordinary medium-risk work:

1. Require provider, model, and effort readback; one trusted clean revision; unchanged acceptance checks; and exact-revision Review evidence.
2. Record input, cached input, output, and reasoning tokens, elapsed time, retries, and any startup or routing failure. Do not count cached input twice or translate subscription usage into claimed API spend.
3. If Sol fails a representative ticket, preserve the failed evidence and replay that same fixed ticket once with Astra at `medium`. Keep the source commit, ticket, verifier, Pi version, tools, sandbox, and retry policy unchanged.

This follows the repository's fixed-input and unchanged-acceptance rules without inventing a broad benchmark from routine work ([execution-efficiency specification](../specs/execution-efficiency.md), [M4 evidence style](../validation/m4-live-2026-09-09.md)).

## Limits

- DeepSWE uses a standardized `mini-swe-agent` harness, not Pi, Codex's native harness, OpenAmp, or Pied Piper prompts. The shared harness improves comparison but reduces product-specific validity.
- The 450 or 452 rows per configuration represent repeated trials over 113 tasks. They are not 452 distinct repository problems.
- Our table uses arithmetic means across included trials. The public site may show rounded pass rates, uncertainty intervals, medians, or only the best effort configuration.
- DeepSWE's cost field depends on its recorded provider usage and price assumptions. It is not the user's invoice.
- The benchmark measures writing and verification within one agent run. It does not measure independent review quality, recovery, exact-commit review, or safe cancellation.
- The recommendation is current as of the date above. Model aliases, prices, and provider availability can change.

## Decision

The best-supported dual-model pairing is GPT-5.6 Sol `medium` as the main writer and GPT-6 Astra `high` as the Oracle and independent reviewer. DeepSWE supplies the medium-effort comparison, and the existing OpenAmp delivery confirms that the pair works in this repository. Keep all-Astra as the fallback for high-risk work or a Sol failure on a fixed representative ticket.
