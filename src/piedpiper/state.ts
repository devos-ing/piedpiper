import { lstat, mkdir, open, readFile, rename, rm } from "node:fs/promises";
import { dirname, isAbsolute, join, parse, resolve } from "node:path";
import { type ChangeBrief, parseChangeBrief } from "./brief.js";
import {
  type PiedPiperMode,
  type RouteSnapshot,
  resolveMode,
  validateModeSnapshot,
  validateRouteSnapshot,
} from "./modes.js";
import {
  parseActivity,
  parseTaskPlan,
  reconcileToolActivity,
} from "./progress.js";

export const STATE_VERSION = 2;

export type AgentRole = "researcher" | "writer" | "reviewer" | "oracle";
export type RunStatus =
  | "queued"
  | "starting"
  | "running"
  | "cancelling"
  | "cancelled"
  | "interrupted"
  | "completed"
  | "failed";

export interface AgentRun {
  id: string;
  role: AgentRole;
  prompt: string;
  status: RunStatus;
  parentSessionId: string | null;
  deliveryOnly: boolean;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  cwd: string | null;
  sessionId: string | null;
  model: string | null;
  effort: string | null;
  permission: "read" | "write";
  scope: string[];
  briefRevision: number;
  planRevision: number;
  route: RouteSnapshot;
  effectiveRoute: RouteSnapshot | null;
  resultId: string | null;
  requestedModel?: string;
  requestedEffort?: "high";
  sessionFile?: string;
  inputGeneration?: number;
  failure?: string;
}

export interface AgentResult {
  id: string;
  runId: string;
  role: AgentRole;
  summary: string;
  cwd: string;
  baseCommit: string | null;
  commit: string | null;
  changed: boolean;
  createdAt: string;
  deliveredSessionId: string | null;
}

export interface CommandLedgerEntry {
  id: string;
  action: string;
  command?: string;
  startedAt?: string;
  finishedAt?: string;
  status: "pending" | "completed" | "unknown" | "failed" | "cancelled";
  exitCode?: number;
}

export interface ReviewFinding {
  severity: "blocking" | "nonblocking";
  message: string;
}

export interface ReviewDecision {
  decision: "accepted" | "rejected";
  findings: ReviewFinding[];
  summary?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  status: "pending" | "in_progress" | "blocked" | "completed";
  note?: string;
}

export interface TaskPlan {
  revision: number;
  updatedAt: string;
  items: ChecklistItem[];
}

export interface ToolActivity {
  owner: "main" | AgentRole;
  runId?: string;
  tool: string;
  status: "running" | "completed" | "failed" | "interrupted";
  at: string;
}

export interface ChangeState {
  version: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  repoRoot: string | null;
  commonDir: string | null;
  sourceCwd: string;
  workspace: string;
  branch: string | null;
  baseBranch: string | null;
  baseCommit: string | null;
  mainHead: string | null;
  sessionId: string | null;
  sessionFile: string | null;
  observationPack: boolean;
  mode: PiedPiperMode;
  piperRoute: RouteSnapshot;
  workerRoute: RouteSnapshot;
  requestedSettings: {
    piper: RouteSnapshot;
    worker: RouteSnapshot;
  };
  effectiveSettings: {
    piper: RouteSnapshot | null;
    worker: RouteSnapshot | null;
  };
  brief: ChangeBrief;
  workerConcurrency: number;
  reviewStatus:
    | "not_requested"
    | "requested"
    | "accepted"
    | "rejected"
    | "unreviewed"
    | "stale";
  graphify?: {
    choice: "enabled" | "declined" | "cancelled";
    revision?: string;
    graphPath?: string;
    graphHash?: string;
    reportPath?: string;
    reportHash?: string;
  };
  plan?: TaskPlan;
  activity?: ToolActivity;
  inputGeneration: number;
  phase: string;
  runs: Record<string, AgentRun>;
  results: Record<string, AgentResult>;
  integratedResultIds: string[];
  review:
    | (ReviewDecision & {
        head: string;
        base: string;
        specHash: string;
        requirementsHash?: string;
        inputGeneration: number;
        briefRevision: number;
        planRevision: number;
        packetDigest?: string;
      })
    | null;
  reviewPacket?: {
    path: string;
    digest: string;
    diffPath: string;
    diffDigest: string;
  };
  publication: {
    status: "pending" | "published" | "cancelled" | "reconcile_required";
    repository?: string | null;
    branch?: string | null;
    baseBranch?: string | null;
    baseCommit?: string;
    head?: string;
    specHash?: string;
    inputGeneration?: number;
    briefRevision?: number;
    planRevision?: number;
    reviewStatus?: "accepted" | "unreviewed";
    packetDigest?: string;
    packetPath?: string;
    diffPath?: string;
    pullRequestNumber?: number | null;
    pullRequestUrl?: string | null;
  } | null;
  commandLedger: CommandLedgerEntry[];
  integration?: {
    resultId: string;
    expectedHead: string | null;
    status: "pending" | "integrated" | "unknown" | "conflict";
    head?: string;
    error?: string;
  };
  validation?: {
    head: string;
    checks: Array<{ id: string; exitCode: number; output: string }>;
  };
}

