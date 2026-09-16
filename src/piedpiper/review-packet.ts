import { createHash } from "node:crypto";
import { isAbsolute } from "node:path";
import { type ChangeBrief, parseChangeBrief } from "./brief.js";
import {
  type PiedPiperMode,
  type RouteSnapshot,
  validateRouteSnapshot,
} from "./modes.js";
import type { ReviewDecision, ReviewFinding } from "./state.js";
import {
  MAX_VERIFICATION_OUTPUT,
  type VerificationCheckId,
  type VerificationObservation,
} from "./verification.js";

const FULL_SHA = /^[0-9a-f]{64}$/u;
const COMMIT_SHA = /^[0-9a-f]{40}$/u;
const IDENTIFIER = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/u;
const MODES: readonly PiedPiperMode[] = [
  "low",
  "medium-sol",
  "high",
  "medium-deepseek",
  "medium-glm",
];
const MAX_FINDINGS = 32;
const MAX_PLAN_EVIDENCE = 12;

export interface PlanEvidenceNote {
  id: string;
  text: string;
  status: "pending" | "in_progress" | "blocked" | "completed";
  note?: string;
}

export interface CompleteDiffReference {
  path: string;
  sha256: string;
  bytes: number;
}

export interface GraphifyMetadata {
  revision?: string;
  graphPath?: string;
  graphHash?: string;
  reportPath?: string;
  reportHash?: string;
}

export interface PriorReviewState extends ReviewDecision {
  base: string;
  head: string;
  requirementsHash: string;
  inputGeneration: number;
  briefRevision: number;
  planRevision: number;
  packetDigest?: string;
}

export interface ReviewPacket {
  schemaVersion: 1;
  changeId: string;
  brief: ChangeBrief;
  mode: {
    name: PiedPiperMode;
    piper: RouteSnapshot;
    worker: RouteSnapshot;
  };
  plan: {
    revision: number;
    evidenceNotes: PlanEvidenceNote[];
  };
  requirements: string;
  requirementsHash: string;
  inputGeneration: number;
  base: string;
  head: string;
  completeDiff: CompleteDiffReference;
  verification: VerificationObservation[];
  priorReview: PriorReviewState | null;
  graphify?: GraphifyMetadata;
  digest: string;
}

export interface ReviewPacketInput {
  changeId: string;
  brief: ChangeBrief;
  mode: ReviewPacket["mode"];
  planRevision: number;
  planEvidence: PlanEvidenceNote[];
  requirements: string;
  requirementsHash: string;
  inputGeneration: number;
  base: string;
  head: string;
  completeDiff: CompleteDiffReference;
  verification: VerificationObservation[];
  priorReview: PriorReviewState | null;
  graphify?: GraphifyMetadata;
}

/** Returns whether a value is a non-null JSON record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Rejects unexpected keys from a bounded packet record. */
function assertKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
  label: string,
): void {
  const allowed = new Set(keys);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new Error(`${label} contains an unsupported field`);
  }
}

/** Requires bounded non-empty text at a packet boundary. */
function boundedText(value: unknown, maximum: number, label: string): string {
  if (typeof value !== "string" || !value.trim() || value.length > maximum) {
    throw new Error(`${label} must contain bounded non-empty text`);
  }
  return value.trim();
}

/** Requires a valid commit SHA-1 at a packet boundary. */
function commitSha(value: unknown, label: string): string {
  if (typeof value !== "string" || !COMMIT_SHA.test(value)) {
    throw new Error(`${label} must be a full commit SHA`);
  }
  return value;
}

/** Requires a valid SHA-256 digest at a packet boundary. */
function sha256(value: unknown, label: string): string {
  if (typeof value !== "string" || !FULL_SHA.test(value)) {
    throw new Error(`${label} must be a SHA-256 digest`);
  }
  return value;
}

/** Returns a recursively key-sorted JSON-compatible value for stable hashing. */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => canonicalize(item));
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

