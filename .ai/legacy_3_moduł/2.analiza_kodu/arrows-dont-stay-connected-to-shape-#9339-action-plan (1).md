# Action Plan for Arrows don't stay connected to shape #9339

## Issue Description
When creating an arrow originating from a shape and targeting a text element, if the arrow's path visually overlaps the source shape, the arrow's endpoint attached to the text element becomes unstable and moves around unexpectedly as the arrow is adjusted.

## Relevant Codebase Parts
Based on the project structure and issue description, the following parts of the `packages/element` module are most relevant:
1.  **`packages/element/src/binding.ts`**: Contains the core logic for how elements (like arrows) bind to other elements (like text boxes). Calculates attachment points.
    *   **`updateBoundPoint`**: Key function identified via logging. Calculates the new position for a bound arrow endpoint (start or end) based on the bindable element's state and the arrow's geometry. Contains the faulty logic identified as the root cause.
    *   **`determineFocusPoint`**: Calculates the absolute target point on the bindable element's boundary.
    *   **`determineFocusDistance`**: Calculates the relative 'focus' distance along the element's boundary. Observed to produce large negative values for the source binding during overlap.
    *   **`intersectElementWithLineSegment` (called from `updateBoundPoint`, defined in `collision.ts`)**: Determines intersection points between the arrow segment and the bindable element's boundary (plus gap). Returns only one fallback point when the adjacent arrow point is inside the gapped boundary.
    *   **`calculateFocusAndGap`**: Calculates the initial `focus` and `gap` values used in binding.
2.  **`packages/element/src/linearElementEditor.ts`**: Handles the geometry and editing logic specific to linear elements (arrows), including point manipulation and normalization. It likely collaborates with `binding.ts` to determine final arrow shape.
    *   **`movePoints` / `_updatePoints`**: Apply calculated point changes to the arrow element, potentially triggering updates in bound elements.
    *   **`getPointAtIndexGlobalCoordinates` / `pointFromAbsoluteCoords`**: Convert between local and global coordinates for arrow points.
3.  **`packages/element/src/textElement.ts`**: Manages properties and calculations specific to text elements, including their bounding boxes which are used for binding calculations.
4.  **`packages/element/src/bounds.ts` / `collision.ts`**: Provide utility functions for calculating element boundaries and intersections, likely used by the binding logic. `collision.ts` contains `intersectElementWithLineSegment`.

## Git Commit History Analysis
- A major refactor (`#9285` by Marcel Mraz, ~Mar 26, 2025) moved element logic into the `packages/element` module. This significantly changed the structure of the relevant files.
- Post-refactor changes potentially related to the issue include:
    - `linearElementEditor.ts`: Fix for normalization (`#9347` by Márk Tolmács, ~Apr 6, 2025).
    - `textElement.ts`: Feature for horizontal text labels (`#9364` by Márk Tolmács, ~Apr 13, 2025).
    - `binding.ts`: Fix for duplication (`#9333` by David Luzar, ~Apr 7, 2025) and utility additions.
- The timing of the normalization and text label changes correlates loosely with the issue report timeline (opened "2 weeks ago" relative to the video date which seems like late April/early May 2025).

## Root Cause Hypothesis
**Updated based on log analysis:**
The root cause is faulty logic within the `binding.ts:updateBoundPoint` function, specifically in the `else if (intersections.length === 1)` block.

When the arrow overlaps its source shape (the rectangle `jXk...` in the logs), the geometric configuration causes the arrow's `adjacentPoint` (the point next to the endpoint being calculated) to fall *inside* the source shape's calculated boundary plus the binding `gap`. In this specific scenario, `intersectElementWithLineSegment` correctly identifies that the line segment (from `adjacentPoint` towards the `focusPointAbsolute`) does not actually cross the gapped boundary and returns only a single "fallback" intersection point.

The bug lies in how `updateBoundPoint` handles this single intersection result. Instead of using the returned fallback point (which represents the point on the line segment at the original distance, effectively), the code incorrectly assigns the calculated `focusPointAbsolute` directly to the `newEdgePoint`. This causes the arrow's start point (bound to the source rectangle) to jump to this focus point, which is not the correct intersection with the element's boundary edge.

While the user observes the instability at the *text* end of the arrow, the initial error occurs during the update of the *start* point bound to the source rectangle. This incorrect start point update changes the arrow's overall geometry. In the subsequent update cycle, the calculation for the arrow's *end point* (bound to the text element `YqN...`) uses this new, incorrect start point, leading to the visible instability and unexpected movement observed at the text element end.