/** Returns the empty brief used while a migrated v1 change awaits reconciliation. */
function emptyBrief(): ChangeBrief {
  return {
    revision: 0,
    goal: "",
    acceptanceCriteria: [],
    nonGoals: [],
    decisions: [],
  };
}

/** Recovers a legacy run route only when its recorded model and effort are complete. */
function recordedLegacyRoute(run: AgentRun): RouteSnapshot | undefined {
  const selected = run.requestedModel ?? run.model;
  const effort = run.requestedEffort ?? run.effort;
  if (!selected || !effort) return undefined;
  const slash = selected.indexOf("/");
  if (slash < 1 || slash === selected.length - 1) return undefined;
  try {
    return validateRouteSnapshot({
      provider: selected.slice(0, slash),
      model: selected.slice(slash + 1),
      effort,
    });
  } catch {
    return undefined;
  }
}

/** Converts a legacy v1 record into an interrupted v2 record without inventing intent. */
function migrateLegacyState(
  value: Record<string, unknown>,
  path: string,
  modeName?: string,
): ChangeState {
  if (!modeName) {
    throw new Error(
      `Pied Piper setup required: legacy change ${path} needs one explicit --mode before resume`,
    );
  }
  const resolved = resolveMode(modeName);
  const state = {
    ...value,
    version: STATE_VERSION,
    mode: resolved.mode,
    piperRoute: resolved.piper,
    workerRoute: resolved.worker,
    requestedSettings: { piper: resolved.piper, worker: resolved.worker },
    effectiveSettings: { piper: null, worker: null },
    brief: emptyBrief(),
    workerConcurrency: 2,
    reviewStatus: value.review ? "stale" : "not_requested",
    phase: "needs_replan",
  } as unknown as ChangeState;
  for (const run of Object.values(state.runs)) {
    const recordedRoute = recordedLegacyRoute(run);
    if (!run.route) run.route = recordedRoute ?? resolved.worker;
    if (!run.permission)
      run.permission = run.role === "writer" ? "write" : "read";
    if (!run.scope) run.scope = ["*"];
    if (run.briefRevision === undefined) run.briefRevision = 0;
    if (run.planRevision === undefined)
      run.planRevision = state.plan?.revision ?? 0;
    if (run.effectiveRoute === undefined) run.effectiveRoute = null;
    if (["queued", "starting", "running", "cancelling"].includes(run.status)) {
      run.status = "interrupted";
      run.finishedAt = new Date().toISOString();
      run.failure = recordedRoute
        ? "Legacy work was interrupted for explicit brief reconciliation"
        : "Legacy work was interrupted because its exact route was not recorded";
    }
  }
  if (state.review) {
    state.review.requirementsHash ??= state.review.specHash;
    state.review.briefRevision ??= 0;
    state.review.planRevision ??= state.plan?.revision ?? 0;
  }
  return state;
}

/** Validates the durable v2 controller fields before they reach runtime code. */
function validateControllerState(state: ChangeState, path: string): void {
  validateModeSnapshot(
    { mode: state.mode, piper: state.piperRoute, worker: state.workerRoute },
    process.env,
  );
  validateRouteSnapshot(state.requestedSettings.piper);
  validateRouteSnapshot(state.requestedSettings.worker);
  if (state.effectiveSettings.piper) {
    validateRouteSnapshot(state.effectiveSettings.piper);
  }
  if (state.effectiveSettings.worker) {
    validateRouteSnapshot(state.effectiveSettings.worker);
  }
  if (
    !Number.isSafeInteger(state.workerConcurrency) ||
    state.workerConcurrency < 1 ||
    state.workerConcurrency > 4 ||
    !state.brief ||
    (state.graphify !== undefined &&
      !["enabled", "declined", "cancelled"].includes(state.graphify.choice)) ||
    ![
      "not_requested",
      "requested",
      "accepted",
      "rejected",
      "unreviewed",
      "stale",
    ].includes(state.reviewStatus)
  ) {
    throw new Error(`Invalid Pied Piper controller state: ${path}`);
  }
  for (const run of Object.values(state.runs)) {
    validateRouteSnapshot(run.route);
    if (run.effectiveRoute) validateRouteSnapshot(run.effectiveRoute);
    if (
      (run.permission !== "read" && run.permission !== "write") ||
      !Array.isArray(run.scope)
    ) {
      throw new Error(`Invalid Pied Piper controller state: ${path}`);
    }
  }
}

