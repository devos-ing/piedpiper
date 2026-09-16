import type { AgentSessionRuntime } from "@earendil-works/pi-coding-agent";
import type { RouteSnapshot } from "./modes.js";

interface PiperSessionRuntime {
  session: AgentSessionRuntime["session"];
  services: AgentSessionRuntime["services"];
}

/** Returns an actionable setup failure for an unavailable model route. */
function setupFailure(route: RouteSnapshot, detail: string): Error {
  return new Error(
    `Pied Piper setup required for ${route.provider}/${route.model}: ${detail}. Configure the exact Pi provider, credentials, model, and effort; no fallback was selected`,
  );
}

/** Requires one exact provider/model to be present in a Pi catalog. */
export function assertRouteAvailable(
  route: RouteSnapshot,
  available: readonly { provider: string; id: string }[],
): void {
  if (
    !available.some(
      (model) => model.provider === route.provider && model.id === route.model,
    )
  ) {
    throw setupFailure(route, "the model is not available or authenticated");
  }
}

/** Requires Pi to report the exact model and requested or observed effort. */
export function assertEffectiveRoute(
  expected: RouteSnapshot,
  actual: RouteSnapshot | null | undefined,
): void {
  if (!actual) throw setupFailure(expected, "Pi returned no effective route");
  if (
    actual.provider !== expected.provider ||
    actual.model !== expected.model ||
    (expected.effort !== "default" && actual.effort !== expected.effort) ||
    (expected.effort === "default" && actual.effort === "default")
  ) {
    throw setupFailure(expected, "Pi returned a different effective route");
  }
}

/** Builds exact Pi child options while leaving provider-default effort unforced. */
export function routeStartupOptions(route: RouteSnapshot): {
  provider: string;
  model: string;
  args: string[];
} {
  return {
    provider: route.provider,
    model: route.model,
    args: route.effort === "default" ? [] : ["--thinking", route.effort],
  };
}

/** Reads a model and effort snapshot from a native Pi session-like value. */
export function readSessionRoute(value: unknown): RouteSnapshot | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const session = value as Record<string, unknown>;
  const model =
    typeof session.model === "object" && session.model !== null
      ? (session.model as Record<string, unknown>)
      : undefined;
  if (
    typeof model?.provider !== "string" ||
    typeof model.id !== "string" ||
    typeof session.thinkingLevel !== "string"
  ) {
    return undefined;
  }
  if (
    !["off", "minimal", "low", "medium", "high", "xhigh", "max"].includes(
      session.thinkingLevel,
    )
  ) {
    return undefined;
  }
  return {
    provider: model.provider,
    model: model.id,
    effort: session.thinkingLevel as RouteSnapshot["effort"],
  };
}

/** Applies and reads back the Piper route through Pi's native model controls. */
export async function configurePiperSession(
  runtime: PiperSessionRuntime,
  expected: RouteSnapshot,
): Promise<void> {
  let available: Awaited<
    ReturnType<typeof runtime.services.modelRuntime.getAvailable>
  >;
  try {
    available = await runtime.services.modelRuntime.getAvailable();
  } catch {
    throw setupFailure(
      expected,
      "the model catalog or credentials could not be loaded",
    );
  }
  assertRouteAvailable(
    expected,
    available.map((model) => ({ provider: model.provider, id: model.id })),
  );
  const model = available.find(
    (candidate) =>
      candidate.provider === expected.provider &&
      candidate.id === expected.model,
  );
  if (!model) {
    throw setupFailure(expected, "the model is not available or authenticated");
  }
  try {
    await runtime.session.setModel(model);
    if (expected.effort !== "default") {
      runtime.session.setThinkingLevel(expected.effort);
    }
  } catch {
    throw setupFailure(
      expected,
      "Pi could not activate the requested model or effort",
    );
  }
  assertEffectiveRoute(expected, readSessionRoute(runtime.session));
}

/** Locks every Piper session setter so transport can only observe the saved route. */
export async function lockPiperSessionRoute(
  runtime: PiperSessionRuntime,
  expected: RouteSnapshot,
): Promise<void> {
  await configurePiperSession(runtime, expected);
  const session = runtime.session;
  const setModel = session.setModel.bind(session);
  const setThinkingLevel = session.setThinkingLevel.bind(session);
  session.setModel = async (model) => {
    if (model.provider !== expected.provider || model.id !== expected.model) {
      assertEffectiveRoute(expected, readSessionRoute(session));
      return;
    }
    await setModel(model);
    assertEffectiveRoute(expected, readSessionRoute(session));
  };
  session.setThinkingLevel = (level) => {
    if (expected.effort === "default" || level !== expected.effort) {
      assertEffectiveRoute(expected, readSessionRoute(session));
      return;
    }
    setThinkingLevel(level);
    assertEffectiveRoute(expected, readSessionRoute(session));
  };
  session.cycleModel = async () => undefined;
  session.cycleThinkingLevel = () => session.thinkingLevel;
}