/** Hashes UTF-8 text with SHA-256. */
export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Hashes exact bytes with SHA-256. */
export function hashBytes(value: Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Returns the stable digest of a packet body without its digest field. */
function digestPacketBody(value: Omit<ReviewPacket, "digest">): string {
  return sha256Hex(JSON.stringify(canonicalize(value)) ?? "");
}

/** Validates bounded review findings and returns a copied list. */
function validateFindings(value: unknown): ReviewFinding[] {
  if (!Array.isArray(value) || value.length > MAX_FINDINGS) {
    throw new Error("Review findings are not bounded");
  }
  return value.map((finding, index): ReviewFinding => {
    if (!isRecord(finding)) {
      throw new Error(`Review finding ${index} is invalid`);
    }
    assertKeys(finding, ["severity", "message"], `Review finding ${index}`);
    if (finding.severity !== "blocking" && finding.severity !== "nonblocking") {
      throw new Error(`Review finding ${index} has an invalid severity`);
    }
    return {
      severity: finding.severity,
      message: boundedText(finding.message, 1_000, "Review finding message"),
    };
  });
}

/** Validates one prior review record without retaining unrelated review data. */
function validatePriorReview(value: unknown): PriorReviewState | null {
  if (value === null) return null;
  if (!isRecord(value))
    throw new Error("Prior review must be an object or null");
  assertKeys(
    value,
    [
      "decision",
      "findings",
      "summary",
      "base",
      "head",
      "requirementsHash",
      "inputGeneration",
      "briefRevision",
      "planRevision",
      "packetDigest",
    ],
    "Prior review",
  );
  if (value.decision !== "accepted" && value.decision !== "rejected") {
    throw new Error("Prior review has an invalid decision");
  }
  if (
    !Number.isSafeInteger(value.inputGeneration) ||
    Number(value.inputGeneration) < 0 ||
    !Number.isSafeInteger(value.briefRevision) ||
    Number(value.briefRevision) < 0 ||
    !Number.isSafeInteger(value.planRevision) ||
    Number(value.planRevision) < 0
  ) {
    throw new Error("Prior review revisions are invalid");
  }
  return {
    decision: value.decision,
    findings: validateFindings(value.findings),
    ...(value.summary === undefined
      ? {}
      : { summary: boundedText(value.summary, 4_000, "Review summary") }),
    base: commitSha(value.base, "Prior review base"),
    head: commitSha(value.head, "Prior review head"),
    requirementsHash: sha256(
      value.requirementsHash,
      "Prior review requirements hash",
    ),
    inputGeneration: Number(value.inputGeneration),
    briefRevision: Number(value.briefRevision),
    planRevision: Number(value.planRevision),
    ...(value.packetDigest === undefined
      ? {}
      : {
          packetDigest: sha256(
            value.packetDigest,
            "Prior review packet digest",
          ),
        }),
  };
}

/** Validates bounded checklist evidence notes. */
function validatePlanEvidence(value: unknown): PlanEvidenceNote[] {
  if (!Array.isArray(value) || value.length > MAX_PLAN_EVIDENCE) {
    throw new Error("Review packet plan evidence is not bounded");
  }
  const ids = new Set<string>();
  return value.map((entry, index): PlanEvidenceNote => {
    if (!isRecord(entry)) throw new Error(`Plan evidence ${index} is invalid`);
    assertKeys(
      entry,
      ["id", "text", "status", "note"],
      `Plan evidence ${index}`,
    );
    const id = boundedText(entry.id, 40, "Plan evidence ID");
    if (!IDENTIFIER.test(id) || ids.has(id)) {
      throw new Error("Plan evidence IDs must be unique and bounded");
    }
    ids.add(id);
    if (
      entry.status !== "pending" &&
      entry.status !== "in_progress" &&
      entry.status !== "blocked" &&
      entry.status !== "completed"
    ) {
      throw new Error(`Plan evidence ${index} has an invalid status`);
    }
    return {
      id,
      text: boundedText(entry.text, 160, "Plan evidence text"),
      status: entry.status,
      ...(entry.note === undefined
        ? {}
        : { note: boundedText(entry.note, 240, "Plan evidence note") }),
    };
  });
}

/** Validates fixed verification observations and their bounded evidence. */
function validateVerification(value: unknown): VerificationObservation[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Review packet requires verification observations");
  }
  const ids = new Set<string>();
  return value.map((entry, index): VerificationObservation => {
    if (!isRecord(entry)) {
      throw new Error(`Verification observation ${index} is invalid`);
    }
    assertKeys(
      entry,
      ["id", "executable", "argv", "exitCode", "output"],
      `Verification observation ${index}`,
    );
    const id = boundedText(entry.id, 40, "Verification ID");
    if (!IDENTIFIER.test(id) || ids.has(id)) {
      throw new Error("Verification IDs must be unique and bounded");
    }
    ids.add(id);
    if (
      !Array.isArray(entry.argv) ||
      entry.argv.length > 32 ||
      entry.argv.some(
        (argument) => typeof argument !== "string" || argument.length > 400,
      )
    ) {
      throw new Error(`Verification argv ${index} is invalid`);
    }
    if (!Number.isSafeInteger(entry.exitCode)) {
      throw new Error(`Verification exit code ${index} is invalid`);
    }
    return {
      id: id as VerificationCheckId,
      executable: boundedText(entry.executable, 80, "Verification executable"),
      argv: entry.argv.map((argument) => String(argument)),
      exitCode: Number(entry.exitCode),
      output:
        typeof entry.output === "string" &&
        entry.output.length <= MAX_VERIFICATION_OUTPUT
          ? entry.output
          : (() => {
              throw new Error(`Verification output ${index} is unbounded`);
            })(),
    };
  });
}