/** Returns whether an unknown JSON value is an object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Rejects symbolic links at a durable state target. */
async function assertSafeTarget(path: string): Promise<void> {
  try {
    const stat = await lstat(path);
    if (stat.isSymbolicLink() || !stat.isFile()) {
      throw new Error(`Pied Piper state target is not a regular file: ${path}`);
    }
  } catch (error) {
    if (!isRecord(error) || error.code !== "ENOENT") throw error;
  }
}

/** Rejects symbolic-link directories in an absolute durable-state path. */
async function assertSafeParents(path: string): Promise<void> {
  const absolute = resolve(path);
  if (!isAbsolute(absolute))
    throw new Error("Pied Piper state path must be absolute");
  const root = parse(absolute).root;
  const relativeParts = dirname(absolute)
    .slice(root.length)
    .split(/[\\/]/u)
    .filter(Boolean);
  let current = root;
  for (const part of relativeParts) {
    current = join(current, part);
    const stat = await lstat(current);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new Error(
        `Pied Piper state parent is not a real directory: ${current}`,
      );
    }
  }
}

/** Writes JSON through an exclusive temporary file and atomic rename. */
export async function writeJsonAtomic(
  path: string,
  value: unknown,
): Promise<void> {
  const parent = dirname(path);
  await mkdir(parent, { recursive: true, mode: 0o700 });
  await assertSafeParents(path);
  await assertSafeTarget(path);
  const temporary = join(parent, `.${process.pid}-${crypto.randomUUID()}.tmp`);
  const handle = await open(temporary, "wx", 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await rename(temporary, path);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}

/** Loads and minimally validates one versioned Pied Piper change record. */
export async function readChange(
  path: string,
  options: { mode?: string } = {},
): Promise<ChangeState> {
  await assertSafeTarget(path);
  const value: unknown = JSON.parse(await readFile(path, "utf8"));
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.workspace !== "string" ||
    !isRecord(value.runs) ||
    !isRecord(value.results)
  ) {
    throw new Error(`Invalid Pied Piper change state: ${path}`);
  }
  const migrated =
    value.version === 1
      ? migrateLegacyState(value, path, options.mode)
      : value.version === STATE_VERSION
        ? (value as unknown as ChangeState)
        : undefined;
  if (!migrated) throw new Error(`Invalid Pied Piper change state: ${path}`);
  validateControllerState(migrated, path);
  migrated.brief = parseChangeBrief(migrated.brief);
  if (migrated.plan !== undefined) migrated.plan = parseTaskPlan(migrated.plan);
  if (migrated.activity !== undefined)
    migrated.activity = parseActivity(migrated.activity);
  return migrated;
}

/** Serializes state updates so one process remains the sole metadata writer. */
export class ChangeStore {
  #pending: Promise<unknown> = Promise.resolve();
  #observer?: () => void;

  readonly path: string;
  readonly state: ChangeState;

  /** Creates a store for one durable change file and initial state. */
  constructor(path: string, state: ChangeState) {
    this.path = path;
    this.state = state;
  }

  /** Installs the current UI observer and returns teardown that cannot detach its replacement. */
  observeChanges(observer: () => void): () => void {
    this.#observer = observer;
    return () => {
      if (this.#observer === observer) this.#observer = undefined;
    };
  }

  /** Persists the current state after applying one synchronous mutation. */
  async update(mutate: (state: ChangeState) => void): Promise<ChangeState> {
    const operation = this.#pending.then(async () => {
      mutate(this.state);
      reconcileToolActivity(this.state);
      this.state.updatedAt = new Date().toISOString();
      await writeJsonAtomic(this.path, this.state);
      try {
        this.#observer?.();
      } catch {
        process.stderr.write(
          "Pied Piper: progress display could not refresh.\n",
        );
      }
      return this.state;
    });
    this.#pending = operation.catch(() => undefined);
    return operation;
  }

  /** Waits until all queued state writes have settled successfully. */
  async flush(): Promise<void> {
    await this.#pending;
  }
}