The large negative `focus` value (~ -1.58) calculated by `determineFocusDistance` for the start binding during overlap is likely a symptom of this geometric configuration (where the arrow segment points strongly away from the element's center relative to its axes/diagonals) rather than the root cause itself, although it contributes to determining the incorrect `focusPointAbsolute` that gets assigned when the faulty logic path is taken.

## Potential Contacts
- **Márk Tolmács (@MarkTolmacs):** Recent contributor to `linearElementEditor.ts` and `textElement.ts`. Expertise in arrow/element logic.
- **David Luzar (@dwelle):** Top contributor, active in core logic including `binding.ts`. Deep overall system knowledge.
- **Marcel Mraz (@marcelmraz):** Led the `packages/element` refactoring, understands the new structure.

## Investigation Questions
*(Updated based on log analysis)*
1.  **Which specific function(s) calculate the intersection point between an arrow segment and a text element's boundary for binding?**
    *   **Answered:** The core logic is within `binding.ts:updateBoundPoint`. It uses `determineFocusPoint` to find a target point and then calls `intersectElementWithLineSegment` (from `collision.ts`) to find the actual intersection point on the boundary (plus gap).
2.  **How does this calculation use the arrow's start, end, and potentially mid-points?**
    *   **Answered:** `updateBoundPoint` primarily uses the endpoint being updated (e.g., index 0 for start) and the adjacent point (e.g., index 1 for start). Mid-points are not directly used for the endpoint binding calculation itself (unless they are the adjacent point in a multi-segment line). The global coordinates of these two points define the line segment used for intersection tests.
3.  **How are text element boundaries defined for this calculation (e.g., simple bounding box)? Did `#9364` change this?**
    *   **Partially Answered:** Logs show the binding uses the text element's properties (`x`, `y`, `width`, `height`, `angle`). `intersectElementWithLineSegment` likely uses these to calculate a boundary representation (e.g., axis-aligned bounding box rotated by `angle`). Further investigation into `getElementShape` and related functions called by `intersectElementWithLineSegment` is needed to confirm the exact representation. We don't have direct evidence from logs if `#9364` changed this.
4.  **What inputs (coordinates, element states) are fed into this calculation when the bug occurs? How do they change as the arrow overlaps the source?**
    *   **Answered:** The logs provide snapshots of the inputs (`linearElement`, `binding` {focus, gap}, `bindableElement`, `adjacentPoint`, `focusPointAbsolute`) during the buggy interaction. Key observations:
        *   For the start binding (source rectangle), `focus` becomes large and negative (~ -1.58).
        *   The `adjacentPoint` likely falls inside the gapped boundary of the source rectangle during overlap.
        *   `intersectElementWithLineSegment` returns only 1 intersection (the fallback) in this state.
5.  **Does the calculation explicitly handle or account for the arrow overlapping its source element?**
    *   **Answered:** Not explicitly. The logic attempts to find an intersection based on the `adjacentPoint` and `focusPointAbsolute`. The bug arises because the handling for the case where `adjacentPoint` is *inside* the gapped boundary (returning 1 intersection) is incorrect.
6.  **Could the normalization logic in `#9347` affect the points used in the binding calculation in this scenario?**
    *   **Answered:** The `normalizePoints` function logs show it runs, ensuring the first point is at `[0,0]`. While normalization itself seems correct, the subsequent `_updatePoints` function applies offsets based on the *intended* movement of the first point. If the binding calculation results in an incorrect jump for the first point (due to the intersection bug), the normalization/offset logic in `_updatePoints` will correctly translate this jump to the element's `x, y` position and the relative positions of other points, but it doesn't *cause* the initial jump.
7.  Are there existing tests covering arrow-to-text binding, especially with complex layouts or overlaps?
8.  (For @MarkTolmacs) Could recent changes in `#9347` or `#9364` have impacted the stability of arrow-text binding calculations?
9.  (For @dwelle/@marcelmraz) Where is the primary geometric intersection logic for binding located post-refactor?

## Next Steps
*(Updated based on analysis)*
1.  **Fix `updateBoundPoint` Logic:** Modify the `else if (intersections.length === 1)` block in `binding.ts:updateBoundPoint` to assign `newEdgePoint = intersections[0]` instead of `newEdgePoint = focusPointAbsolute`.
2.  **Test the Fix:** Thoroughly test the scenario where the arrow overlaps the source element, targeting a text element, to confirm the fix resolves the instability. Perform regression testing for other binding scenarios (arrow-to-shape, shape-to-arrow, arrow-to-arrow, different shapes).
3.  **Analyze `determineFocusDistance` (Optional but Recommended):** Add logging within `binding.ts:determineFocusDistance` to understand why a large negative focus is calculated during overlap. Log inputs (`a`, `b`, element center/dims/type) and intermediate geometric results (vector cross products, intersection points with axes) to verify its calculation under these conditions. This could reveal subtle edge cases or confirm it's behaving as expected given the geometry.
4.  **Log `intersectElementWithLineSegment` (Optional):** If the fix in step 1 isn't sufficient or for deeper confirmation, add temporary logging inside `collision.ts:intersectElementWithLineSegment`. Log the input segment, shape representation, gap, and the internal logic path to confirm exactly when and why only one intersection point (the fallback) is returned, particularly focusing on checks related to whether points are inside/outside the shape boundary.
5.  **Add Regression Test:** Create a new automated test case that specifically covers this shape-arrow-text overlap scenario to prevent future regressions.

## Additional Notes
*(Updated based on log analysis)*
- The core issue stems from incorrect handling of the `intersections.length === 1` case in `updateBoundPoint` when calculating the binding for the *source* element, specifically when the adjacent arrow point is inside the source's gapped boundary.
- The visible instability at the *target* (text) element is a cascading effect of the incorrect geometry update caused by the faulty source binding calculation.
- The large negative `focus` value (~ -1.58) calculated for the source binding during overlap appears to be a symptom of the geometric configuration (arrow segment pointing away from the center) rather than the direct cause of the jump, but it contributes to the incorrect `focusPointAbsolute` being assigned when the faulty logic path is taken.
- The logging confirmed that `intersectElementWithLineSegment` finds multiple intersections correctly for the text element binding, indicating the issue is localized to the specific handling within `updateBoundPoint` triggered by the source overlap scenario.
- The refactoring (`#9285`) might have changed how different parts of the element logic (binding, geometry, collision) interact, potentially creating new edge cases.