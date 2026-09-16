# Frozen Three-Arm Coding Smoke Test

## 1. Purpose and limitations

Build a previewable animated illustration under identical constraints in three fresh, isolated Git repositories, with one implementation run per anonymous arm. A fresh, identity-blind reviewer evaluates each result using this unchanged specification.

This is a smoke test, not a statistically reliable ranking. Report observable results only; do not infer implementer identity. One findings-based correction round is permitted.

## 2. Deliverable

Deliver exactly one runtime file: `index.html`.

It must contain an original SVG/CSS illustration of **a fat cat riding a bicycle on a road**, and work when opened directly through `file://`.

Requirements:

- All artwork, styles, and required resources are inline.
- No external images, fonts, JavaScript libraries, CSS libraries, network requests, build step, or additional runtime files.
- Use authored SVG geometry and CSS, not an embedded screenshot or prerecorded animation.
- Include no model/provider names, benchmark commentary, scores, or hidden identifying marks, including in comments and metadata.
- Keep the source readable and organized.

## 3. Acceptance criteria

### Cat and riding pose

- The subject is recognizably feline and unmistakably fat: a substantial, rounded belly and broad torso, not merely a large head.
- The cat is visibly seated at the saddle, supported by the bicycle rather than floating above or standing beside it.
- Visible forepaws connect plausibly to the handlebars; visible pedaling hindlimbs connect plausibly to the pedals.
- Anatomically occluded limbs may remain hidden. Visible limbs must not terminate inexplicably or detach during motion.

### Bicycle

Show two distinct wheels, a connected frame, a steering fork and handlebars, a saddle, and a crank with pedals. Wheels, frame, steering assembly, and rider placement must form a plausible bicycle.

### Environment

- An obvious road supports the bicycle.
- Show road depth through convergence, foreshortening, or decreasing scale/spacing toward the distance—not merely a flat horizontal stripe.
- Include a coherent background, such as sky with clouds, hills, trees, grass, or roadside details.
- Use clear layering, coherent color, and intentional proportions. The cat and bicycle must remain the immediate focal subject.

## 4. Motion rules

Use CSS animation for all predetermined motion.

- Animate **only `transform` and/or `opacity`**, including transitions. Static SVG attributes and static transforms are permitted.
- Do not animate layout properties, SVG geometry, stroke properties, colors, or custom properties as an indirect animation mechanism.
- Do not use script-driven animation or SVG animation elements.
- Both wheels must visibly rotate around their hubs. Include spokes or another rotating detail that makes rotation perceptible.
- Animate the crank/pedals and connected hindlimbs as a coordinated pedaling cycle. Whole-rider bobbing alone does not count as pedaling.
- Include at least **two distinct secondary motions**, such as body bob, tail sway, ear movement, scenery drift, or road-marking travel. Wheel and pedaling motion do not count toward these two.
- Keep limb/control contacts plausible throughout the cycle.
- Loops must be seamless: no visible reset, teleport, discontinuous reversal, or unmasked scenery jump.
- Constant travel or rotation may use `linear`.
- On-screen oscillation must use `cubic-bezier(0.77, 0, 0.175, 1)` or a linear cycle justified by a short source comment explaining its suitability. The actual motion must support that justification.

## 5. Accessibility and responsiveness rules

### Rendering

The complete composition must fit at these CSS viewport sizes:

- Desktop: **1440 × 900**
- Mobile: **390 × 844**

At both sizes:

- No clipped subject parts, unintended artwork cropping, or horizontal/vertical page scrollbars.
- Fit must hold throughout the animation, not just in the captured frame.
- Preserve proportions; wheels must not become ellipses through nonuniform scaling.
- Keep the cat, bicycle structure, road, and paw/pedal connections readable without zooming.

### Accessibility

- Provide a meaningful document `<title>`.
- Expose the illustration as one named SVG image with an accessible name and description, using SVG `<title>`/`<desc>` and appropriate ARIA associations or an equivalent correct structure.
- Decorative primitives must not create individually announced or focusable clutter.
- Include an effective `prefers-reduced-motion: reduce` rule.
- In reduced-motion mode, stop positional and rotational movement, including wheel rotation, pedaling, bobbing, and drifting. Merely slowing animation is insufficient.
- Preserve a complete, deliberately posed static scene. Do not hide the illustration or remove essential components.

