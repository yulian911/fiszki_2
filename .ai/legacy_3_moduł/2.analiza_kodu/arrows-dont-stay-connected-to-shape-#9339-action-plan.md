# Action Plan for Arrows don't stay connected to shape #9339

## Issue Description
When creating an arrow originating from a shape and targeting a text element, if the arrow's path visually overlaps the source shape, the arrow's endpoint attached to the text element becomes unstable and moves around unexpectedly as the arrow is adjusted.

## Relevant Codebase Parts
Based on the project structure and issue description, the following parts of the `packages/element` module are most relevant:
1.  **`packages/element/src/binding.ts`**: Contains the core logic for how elements (like arrows) bind to other elements (like text boxes). Calculates attachment points.
2.  **`packages/element/src/linearElementEditor.ts`**: Handles the geometry and editing logic specific to linear elements (arrows), including point manipulation and normalization. It likely collaborates with `binding.ts` to determine final arrow shape.
3.  **`packages/element/src/textElement.ts`**: Manages properties and calculations specific to text elements, including their bounding boxes which are used for binding calculations.
4.  **`packages/element/src/bounds.ts` / `collision.ts`**: Provide utility functions for calculating element boundaries and intersections, likely used by the binding logic.

## Git Commit History Analysis
- A major refactor (`#9285` by Marcel Mraz, ~Mar 26, 2025) moved element logic into the `packages/element` module. This significantly changed the structure of the relevant files.
- Post-refactor changes potentially related to the issue include:
    - `linearElementEditor.ts`: Fix for normalization (`#9347` by Márk Tolmács, ~Apr 6, 2025).
    - `textElement.ts`: Feature for horizontal text labels (`#9364` by Márk Tolmács, ~Apr 13, 2025).
    - `binding.ts`: Fix for duplication (`#9333` by David Luzar, ~Apr 7, 2025) and utility additions.
- The timing of the normalization and text label changes correlates loosely with the issue report timeline (opened "2 weeks ago" relative to the video date which seems like late April/early May 2025).

## Root Cause Hypothesis
The most likely cause is a flaw in the geometric calculation used to determine the precise binding point of the arrow onto the *target* text element's boundary. This calculation (likely located in `binding.ts` or functions called from it/`linearElementEditor.ts`) might become unstable or produce incorrect results when the arrow's line segment visually overlaps the *source* shape. The instability could stem from:
- An incorrect assumption in the intersection algorithm.
- The algorithm being sensitive to floating-point inaccuracies in this specific geometric configuration.
- An edge case introduced or exposed by the recent normalization (`#9347`) or text handling (`#9364`) changes.

## Potential Contacts
- **Márk Tolmács (@MarkTolmacs):** Recent contributor to `linearElementEditor.ts` and `textElement.ts`. Expertise in arrow/element logic.
- **David Luzar (@dwelle):** Top contributor, active in core logic including `binding.ts`. Deep overall system knowledge.
- **Marcel Mraz (@marcelmraz):** Led the `packages/element` refactoring, understands the new structure.

## Investigation Questions
1.  Which specific function(s) calculate the intersection point between an arrow segment and a text element's boundary for binding?
2.  How does this calculation use the arrow's start, end, and potentially mid-points?
3.  How are text element boundaries defined for this calculation (e.g., simple bounding box)? Did `#9364` change this?
4.  What inputs (coordinates, element states) are fed into this calculation when the bug occurs? How do they change as the arrow overlaps the source?
5.  Does the calculation explicitly handle or account for the arrow overlapping its source element?
6.  Could the normalization logic in `#9347` affect the points used in the binding calculation in this scenario?
7.  Are there existing tests covering arrow-to-text binding, especially with complex layouts or overlaps?
8.  (For @MarkTolmacs) Could recent changes in `#9347` or `#9364` have impacted the stability of arrow-text binding calculations?
9.  (For @dwelle/@marcelmraz) Where is the primary geometric intersection logic for binding located post-refactor?

## Next Steps
1.  **Setup Dev Environment:** Clone the repo, run `yarn` and `yarn start` per `onboarding.md`.
    *Rationale: Enable local debugging and testing.*
2.  **Reproduce the Bug:** Consistently replicate the issue locally using the scenario from the video (arrow from shape to text, drag arrow to overlap shape).
    *Rationale: Provide a stable test case for debugging.*
3.  **Identify Calculation Function:** Trace the code execution during arrow dragging/binding to find the function(s) in `binding.ts` / `linearElementEditor.ts` responsible for calculating the target binding point.
    *Rationale: Pinpoint the source of the potential calculation error.*
4.  **Log/Debug Inputs & Outputs:** Add logging or use a debugger to inspect the inputs (arrow points, element bounds) and outputs of the identified function(s) during the buggy interaction.
    *Rationale: Understand *why* the calculation fails or becomes unstable.*
5.  **Analyze Geometric Logic:** Carefully review the algorithm used for finding the intersection/binding point. Check for assumptions, edge cases, or potential floating-point issues related to the overlap scenario.
    *Rationale: Find the specific flaw in the calculation.*
6.  **Review Related PRs:** Re-examine changes in `#9347` (normalization) and `#9364` (text labels) for any modifications that could affect point calculations or boundary definitions relevant to binding.
    *Rationale: Check for regressions introduced by recent changes.*
7.  **Develop & Test Fix:** Implement a correction to the calculation logic based on the findings.
    *Rationale: Resolve the bug.*
8.  **Add Regression Test:** Create a new automated test case that specifically covers this shape-arrow-text overlap scenario to prevent future regressions.
    *Rationale: Ensure the fix is effective and the bug doesn't reappear.*

## Additional Notes
- The issue seems specific to the arrow overlapping its *source* element while targeting another element. This geometric configuration is key.
- Pay attention to how element boundaries (especially for text) are represented and used in intersection calculations.
- The refactoring (`#9285`) might have changed how different parts of the element logic (binding, geometry, collision) interact, potentially creating new edge cases.