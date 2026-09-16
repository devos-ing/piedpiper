# Graph Report - piedpiper-dual-model.8nZWUq  (2026-09-16)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1943 nodes · 4938 edges · 83 communities (75 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 124 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3862485d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82

## God Nodes (most connected - your core abstractions)
1. `GitHubTaskRunner` - 57 edges
2. `AgileError` - 55 edges
3. `NativeTask` - 41 edges
4. `ledger_value()` - 37 edges
5. `ledger_value()` - 37 edges
6. `GitHubExecutionStore` - 30 edges
7. `GraphQLReadProofError` - 29 edges
8. `jsonHash()` - 29 edges
9. `GitHubCommandRunner` - 27 edges
10. `createPiHarness()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `transientReadFailure()` --calls--> `AgileError`  [EXTRACTED]
  test/scheduler/github-pool.test.ts → src/runtime/errors.ts
- `readTasks()` --calls--> `GitHubTaskSnapshot`  [EXTRACTED]
  test/cli/task-board-session.test.ts → src/github/execution-view.ts
- `gateFailureWith()` --calls--> `buildPiBackendFactory()`  [EXTRACTED]
  test/agents/pi/backend.test.ts → src/agents/pi/backend.ts
- `runScheduler()` --calls--> `runBackendSession()`  [EXTRACTED]
  test/cli/backend-session.test.ts → src/cli/runtime.ts
- `readTasks()` --indirect_call--> `incomplete()`  [INFERRED]
  test/cli/task-cleanup.test.ts → src/github/graphql-reader.ts

## Import Cycles
- None detected.

## Communities (83 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (104): atomic_write(), _build_parser(), _finding_number(), _fsync_directory(), initialize_ledger(), _invalid_backups(), _json_bytes(), _ledger_lock() (+96 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (55): GitHubCommandResult, child(), emit(), execute(), FixtureIssue, fixtureIssues(), request(), transport() (+47 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (20): ExecutionRecord, NativeTask, MergeResult, backoffDelay(), GitHubTaskPool, waitForChange(), Worker, GitHubRunnerInput (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (35): AttemptReceiptSchema, authorityFailure(), ExecutionRecordSchema, GitHubExecutionStore, HookReceiptSchema, initialExecution(), IssueAccess, parseExecution() (+27 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (15): CompareAndReplaceTests, ContractValidationTests, finding(), indeterminate(), InitializationTests, ledger_value(), PathSafetyTests, CompletedProcess (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (15): CompareAndReplaceTests, ContractValidationTests, finding(), indeterminate(), InitializationTests, ledger_value(), PathSafetyTests, CompletedProcess (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (26): connectGitHub(), Comment, connection(), GitHubGraphQLReader, graphQLFailure(), graphQLQuota(), incomplete(), Issue (+18 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (30): safeTaskPathComponent(), SafeTaskPathComponentSchema, cleanupTaskWorktrees(), manager(), createWorktreeManager(), assertActive(), assertBase(), assertReachableCommit() (+22 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (27): runBackendSession(), BunGitHubCommandRunner, HarnessStepRequest, createFakeHarness(), createModelAdvisor(), createStaticModelAdvisor(), createTaskBranchManager(), createFixture() (+19 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (38): @earendil-works/pi-tui, createObservationPackExtension(), RECALL_LIMITS, registerObservationPack(), createLedger(), Ledger, completeLineExcerpt(), containsReducerReceipt() (+30 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (39): ActiveAttempt, assistantText(), cumulativeHash(), EventWithoutSequence, extractJsonObject(), PiEvent, prompt(), Usage (+31 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (26): AttemptReceipt, assertBaseBranch(), checklistLines(), githubApiResponse(), GitHubCliPreflight, GitHubPreflight, GitHubPublicationError, GitHubPullRequestPublisher (+18 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (33): piedPiperBoundary(), remoteMutationReason(), defaultValidationRunner(), agentLines(), branchContainsResult(), createPiedPiperExtension(), deliverResult(), refreshStatus() (+25 more)

### Community 13 - "Community 13"
Cohesion: 0.10
Nodes (19): effect, backends, RealBackendName, BackendRuntime, runCli(), completesWithin(), defaultRuntime, runSession() (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.19
Nodes (26): commander, isRealBackendName(), commandProjectRoot(), currentCycle(), errorMessage(), OperationalErrorFallback, reportOperationalError(), executeCurrentCycle() (+18 more)

### Community 15 - "Community 15"
Cohesion: 0.09
Nodes (22): CheckSchema, GitHubPullRequestMerger, Id, MergeCandidate, MergeReadError, Name, ProtectionSchema, PrSchema (+14 more)

### Community 16 - "Community 16"
Cohesion: 0.09
Nodes (26): assertExecutionPermission(), buildPiBackendFactory(), catalogId(), ROC_EFFORTS, startPiBackend(), supportedEfforts(), validateDefaultModel(), PiAvailableModelsDataSchema (+18 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (26): executeOnboard(), onboardingRetryCommand(), promptCycleSetting(), registerOnboardCommand(), createBacklogGuidance, describeCycle(), formatOnboardingMessage(), OnboardingScope (+18 more)

### Community 18 - "Community 18"
Cohesion: 0.09
Nodes (29): boardColumn(), buildTaskBoardSnapshot(), compareTasks(), progressStages(), TaskBoardActiveState, TaskBoardColumn, TaskBoardSnapshotInput, TaskBoardStage (+21 more)

### Community 19 - "Community 19"
Cohesion: 0.09
Nodes (15): zod, GitHubOperation, GitHubOperationNames, NonEmpty, RemoteIssueBaseSchema, RemoteIssueSchema, cancellationRaceRepo(), Output (+7 more)

### Community 20 - "Community 20"
Cohesion: 0.11
Nodes (15): HarnessEvent, gateFailureWith(), probeDefaultModel, probeModels, backendCursor(), collect(), makeImplementRequest(), makeReviewRequest() (+7 more)

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (5): AgentResult, AgentRun, AgentSupervisor, ChildClient, requireRun()

### Community 22 - "Community 22"
Cohesion: 0.07
Nodes (26): source, assist, actions, files, includes, formatter, enabled, indentStyle (+18 more)

### Community 23 - "Community 23"
Cohesion: 0.13
Nodes (16): BacklogManifest, GitHubCommandRunner, escapeEnvelopeMarkers(), GitHubIssue, GitHubIssueSchema, GitHubTaskPublisher, NonEmpty, parseRemoteTaskApproval() (+8 more)

### Community 24 - "Community 24"
Cohesion: 0.14
Nodes (24): _build_parser(), collect_snapshot(), main(), _positive_integer(), ArgumentParser, Collect a read-only GitHub pull-request evidence snapshot., Builds the read-only evidence command-line parser., Runs the evidence CLI and emits either one snapshot or a controlled error. (+16 more)

### Community 25 - "Community 25"
Cohesion: 0.10
Nodes (17): acquireCheckoutOwnership(), release(), releaseOwnedFile(), checkoutInUseError(), CheckoutOwnerRecordRead, CheckoutOwnership, hasOwnerMetadata(), hasSameFileIdentity() (+9 more)

### Community 26 - "Community 26"
Cohesion: 0.10
Nodes (9): board(), controlledSchedulerSession(), controlledTuiCommand(), Input, Output, readTasks(), spec, task() (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.13
Nodes (22): @earendil-works/pi-coding-agent, allowedSourceFiles, BuildProvenance, createPiedPiperObservationPackExtension(), registerPiedPiperObservationPack(), OBSERVATION_PACK_TOOL, parseProvenance(), Provenance (+14 more)

### Community 28 - "Community 28"
Cohesion: 0.19
Nodes (5): PiClient, confirmCleanup(), parseCatalogModel(), AgileError, normalizeError()

### Community 30 - "Community 30"
Cohesion: 0.09
Nodes (22): bin, piedpiper, bugs, url, description, engines, node, files (+14 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (20): AgileCyclePlan, AgileCyclePlanSchema, BacklogManifestSchema, BacklogTaskSchema, Continues, ContinuesSchema, ModelDecision, ModelDecisionSchema (+12 more)

### Community 32 - "Community 32"
Cohesion: 0.17
Nodes (19): NonEmpty, SkillIdentity, skillIdentityKey(), SkillIdentitySchema, SkillSettings, SkillSettingsSchema, allowedStandaloneSources, buildDefaultSkillCandidates() (+11 more)

### Community 33 - "Community 33"
Cohesion: 0.13
Nodes (9): ConformanceRole, NormalizedUsageTotals, roleAttempts, roleOutputs, ScriptedUsage, cases, createFixture(), FakeCursorRecord (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.15
Nodes (13): @clack/prompts, selectAgileCycle(), buildSkillPromptConfig(), selectSkillAllowlist(), SkillPrompt, SkillPromptConfig, SkillSelectorTerminal, TerminalOutput (+5 more)

### Community 35 - "Community 35"
Cohesion: 0.15
Nodes (17): helpText(), InteractiveModeConstructor, mainSessionTools(), parseArguments(), ParsedArguments, runPiedPiper(), RunPiedPiperOptions, agentEnvironment() (+9 more)

### Community 36 - "Community 36"
Cohesion: 0.19
Nodes (13): CommandResult, ChangeDelivery, DeliveryCommandRunner, DeliveryInput, parseReview(), PullRequest, pullRequestBody(), requireLedgerEntry() (+5 more)

### Community 37 - "Community 37"
Cohesion: 0.28
Nodes (20): piActivity(), createPiHarness(), assertReviewInvariant(), classifiedTurnFailure(), closeAttempt(), completedDelivery(), completeFromSettled(), dispatch() (+12 more)

### Community 38 - "Community 38"
Cohesion: 0.23
Nodes (16): boxGuidance(), renderHelpBox(), padToVisibleWidth(), taskBoardUsesWidePanes(), DetailMode, errorText(), renderHelp(), runTaskBoardSession() (+8 more)

### Community 39 - "Community 39"
Cohesion: 0.19
Nodes (19): renderEmptyTaskList(), blocker(), cardHeight(), cardStatus(), currentAttempt(), emptyBoardGuidance(), graphemes, latestActivity() (+11 more)

### Community 40 - "Community 40"
Cohesion: 0.23
Nodes (20): color(), detailField(), detailSection(), detailStatusTone(), duration(), fit(), footer(), graphemeWidth() (+12 more)

### Community 41 - "Community 41"
Cohesion: 0.13
Nodes (17): ContextRefSchema, AgentRoleSchema, EventBaseSchema, FakeScenario, FakeScenarioAttemptSchema, FakeScenarioSchema, HarnessAttemptSchema, HarnessDelivery (+9 more)

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (7): execFileAsync, isErrorRecord(), runCommand(), runGit(), ChangeStore, ChangeWorkspace, RepositoryIdentity

### Community 43 - "Community 43"
Cohesion: 0.15
Nodes (4): createFixture(), PiProtocolDriver, piUsage(), ScriptedPiProcessPool

### Community 44 - "Community 44"
Cohesion: 0.16
Nodes (14): hasCurrentAcceptanceBinding(), projectAcceptanceChecklist(), StoredTask, acceptanceChecklist(), continuationView(), executionTiming(), GitHubTaskSnapshot, rejectedReviewFailure() (+6 more)

### Community 45 - "Community 45"
Cohesion: 0.15
Nodes (11): Entry, githubWorkflowLedger(), report(), snapshot(), summarize(), Scope, get(), initialBase (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.14
Nodes (12): AgentHarness, HarnessEventSchema, AdapterConformanceConfig, AdapterConformanceFixture, assertSourceUntouched(), collect(), ConformanceCase, NormalizedConformanceConfig (+4 more)

### Community 47 - "Community 47"
Cohesion: 0.21
Nodes (13): AgileErrorInput, ErrorCategory, ErrorCategorySchema, createJsonlLogger(), Logger, LogInput, LogRecordSchema, agileRuntimeParent() (+5 more)

### Community 48 - "Community 48"
Cohesion: 0.24
Nodes (12): findGitRoot(), findRocRoot(), gitOutput(), isDirectory(), normalizeProjectSlug(), originRepositoryName(), projectDisplaySlug(), resolveProjectDisplaySlug() (+4 more)

### Community 49 - "Community 49"
Cohesion: 0.28
Nodes (15): copySessionPath(), createChange(), ensurePrivateDirectory(), ensureSessionDirectory(), exists(), globalStatePath(), isInside(), legacyGlobalStatePath() (+7 more)

### Community 50 - "Community 50"
Cohesion: 0.23
Nodes (6): assertTerminal(), conformanceRequest(), createCase(), defineAdapterConformance(), defineNormalizedConformance(), ProtocolDriver

### Community 51 - "Community 51"
Cohesion: 0.24
Nodes (9): configureCodex(), openBrowser(), SetupServices, entrypoint, getAgentDir, ModelRuntime, PiSdk, SettingsManager (+1 more)

### Community 52 - "Community 52"
Cohesion: 0.30
Nodes (12): typebox, assert(), createProbeLoader(), main(), openAmpExtension(), runAutomatedProbe(), runCancellationProbe(), runRpcProbe() (+4 more)

### Community 53 - "Community 53"
Cohesion: 0.14
Nodes (3): PiClientApi, ScriptedPiClient, ScriptedProbeClient

### Community 54 - "Community 54"
Cohesion: 0.14
Nodes (11): TaskBoardSnapshot, TaskBoardTask, active, blocked, done, doneTwo, graphemes, ready (+3 more)

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (10): TaskHook, BunTaskHookRunner, KillableProcess, readPipedOutput(), sanitizeHookOutput(), signalProcess(), TASK_HOOK_MAX_OUTPUT_BYTES, TaskHookExecution (+2 more)

### Community 56 - "Community 56"
Cohesion: 0.17
Nodes (10): EventWaiter, PendingRequest, PI_DETERMINISM_FLAGS, PiEvent, PiProcess, PiEventEnvelopeSchema, PiResponseEnvelopeSchema, fixturePath (+2 more)

### Community 57 - "Community 57"
Cohesion: 0.21
Nodes (11): categoryColors, compareText(), DisplayCategory, formatTokens(), knownOrder, renderTokenUsageChart(), summarizeTokenUsage(), TokenUsageChartOptions (+3 more)

### Community 58 - "Community 58"
Cohesion: 0.36
Nodes (10): RocSettingsSchema, invalidSettings(), isMissingSettings(), loadRocSettings(), loadRocSettingsIfPresent(), publicFieldNames, rocSettingsPath(), saveRocSettings() (+2 more)

### Community 59 - "Community 59"
Cohesion: 0.15
Nodes (12): compilerOptions, allowImportingTsExtensions, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+4 more)

### Community 61 - "Community 61"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, format, lint, prepack, prepare (+3 more)

### Community 62 - "Community 62"
Cohesion: 0.33
Nodes (9): ActiveAgileCycle, AgileCycleSettingSchema, dateForDayNumber(), dateParts(), dayNumber(), isoWeekId(), localDate(), LocalDateSchema (+1 more)

### Community 63 - "Community 63"
Cohesion: 0.20
Nodes (10): devDependencies, @biomejs/biome, commander, effect, husky, lint-staged, simple-git, @types/bun (+2 more)

### Community 64 - "Community 64"
Cohesion: 0.20
Nodes (9): ./tsconfig.json, compilerOptions, declaration, noEmit, outDir, rewriteRelativeImportExtensions, rootDir, extends (+1 more)

### Community 65 - "Community 65"
Cohesion: 0.22
Nodes (8): AcceptanceChecklistBinding, AcceptanceChecklistItem, AcceptanceChecklistItemSchema, AcceptanceResult, AcceptanceResultSchema, NonEmpty, binding, criteria

### Community 66 - "Community 66"
Cohesion: 0.25
Nodes (6): MintCursorInput, normalizedUsage(), RoleStartObservation, cases, PiEvent, QueuedEvent

### Community 67 - "Community 67"
Cohesion: 0.31
Nodes (7): allowedSourceFiles, files, manifestPath, root, sha256(), sourceFiles(), validateRawSnapshot()

### Community 68 - "Community 68"
Cohesion: 0.39
Nodes (6): TaskStatus, allowed, assertTransition(), canTransition(), isTerminal(), terminal

### Community 69 - "Community 69"
Cohesion: 0.36
Nodes (7): handleMessage(), IncomingMessage, main(), requestId(), scoutOutput, uiResponses, write()

### Community 70 - "Community 70"
Cohesion: 0.43
Nodes (5): colorTaskDisplay(), formatTaskDisplayId(), taskDisplayColors, TaskDisplayTone, taskStatusTone()

### Community 73 - "Community 73"
Cohesion: 0.40
Nodes (5): dependencies, @clack/prompts, @earendil-works/pi-coding-agent, @earendil-works/pi-tui, typebox

### Community 74 - "Community 74"
Cohesion: 0.40
Nodes (4): Activity, ToolArgumentsSchema, ToolEventSchema, HarnessActivitySchema

### Community 75 - "Community 75"
Cohesion: 0.50
Nodes (3): fixtureRepository(), git(), ImmediateMode

### Community 77 - "Community 77"
Cohesion: 0.50
Nodes (3): buffer, message, response

### Community 78 - "Community 78"
Cohesion: 0.50
Nodes (3): request, scenario, ticket

### Community 79 - "Community 79"
Cohesion: 0.67
Nodes (3): repository, type, url

## Knowledge Gaps
- **356 isolated node(s):** `FixtureIssue`, `CommandObservation`, `FixedGraphQLRequest`, `GraphQLRateLimit`, `GraphQLReadProofOptions` (+351 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 576 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `zod` connect `Community 19` to `Community 3`, `Community 6`, `Community 7`, `Community 10`, `Community 11`, `Community 15`, `Community 16`, `Community 18`, `Community 23`, `Community 30`, `Community 31`, `Community 32`, `Community 41`, `Community 47`, `Community 56`, `Community 58`, `Community 62`, `Community 65`, `Community 74`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `@earendil-works/pi-coding-agent` connect `Community 27` to `Community 35`, `Community 9`, `Community 12`, `Community 52`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `record()` connect `Community 12` to `Community 3`, `Community 60`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `FixtureIssue`, `CommandObservation`, `FixedGraphQLRequest` to the rest of the system?**
  _356 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.055345911949685536 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.052782558806655194 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0861244019138756 - nodes in this community are weakly interconnected._