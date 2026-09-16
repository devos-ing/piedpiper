import type { CommandResult } from "./command.js";
import { agentEnvironment, runCommand } from "./command.js";

export const MAX_VERIFICATION_OUTPUT = 4_000;
const MAX_VERIFICATION_BUFFER = 256 * 1024;

export const VERIFICATION_CHECK_IDS = [
  "build",
  "typecheck",
  "biome",
  "git-whitespace",
] as const;

export type VerificationCheckId = (typeof VERIFICATION_CHECK_IDS)[number];

export interface VerificationContext {
  baseCommit: string;
  head: string;
}

export interface VerificationCommand {
  id: VerificationCheckId;
  executable: string;
  argv: string[];
  timeoutMs: number;
  maxOutputBytes: number;
}

export interface VerificationObservation {
  id: VerificationCheckId;
  executable: string;
  argv: string[];
  exitCode: number;
  output: string;
}

export interface ArgvRunnerOptions {
  cwd: string;
  env: NodeJS.ProcessEnv;
  signal?: AbortSignal;
  timeoutMs: number;
  maxBuffer: number;
}

export type ArgvRunner = (
  executable: string,
  argv: string[],
  options: ArgvRunnerOptions,
) => Promise<CommandResult>;

interface VerificationDefinition {
  executable: string;
  argv: (context: VerificationContext) => string[];
  timeoutMs: number;
  maxOutputBytes: number;
}

export const VERIFICATION_CHECKS: Readonly<
  Record<VerificationCheckId, VerificationDefinition>
> = {
  build: {
    executable: "bunx",
    argv: () => [
      "--no-install",
      "tsc",
      "-p",
      "tsconfig.build.json",
      "--noEmit",
    ],
    timeoutMs: 30 * 60 * 1000,
    maxOutputBytes: MAX_VERIFICATION_OUTPUT,
  },
  typecheck: {
    executable: "bunx",
    argv: () => ["--no-install", "tsc", "--noEmit"],
    timeoutMs: 15 * 60 * 1000,
    maxOutputBytes: MAX_VERIFICATION_OUTPUT,
  },
  biome: {
    executable: "bunx",
    argv: () => ["--no-install", "biome", "check", "src/piedpiper"],
    timeoutMs: 10 * 60 * 1000,
    maxOutputBytes: MAX_VERIFICATION_OUTPUT,
  },
  "git-whitespace": {
    executable: "git",
    argv: ({ baseCommit, head }) => [
      "diff",
      "--check",
      "--no-ext-diff",
      baseCommit,
      head,
    ],
    timeoutMs: 60_000,
    maxOutputBytes: MAX_VERIFICATION_OUTPUT,
  },
};

/** Runs one fixed verification argv through the repository command boundary. */
async function defaultArgvRunner(
  executable: string,
  argv: string[],
  options: ArgvRunnerOptions,
): Promise<CommandResult> {
  return runCommand(executable, argv, {
    cwd: options.cwd,
    env: options.env,
    signal: options.signal,
    timeoutMs: options.timeoutMs,
    maxBuffer: options.maxBuffer,
    allowFailure: true,
  });
}

/** Trims command output to the durable verification evidence bound. */
function boundedOutput(result: CommandResult, maximum: number): string {
  const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
  const marker = "\n[truncated]";
  return output.length <= maximum
    ? output
    : `${output.slice(0, Math.max(0, maximum - marker.length))}${marker}`;
}

/** Builds fixed argv commands and rejects unknown, duplicate, or empty IDs. */
export function createVerificationPlan(
  ids: unknown,
  context: VerificationContext,
): VerificationCommand[] {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Delivery requires at least one verification check");
  }
  const seen = new Set<string>();
  return ids.map((value): VerificationCommand => {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error("Verification check IDs must not be empty");
    }
    const id = value.trim();
    if (seen.has(id)) {
      throw new Error(`Duplicate verification check ID: ${id}`);
    }
    seen.add(id);
    if (!VERIFICATION_CHECK_IDS.includes(id as VerificationCheckId)) {
      throw new Error(`Unknown verification check ID: ${id}`);
    }
    const definition = VERIFICATION_CHECKS[id as VerificationCheckId];
    return {
      id: id as VerificationCheckId,
      executable: definition.executable,
      argv: definition.argv(context),
      timeoutMs: definition.timeoutMs,
      maxOutputBytes: definition.maxOutputBytes,
    };
  });
}

/** Describes a failed fixed verification run and preserves observed checks. */
export class VerificationError extends Error {
  readonly checkId: VerificationCheckId;
  readonly observed: VerificationObservation[];

  /** Creates a verification failure carrying all observations made so far. */
  constructor(
    checkId: VerificationCheckId,
    observed: VerificationObservation[],
  ) {
    super(`Verification check failed: ${checkId}`);
    this.name = "VerificationError";
    this.checkId = checkId;
    this.observed = observed;
  }
}

/** Executes selected fixed checks with bounded output and controlled environment. */
export async function runVerificationChecks(
  ids: unknown,
  options: {
    cwd: string;
    baseCommit: string;
    head: string;
    environment?: NodeJS.ProcessEnv;
    argvRunner?: ArgvRunner;
    signal?: AbortSignal;
  },
): Promise<VerificationObservation[]> {
  const plan = createVerificationPlan(ids, {
    baseCommit: options.baseCommit,
    head: options.head,
  });
  const runner = options.argvRunner ?? defaultArgvRunner;
  const environment = agentEnvironment(options.environment ?? process.env);
  const observed: VerificationObservation[] = [];
  for (const check of plan) {
    const result = await runner(check.executable, [...check.argv], {
      cwd: options.cwd,
      env: environment,
      signal: options.signal,
      timeoutMs: check.timeoutMs,
      maxBuffer: Math.max(MAX_VERIFICATION_BUFFER, check.maxOutputBytes * 8),
    });
    observed.push({
      id: check.id,
      executable: check.executable,
      argv: [...check.argv],
      exitCode: result.exitCode,
      output: boundedOutput(result, check.maxOutputBytes),
    });
    if (result.exitCode !== 0) {
      throw new VerificationError(check.id, [...observed]);
    }
  }
  return observed;
}
