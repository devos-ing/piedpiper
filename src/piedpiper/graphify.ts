import { createHash } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  agentEnvironment,
  type CommandResult,
  runCommand,
  runGit,
} from "./command.js";
import type { GraphifyMetadata } from "./review-packet.js";
import type { ChangeStore } from "./state.js";

const GRAPHIFY_TIMEOUT_MS = 30 * 60 * 1000;

export interface GraphifyRunOptions {
  cwd: string;
  env: NodeJS.ProcessEnv;
  timeoutMs: number;
  signal?: AbortSignal;
}

export type GraphifyRunner = (
  executable: string,
  argv: string[],
  options: GraphifyRunOptions,
) => Promise<CommandResult>;

/** Runs one Graphify argv without exposing a shell or ambient publication credentials. */
async function defaultGraphifyRunner(
  executable: string,
  argv: string[],
  options: GraphifyRunOptions,
): Promise<CommandResult> {
  return runCommand(executable, argv, {
    cwd: options.cwd,
    env: options.env,
    timeoutMs: options.timeoutMs,
    signal: options.signal,
    allowFailure: true,
    maxBuffer: 4 * 1024 * 1024,
  });
}

/** Returns a stable SHA-256 digest for one Graphify artifact. */
function artifactHash(value: Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Returns the durable untracked Graphify directory for one change. */
function graphifyDirectory(store: ChangeStore): string {
  return join(dirname(store.path), "graphify", store.state.id);
}

/** Builds the sanitized environment shared by Graphify subprocesses. */
function graphifyEnvironment(
  outputDirectory: string,
  environment: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  return {
    ...agentEnvironment(environment),
    GRAPHIFY_OUT: outputDirectory,
    GRAPHIFY_NO_TIPS: "1",
  };
}

/** Detects an existing Graphify CLI without installing or modifying it. */
export async function graphifyAvailable(
  cwd: string,
  runner: GraphifyRunner = defaultGraphifyRunner,
  environment: NodeJS.ProcessEnv = process.env,
): Promise<boolean> {
  try {
    const result = await runner("graphify", ["--help"], {
      cwd,
      env: graphifyEnvironment(
        join(tmpdir(), "piedpiper-graphify-detect"),
        environment,
      ),
      timeoutMs: 15_000,
    });
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

/** Reads and validates exact-head Graphify artifacts into bounded review metadata. */
async function readGraphifyMetadata(
  store: ChangeStore,
  expectedHead: string,
): Promise<GraphifyMetadata | undefined> {
  const outputDirectory = graphifyDirectory(store);
  const graphPath = join(outputDirectory, "graph.json");
  const reportPath = join(outputDirectory, "GRAPH_REPORT.md");
  try {
    const [graphBytes, reportBytes] = await Promise.all([
      readFile(graphPath),
      readFile(reportPath),
    ]);
    const value: unknown = JSON.parse(graphBytes.toString("utf8"));
    if (
      typeof value !== "object" ||
      value === null ||
      !("built_at_commit" in value) ||
      value.built_at_commit !== expectedHead
    ) {
      return undefined;
    }
    return {
      revision: expectedHead,
      graphPath,
      graphHash: artifactHash(graphBytes),
      reportPath,
      reportHash: artifactHash(reportBytes),
    };
  } catch {
    return undefined;
  }
}

/** Performs the explicitly approved first full Graphify build for the main feature worktree. */
export async function initializeGraphify(
  store: ChangeStore,
  runner: GraphifyRunner = defaultGraphifyRunner,
  environment: NodeJS.ProcessEnv = process.env,
  signal?: AbortSignal,
): Promise<GraphifyMetadata | undefined> {
  if (store.state.graphify?.choice !== "enabled" || !store.state.repoRoot) {
    return undefined;
  }
  try {
    const head = (await runGit(store.state.workspace, ["rev-parse", "HEAD"]))
      .stdout;
    const outputDirectory = graphifyDirectory(store);
    await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
    const options: GraphifyRunOptions = {
      cwd: store.state.workspace,
      env: graphifyEnvironment(outputDirectory, environment),
      timeoutMs: GRAPHIFY_TIMEOUT_MS,
      signal,
    };
    const extracted = await runner(
      "graphify",
      ["extract", store.state.workspace, "--code-only", "--max-workers", "4"],
      options,
    );
    if (extracted.exitCode !== 0) return undefined;
    const clustered = await runner(
      "graphify",
      ["cluster-only", store.state.workspace, "--no-label"],
      options,
    );
    if (clustered.exitCode !== 0) return undefined;
    if (
      (await runGit(store.state.workspace, ["rev-parse", "HEAD"])).stdout !==
      head
    ) {
      return undefined;
    }
    const metadata = await readGraphifyMetadata(store, head);
    if (metadata) {
      await store.update((state) => {
        state.graphify = { choice: "enabled", ...metadata };
      });
    }
    return metadata;
  } catch {
    return undefined;
  }
}

/** Refreshes Graphify for the exact review head and fails open to source review. */
export async function refreshGraphifyForReview(
  store: ChangeStore,
  runner: GraphifyRunner = defaultGraphifyRunner,
  environment: NodeJS.ProcessEnv = process.env,
  signal?: AbortSignal,
): Promise<GraphifyMetadata | undefined> {
  if (store.state.graphify?.choice !== "enabled" || !store.state.repoRoot) {
    return undefined;
  }
  try {
    const head = (await runGit(store.state.workspace, ["rev-parse", "HEAD"]))
      .stdout;
    const outputDirectory = graphifyDirectory(store);
    const updated = await runner(
      "graphify",
      ["update", store.state.workspace],
      {
        cwd: store.state.workspace,
        env: graphifyEnvironment(outputDirectory, environment),
        timeoutMs: GRAPHIFY_TIMEOUT_MS,
        signal,
      },
    );
    if (updated.exitCode !== 0) return undefined;
    if (
      (await runGit(store.state.workspace, ["rev-parse", "HEAD"])).stdout !==
      head
    ) {
      return undefined;
    }
    const metadata = await readGraphifyMetadata(store, head);
    if (metadata) {
      await store.update((state) => {
        state.graphify = { choice: "enabled", ...metadata };
      });
    }
    return metadata;
  } catch {
    return undefined;
  }
}