### Fixed review evidence

Use the same browser/version, device-pixel ratio of 1, and 100% zoom for every arm. Open through `file://`, with no interaction.

Capture four screenshots, each from a fresh load at **2.0 seconds after document load**:

1. Desktop, normal motion.
2. Mobile, normal motion.
3. Desktop, reduced motion.
4. Mobile, reduced motion.

Review the complete source alongside these screenshots. Still images do not prove animation: verify active selectors, keyframes, transform origins, timing, cycle endpoints, and reduced-motion overrides from source. Do not award points for comments or claims unsupported by implementation evidence.

## 6. Weighted rubric — 100 points

Each row is an independent, binary scoring check:

- Award its full weight only when **all** stated conditions are supported.
- Otherwise award zero: the deduction is exactly the row’s weight.
- No partial credit, discretionary bonuses, or additional penalties.
- Category full credit requires every row in that category.
- A defect may fail multiple explicitly applicable rows; list each affected ID. Do not invent additional deductions.

### Requirements completeness — 30 points

| ID | Points | Full-credit anchor; otherwise deduct listed points |
|---|---:|---|
| R1 | 4 | Recognizably feline subject with a clearly broad, rounded, fat-body silhouette. A generic animal or ordinary slender cat fails. |
| R2 | 6 | Cat is seated at the saddle, with continuous visible forelimb-to-handlebar and hindlimb-to-pedal connections. Hovering, detached contacts, or standing beside the bicycle fails. |
| R3 | 6 | Two wheels, connected frame, fork/handlebar, saddle, crank, and pedals are all identifiable and structurally connected. Any missing or disconnected assembly fails. |
| R4 | 6 | An obvious road supports the wheels and has an identifiable perspective/depth cue. An absent road or depthless stripe fails. |
| R5 | 4 | A coherent setting includes a sky/background field plus at least one environmental feature beyond the road. Blank surrounding space or unrelated decoration fails. |
| R6 | 4 | One original inline SVG/CSS `index.html` opens directly and needs no prohibited resource, request, build step, or other runtime file. Any dependency violation fails. |

### Composition, proportion, color, and immediate recognizability — 25 points

| ID | Points | Full-credit anchor; otherwise deduct listed points |
|---|---:|---|
| V1 | 5 | At native size in both normal-motion screenshots, the scene reads as a fat cat riding a bicycle without explanatory text. Ambiguous action, obscured silhouette, or competing decoration fails. |
| V2 | 5 | Rider weight, saddle placement, limb reach, wheel spacing, and frame proportions form a plausible pose. Unsupported posture, impossible reach, or frame intersections through the torso fails. |
| V3 | 5 | Layering cleanly separates face, limbs, controls, frame, and wheels. Accidental tangencies or overlaps that make a contact or component unreadable fail. |
| V4 | 5 | Color separates cat from background and bicycle from road, with related colors repeated across the scene. Essential parts disappearing into adjacent colors or conflicting visual emphasis fails. |
| V5 | 5 | Foreground subject, road, and background form distinct depth layers with consistent scale/overlap cues. Contradictory perspective or background details obscuring the focal subject fails. |

### Motion quality — 15 points

| ID | Points | Full-credit anchor; otherwise deduct listed points |
|---|---:|---|
| M1 | 3 | Both wheels visibly rotate about their hubs with coherent direction and speed. A static wheel, imperceptible rotation, or off-center wobble fails. |
| M2 | 3 | Crank/pedals and hindlimbs form a coordinated pedaling cycle with maintained contact. Decorative leg swinging or detached feet fails. |
| M3 | 3 | At least two distinct, perceptible secondary motions support the ride. Fewer than two, imperceptible motion, or counting wheels/pedaling again fails. |
| M4 | 3 | Every motion has continuous loop boundaries, plausible contacts, and no unintended collision or jump throughout its cycle. Any such discontinuity fails. |
| M5 | 3 | All motion uses CSS and only permitted properties; every animation/transition uses compliant easing, with any linear oscillation justified. Any violation fails. |

### Desktop/mobile rendering — 15 points

| ID | Points | Full-credit anchor; otherwise deduct listed points |
|---|---:|---|
| D1 | 5 | At 1440 × 900, the complete composition fits without cropping or page scrollbars, including motion extents. Any overflow or clipping fails. |
| D2 | 5 | At 390 × 844, the complete composition fits without cropping or page scrollbars, including motion extents. Any overflow or clipping fails. |
| D3 | 5 | Both sizes preserve aspect ratios and readable bicycle/limb details without zooming. Distortion or essential details reduced to indistinguishable marks fails. |

