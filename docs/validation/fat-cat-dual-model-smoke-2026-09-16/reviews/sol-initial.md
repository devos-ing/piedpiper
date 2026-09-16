# Review: A — initial

## Scores
| Category | Score |
|---|---:|
| Requirements completeness | 18/30 |
| Composition, proportion, color, and immediate recognizability | 15/25 |
| Motion quality | 12/15 |
| Desktop/mobile rendering | 15/15 |
| Code quality | 10/10 |
| Reduced-motion and accessibility | 4/5 |
| Total | 74/100 |

Result: FAIL
Core gates: G1 PASS; G2 FAIL; G3 PASS; G4 PASS; G5 PASS; G6 PASS; G7 PASS
Failed scoring checks: R2 −6; R3 −6; V2 −5; V3 −5; M4 −3; A2 −1

## Blocking findings
- **G2; R2, R3, V3, A2:** The saddle and seatpost at `index.html:174–175` are completely covered by the opaque torso drawn at line 186. Neither is identifiable in any of the four screenshots, at 1440×900 or 390×844. The cat consequently lacks visible saddle support, and an essential bicycle component is unreadable in both motion modes. The reduced-motion override correctly stops animation but preserves this occlusion. Expose the saddle beneath the seated haunches and its connection to the frame.

## Nonblocking findings
- **V2:** The stationary thighs at `index.html:210–211` terminate at `(382,744)` and `(397,744)`, effectively sharing the crank center `(390,748)` as their knee joint. `.pedaling-legs` then rotates both lower legs through 360° around that point. This produces an implausible limb arrangement, visible in both normal-motion screenshots. M2 and G5 pass because the lower legs, paws, and crank genuinely share the same `wheel-turn` animation, origin, and 1.2-second linear cycle, maintaining their connections. Replace the crank-centered knees with plausible leg joints that follow the pedals.
- **M4:** `.cloud-belt` translates from `0` to `-400px` over 18 seconds, then resets. Its three cloud instances start at x=70, 470, and 870, at `index.html:111–126`. At desktop, the 800×900 SVG element scales the viewBox uniformly to 720×900, exposing extra horizontal space beyond the sky rectangle. The cloud at x=870 extends into this space at the start, but no corresponding cloud occupies it at the cycle end. Reset therefore introduces a visible fragment abruptly. The desktop reduced-motion screenshot shows that fragment beyond the sky’s right edge. Clip the belt to the sky bounds or extend its repeating geometry to cover the entire visible SVG viewport.

## Correction instructions
1. Make the saddle and seatpost identifiable, with the cat visibly seated on them in all four required views.
2. Rework the hindlimb joints while preserving continuous paw-to-pedal contact and coordinated CSS motion.
3. Mask or extend the cloud belt so its start and end states match everywhere visible, including the desktop side margins.

