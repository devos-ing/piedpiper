export const PIPER_ROUTE = {
  provider: "openai-codex",
  model: "gpt-6-astra",
  effort: "xhigh",
} as const;

export type PiedPiperMode =
  | "low"
  | "medium-sol"
  | "high"
  | "medium-deepseek"
  | "medium-glm";

export type RouteEffort =
  | "off"
  | "minimal"
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max"
  | "default";

export interface RouteSnapshot {
  provider: string;
  model: string;
  effort: RouteEffort;
}

interface ModeDefinition {
  mode: PiedPiperMode;
  worker: RouteSnapshot;
  experimental: boolean;
}

const MODES: readonly ModeDefinition[] = [
  {
    mode: "low",
    worker: {
      provider: "openai-codex",
      model: "gpt-5.6-terra",
      effort: "low",
    },
    experimental: false,
  },
  {
    mode: "medium-sol",
    worker: {
      provider: "openai-codex",
      model: "gpt-5.6-sol",
      effort: "medium",
    },
    experimental: false,
  },
  {
    mode: "high",
    worker: {
      provider: "openai-codex",
      model: "gpt-6-astra",
      effort: "high",
    },
    experimental: false,
  },
  {
    mode: "medium-deepseek",
    worker: {
      provider: "command-code",
      model: "deepseek/deepseek-v4.1-flash",
      effort: "default",
    },
    experimental: true,
  },
  {
    mode: "medium-glm",
    worker: {
      provider: "command-code",
      model: "z-ai/glm-5.3-flash",
      effort: "default",
    },
    experimental: true,
  },
];

/** Returns whether development-only modes are enabled for this process. */
function experimentalModesEnabled(environment: NodeJS.ProcessEnv): boolean {
  return environment.PIEDPIPER_EXPERIMENTAL_MODES === "1";
}

/** Lists the modes visible to the current user. */
export function availableModes(
  environment: NodeJS.ProcessEnv = process.env,
): PiedPiperMode[] {
  return MODES.filter(
    (definition) =>
      !definition.experimental || experimentalModesEnabled(environment),
  ).map((definition) => definition.mode);
}

/** Resolves one visible mode to its immutable Piper and worker route pair. */
export function resolveMode(
  requested = "medium-sol",
  environment: NodeJS.ProcessEnv = process.env,
): { mode: PiedPiperMode; piper: RouteSnapshot; worker: RouteSnapshot } {
  if (!availableModes(environment).includes(requested as PiedPiperMode)) {
    throw new Error(
      `Pied Piper setup required: mode "${requested}" is unavailable; choose one of ${availableModes(environment).join(", ")}`,
    );
  }
  const definition = MODES.find((candidate) => candidate.mode === requested);
  if (!definition) {
    throw new Error(
      `Pied Piper setup required: unsupported mode "${requested}"`,
    );
  }
  return {
    mode: definition.mode,
    piper: { ...PIPER_ROUTE },
    worker: { ...definition.worker },
  };
}

/** Validates a persisted route snapshot without allowing route substitution. */
export function validateRouteSnapshot(value: unknown): RouteSnapshot {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Pied Piper setup required: persisted route is invalid");
  }
  const route = value as Record<string, unknown>;
  if (
    typeof route.provider !== "string" ||
    typeof route.model !== "string" ||
    ![
      "off",
      "minimal",
      "low",
      "medium",
      "high",
      "xhigh",
      "max",
      "default",
    ].includes(String(route.effort))
  ) {
    throw new Error("Pied Piper setup required: persisted route is invalid");
  }
  return {
    provider: route.provider,
    model: route.model,
    effort: route.effort as RouteEffort,
  };
}

/** Validates that a persisted mode still contains its original immutable pair. */
export function validateModeSnapshot(
  value: unknown,
  environment: NodeJS.ProcessEnv = process.env,
): { mode: PiedPiperMode; piper: RouteSnapshot; worker: RouteSnapshot } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Pied Piper setup required: persisted mode is invalid");
  }
  const record = value as Record<string, unknown>;
  const resolved = resolveMode(String(record.mode), environment);
  const piper = validateRouteSnapshot(record.piper);
  const worker = validateRouteSnapshot(record.worker);
  if (
    JSON.stringify(piper) !== JSON.stringify(resolved.piper) ||
    JSON.stringify(worker) !== JSON.stringify(resolved.worker)
  ) {
    throw new Error(
      "Pied Piper setup required: persisted mode route does not match its catalog",
    );
  }
  return { mode: resolved.mode, piper, worker };
}