### Code quality — 10 points

| ID | Points | Full-credit anchor; otherwise deduct listed points |
|---|---:|---|
| C1 | 3 | Indented, legible HTML/SVG/CSS with meaningfully organized scene groups and animation rules. Minified or tangled source fails. |
| C2 | 3 | Referenced IDs, selectors, SVG resources, and keyframes resolve correctly; IDs are unique; no malformed structure affects rendering. Broken references or consequential structural errors fail. |
| C3 | 2 | No unused rules/keyframes, abandoned scene fragments, placeholders, or redundant duplicate definitions. Intentional repeated illustration geometry is not a defect. |
| C4 | 2 | Artifact contains no prohibited identities, benchmark commentary, scores, or hidden identifying marks. Any occurrence fails. |

### Reduced-motion and accessibility — 5 points

| ID | Points | Full-credit anchor; otherwise deduct listed points |
|---|---:|---|
| A1 | 2 | An effective reduced-motion media rule stops all positional/rotational movement. A missing, unmatched, overridden, or slowdown-only rule fails. |
| A2 | 1 | Reduced-motion screenshots retain a complete, readable scene with the cat seated and connected to the bicycle. Hidden components or an incoherent frozen pose fails. |
| A3 | 1 | Meaningful document title plus correctly exposed SVG accessible name and description. Any missing or ineffective part fails. |
| A4 | 1 | SVG is exposed as one illustration without decorative focus targets or noisy separately announced primitives. Accessibility clutter fails. |

## 7. Fail conditions

**PASS requires at least 70/100 and every core gate below to pass.** Otherwise report **FAIL**, retaining the numerical score.

| Gate | Failure condition |
|---|---|
| G1 — Fat cat | No identifiable cat, or no unmistakably fat-body silhouette. |
| G2 — Bicycle | No recognizable bicycle with two wheels and identifiable frame, steering, saddle, and crank/pedals. |
| G3 — Road | No obvious road beneath/supporting the bicycle. |
| G4 — Wheel motion | Either wheel lacks active, perceptible CSS-driven rotation. |
| G5 — Pedaling | No active coordinated pedal/crank and hindlimb cycle; bobbing alone is insufficient. |
| G6 — Responsive rendering | Either required viewport clips the intended composition, produces page scrollbars, or makes the core subject unreadable. |
| G7 — Reduced motion | Effective reduced-motion handling is absent, positional/rotational movement remains, or handling removes an essential part of the scene. |

Other defects incur their specified deductions; reviewers must not add discretionary fail gates.

## 8. Review output schema

```markdown
# Review: <anonymous artifact ID> — <initial|corrected>

## Scores
| Category | Score |
|---|---:|
| Requirements completeness | /30 |
| Composition, proportion, color, and immediate recognizability | /25 |
| Motion quality | /15 |
| Desktop/mobile rendering | /15 |
| Code quality | /10 |
| Reduced-motion and accessibility | /5 |
| Total | /100 |

Result: PASS | FAIL
Core gates: G1 PASS/FAIL; ...; G7 PASS/FAIL
Failed scoring checks: <IDs with exact deductions, or none>

## Blocking findings
- <Failed gate, evidence, affected check IDs, concise correction>
- <Total below 70, if applicable>

## Nonblocking findings
- <Other failed check IDs, evidence, concise correction>

## Correction instructions
1. <Specific required change tied to a finding>
```

Evidence must cite a source line/selector/group or an observable screenshot defect with viewport and motion mode. Report “None” for empty finding sections. Avoid speculative defects, identity guesses, and unscored taste-based redesign requests.

## 9. Correction policy

- Allow **one correction round only**, limited to concrete reviewer findings and directly necessary dependent changes.
- Supply the implementer with the frozen specification and its anonymous review—not other arms, implementations, or comparative scores.
- Do not introduce new requirements or relax existing ones.
- Preserve the original artifact, evidence, and initial score.
- Recapture all four screenshots using the same protocol and re-evaluate the entire rubric and all gates.
- Report initial and corrected scores separately. Regressions count normally; no second correction round is permitted.