/** Validates one complete immutable diff reference. */
function validateDiff(value: unknown): CompleteDiffReference {
  if (!isRecord(value)) throw new Error("Review packet diff is invalid");
  assertKeys(value, ["path", "sha256", "bytes"], "Review packet diff");
  const path = boundedText(value.path, 4_000, "Complete diff path");
  if (!isAbsolute(path)) throw new Error("Complete diff path must be absolute");
  if (!Number.isSafeInteger(value.bytes) || Number(value.bytes) < 0) {
    throw new Error("Complete diff byte count is invalid");
  }
  return {
    path,
    sha256: sha256(value.sha256, "Complete diff digest"),
    bytes: Number(value.bytes),
  };
}

/** Validates optional exact-head Graphify references without trusting report text. */
function validateGraphify(value: unknown): GraphifyMetadata {
  if (!isRecord(value)) throw new Error("Graphify metadata is invalid");
  assertKeys(
    value,
    ["revision", "graphPath", "graphHash", "reportPath", "reportHash"],
    "Graphify metadata",
  );
  const metadata: GraphifyMetadata = {};
  if (value.revision !== undefined) {
    metadata.revision = commitSha(value.revision, "Graphify revision");
  }
  for (const [pathKey, hashKey] of [
    ["graphPath", "graphHash"],
    ["reportPath", "reportHash"],
  ] as const) {
    const path = value[pathKey];
    const hash = value[hashKey];
    if ((path === undefined) !== (hash === undefined)) {
      throw new Error(
        `Graphify ${pathKey} and ${hashKey} must appear together`,
      );
    }
    if (path !== undefined) {
      const boundedPath = boundedText(path, 4_000, `Graphify ${pathKey}`);
      if (!isAbsolute(boundedPath)) {
        throw new Error(`Graphify ${pathKey} must be absolute`);
      }
      metadata[pathKey] = boundedPath;
      metadata[hashKey] = sha256(hash, `Graphify ${hashKey}`);
    }
  }
  return metadata;
}

