import type { ChangeStore } from "./state.js";

export interface ChangeBrief {
  revision: number;
  goal: string;
  acceptanceCriteria: string[];
  nonGoals: string[];
  decisions: string[];
}

/** Parses and bounds the durable requirements brief. */
export function parseChangeBrief(value: unknown): ChangeBrief {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("ChangeBrief must be an object");
  }
  const brief = value as Record<string, unknown>;
  const list = (name: string): string[] => {
    const values = brief[name];
    if (
      !Array.isArray(values) ||
      values.length > 32 ||
      values.some(
        (item) => typeof item !== "string" || item.trim().length === 0,
      )
    ) {
      throw new Error(`ChangeBrief.${name} must contain bounded text items`);
    }
    return values.map((item) => item.trim().slice(0, 1000));
  };
  if (
    !Number.isSafeInteger(brief.revision) ||
    Number(brief.revision) < 0 ||
    typeof brief.goal !== "string" ||
    brief.goal.length > 4000
  ) {
    throw new Error("ChangeBrief has an invalid revision or goal");
  }
  return {
    revision: Number(brief.revision),
    goal: brief.goal.trim(),
    acceptanceCriteria: list("acceptanceCriteria"),
    nonGoals: list("nonGoals"),
    decisions: list("decisions"),
  };
}

/** Reconciles new requirements against the expected brief revision. */
export async function updateChangeBrief(
  store: ChangeStore,
  expectedRevision: number,
  value: Omit<ChangeBrief, "revision">,
): Promise<ChangeBrief> {
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
    throw new Error("Invalid expected ChangeBrief revision");
  }
  const next = parseChangeBrief({
    ...value,
    revision: expectedRevision + 1,
  });
  await store.update((state) => {
    if (state.brief.revision !== expectedRevision) {
      throw new Error(
        "ChangeBrief changed; read the current revision before updating it",
      );
    }
    state.brief = next;
    state.inputGeneration += 1;
    state.reviewStatus =
      state.reviewStatus === "not_requested" ? "not_requested" : "stale";
    state.phase = "needs_replan";
  });
  return next;
}

/** Renders only the bounded brief fields for a controller or worker prompt. */
export function briefContext(brief: ChangeBrief): string {
  return [
    `ChangeBrief revision ${brief.revision}`,
    `Goal: ${brief.goal || "(reconciliation required)"}`,
    "Acceptance criteria:",
    ...(brief.acceptanceCriteria.length
      ? brief.acceptanceCriteria.map((item) => `- ${item}`)
      : ["- (none recorded)"]),
    "Non-goals:",
    ...(brief.nonGoals.length
      ? brief.nonGoals.map((item) => `- ${item}`)
      : ["- (none recorded)"]),
    "Decisions:",
    ...(brief.decisions.length
      ? brief.decisions.map((item) => `- ${item}`)
      : ["- (none recorded)"]),
  ].join("\n");
}