/** Validates a complete review packet and its stable digest. */
export function validateReviewPacket(value: unknown): ReviewPacket {
  if (!isRecord(value)) throw new Error("Review packet must be an object");
  assertKeys(
    value,
    [
      "schemaVersion",
      "changeId",
      "brief",
      "mode",
      "plan",
      "requirements",
      "requirementsHash",
      "inputGeneration",
      "base",
      "head",
      "completeDiff",
      "verification",
      "priorReview",
      "graphify",
      "digest",
    ],
    "Review packet",
  );
  if (value.schemaVersion !== 1) {
    throw new Error("Unsupported review packet schema");
  }
  const brief = parseChangeBrief(value.brief);
  if (!isRecord(value.mode)) throw new Error("Review packet mode is invalid");
  assertKeys(value.mode, ["name", "piper", "worker"], "Review packet mode");
  if (!MODES.includes(value.mode.name as PiedPiperMode)) {
    throw new Error("Review packet mode name is invalid");
  }
  const piper = validateRouteSnapshot(value.mode.piper);
  const worker = validateRouteSnapshot(value.mode.worker);
  if (!isRecord(value.plan)) throw new Error("Review packet plan is invalid");
  assertKeys(value.plan, ["revision", "evidenceNotes"], "Review packet plan");
  if (
    !Number.isSafeInteger(value.plan.revision) ||
    Number(value.plan.revision) < 0
  ) {
    throw new Error("Review packet plan revision is invalid");
  }
  if (
    !Number.isSafeInteger(value.inputGeneration) ||
    Number(value.inputGeneration) < 0
  ) {
    throw new Error("Review packet input generation is invalid");
  }
  const requirements = boundedText(value.requirements, 16_000, "Requirements");
  const packet: ReviewPacket = {
    schemaVersion: 1,
    changeId: boundedText(value.changeId, 80, "Change ID"),
    brief,
    mode: {
      name: value.mode.name as PiedPiperMode,
      piper,
      worker,
    },
    plan: {
      revision: Number(value.plan.revision),
      evidenceNotes: validatePlanEvidence(value.plan.evidenceNotes),
    },
    requirements,
    requirementsHash: sha256(value.requirementsHash, "Requirements hash"),
    inputGeneration: Number(value.inputGeneration),
    base: commitSha(value.base, "Review packet base"),
    head: commitSha(value.head, "Review packet head"),
    completeDiff: validateDiff(value.completeDiff),
    verification: validateVerification(value.verification),
    priorReview: validatePriorReview(value.priorReview),
    ...(value.graphify === undefined
      ? {}
      : { graphify: validateGraphify(value.graphify) }),
    digest: sha256(value.digest, "Review packet digest"),
  };
  if (sha256Hex(requirements) !== packet.requirementsHash) {
    throw new Error(
      "Review packet requirements hash does not match requirements",
    );
  }
  const { digest, ...body } = packet;
  if (digestPacketBody(body) !== digest) {
    throw new Error("Review packet digest does not match packet contents");
  }
  return packet;
}

/** Builds and validates one bounded review packet with a stable SHA-256 digest. */
export function buildReviewPacket(input: ReviewPacketInput): ReviewPacket {
  const requirements = boundedText(input.requirements, 16_000, "Requirements");
  const body: Omit<ReviewPacket, "digest"> = {
    schemaVersion: 1,
    changeId: boundedText(input.changeId, 80, "Change ID"),
    brief: parseChangeBrief(input.brief),
    mode: {
      name: input.mode.name,
      piper: validateRouteSnapshot(input.mode.piper),
      worker: validateRouteSnapshot(input.mode.worker),
    },
    plan: {
      revision: input.planRevision,
      evidenceNotes: input.planEvidence,
    },
    requirements,
    requirementsHash: input.requirementsHash,
    inputGeneration: input.inputGeneration,
    base: input.base,
    head: input.head,
    completeDiff: input.completeDiff,
    verification: input.verification,
    priorReview: input.priorReview,
    ...(input.graphify === undefined ? {} : { graphify: input.graphify }),
  };
  const packet = {
    ...body,
    digest: digestPacketBody(body),
  };
  return validateReviewPacket(packet);
}

/** Serializes a validated packet without adding mutable metadata. */
export function serializeReviewPacket(packet: ReviewPacket): string {
  return `${JSON.stringify(validateReviewPacket(packet), null, 2)}\n`;
}

/** Parses and validates one serialized review packet. */
export function parseReviewPacket(text: string): ReviewPacket {
  return validateReviewPacket(JSON.parse(text) as unknown);
}
