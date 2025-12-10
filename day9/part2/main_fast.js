/* 
  *
  *                     parseInput
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  *         NOTE: Coordinates are [x, y] format (column, row)
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  */
function parseInput() {
    const lines = fs.readFileSync("input.txt", "utf8")
        .trim()
        .split("\n")
        .filter(line => line.trim());
    
    return lines.map(line => {
        const [x, y] = line.trim().split(',').map(Number);
        return [x, y];
    });
}

/* 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  *
  *                     buildBoundarySegments
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  *         Connects consecutive red tiles and stores them as SEGMENTS instead of 
  *         individual tiles. This is the KEY optimization!
  *         
  *         INSTEAD OF storing millions of individual green tiles, we store RANGES.
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  *         HORIZONTAL SEGMENTS (same Y, different X):
  *           Y=1: [(7, 11)]        ← Row 1 has tiles from X=7 to X=11
  *           Y=3: [(2, 7)]         ← Row 3 has tiles from X=2 to X=7
  *           Y=5: [(2, 9)]         ← Row 5 has tiles from X=2 to X=9
  *           Y=7: [(9, 11)]        ← Row 7 has tiles from X=9 to X=11
  * 
  *         VERTICAL SEGMENTS (same X, different Y):
  *           [(11, 1, 7)]          ← Column 11 from Y=1 to Y=7
  *           [(9, 5, 7)]           ← Column 9 from Y=5 to Y=7
  *           [(2, 3, 5)]           ← Column 2 from Y=3 to Y=5
  *           [(7, 1, 3)]           ← Column 7 from Y=1 to Y=3
  * 
  * 
  */
function buildBoundarySegments(redTiles) {
    let horizontalSegments = new Map();
    let verticalSegments = [];
    let boundaryRows = new Set();
    
    
    for (let i = 0; i < redTiles.length; i++) {
        let [col1, row1] = redTiles[i];
        let [col2, row2] = redTiles[(i + 1) % redTiles.length]; // Wraps to 0 at end
        
        if (row1 === row2) {
            let minCol = Math.min(col1, col2);
            let maxCol = Math.max(col1, col2);
            
            if (!horizontalSegments.has(row1)) {
                horizontalSegments.set(row1, []);
            }
            horizontalSegments.get(row1).push([minCol, maxCol]);
            boundaryRows.add(row1);
            
        } else if (col1 === col2) {
            let minRow = Math.min(row1, row2);
            let maxRow = Math.max(row1, row2);
            
            verticalSegments.push([col1, minRow, maxRow]);
            boundaryRows.add(minRow);
            boundaryRows.add(maxRow);
        }
    }

    verticalSegments.sort((a, b) => a[1] - b[1]);

    return {
        horizontalSegments,
        verticalSegments,
        boundaryRows: Array.from(boundaryRows).sort((a, b) => a - b)
    };
}

/* 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  *
  *                     computeXBoundsByY
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * 
  *         For each Y coordinate, computes the valid X range (leftmost to rightmost)
  *         that contains red/green tiles
  * 
  *         To check if a rectangle is valid, we just need to know:
  *         "At row Y, what's the leftmost and rightmost boundary position?"
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  *         ALGORITHM:
  *           For each Y coordinate:
  *             1. Collect all X ranges from horizontal segments at this Y
  *             2. Collect all X values from vertical segments that cross this Y
  *             3. Merge overlapping ranges
  *             4. Store the overall min and max X
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  *         EXAMPLE:
  *           At Y=3:
  *             - Horizontal segment: [(2, 7)]
  *             - Vertical segments crossing Y=3: X=2, X=7, X=11
  *             - All X ranges: [(2,7), (2,2), (7,7), (11,11)]
  *             - Merged: [(2,7), (11,11)]
  *             - Overall bounds: (2, 11) ← leftmost=2, rightmost=11
  *         
  *          RESULT:
  *            Map {
  *              1: [7, 11],    ← At Y=1, X ranges from 7 to 11
  *              3: [2, 11],    ← At Y=3, X ranges from 2 to 11
  *              5: [2, 11],    ← At Y=5, X ranges from 2 to 11
  *              ...
  *            }
  * 
  */
function computeXBoundsByY(horizontalSegments, verticalSegments, allYs) {
    let xBoundsByY = new Map();
    
    for (let y of allYs) {
        let xRanges = [];
        

        debugger

        // Add horizontal segments at this Y
        if (horizontalSegments.has(y)) {
            xRanges.push(...horizontalSegments.get(y));
        }
        
        // Add vertical segments that cross this Y
        for (let [segX, segMinY, segMaxY] of verticalSegments) {
            if (segMinY <= y && y <= segMaxY) {
                xRanges.push([segX, segX]);
            }
        }
        
        if (xRanges.length === 0) continue;
        
        // Sort ranges by start position
        xRanges.sort((a, b) => a[0] - b[0]);
        
        // Merge overlapping ranges
        let merged = [];
        for (let [start, end] of xRanges) {
            if (merged.length > 0 && start <= merged[merged.length - 1][1] + 1) {
                // Overlaps or adjacent - merge
                merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end);
            } else {
                // No overlap - new range
                merged.push([start, end]);
            }
        }
        
        // Store overall min and max X for this Y
        xBoundsByY.set(y, [merged[0][0], merged[merged.length - 1][1]]);
    }
    
    return xBoundsByY;
}

/* 
  *
  *                     binarySearch (bisectLeft & bisectRight)
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * Binary search helpers for finding positions in sorted arrays
  * 
  * bisectLeft: Find the leftmost position where value could be inserted
  * bisectRight: Find the rightmost position where value could be inserted
  * 
  * EXAMPLE:
  *   arr = [1, 3, 3, 3, 5, 7]
  *   
  *   bisectLeft(arr, 3) = 1   ← First position of 3
  *   bisectRight(arr, 3) = 4  ← After last position of 3
  *   
  *   bisectLeft(arr, 4) = 4   ← Would insert between 3 and 5
  *   bisectRight(arr, 4) = 4  ← Same position
  * 
  */
function bisectLeft(arr, x) {
    let left = 0;
    let right = arr.length;
    
    while (left < right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid] < x) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    
    return left;
}

function bisectRight(arr, x) {
    let left = 0;
    let right = arr.length;
    
    while (left < right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid] <= x) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    
    return left;
}

/* 
  *
  *                     isValidRectangle
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * Checks if a rectangle is valid WITHOUT checking every tile!
  * This is the KEY optimization that makes it fast.
  * 
  * STRATEGY:
  *   Instead of checking all rows from minY to maxY, only check CRITICAL rows:
  *     1. The boundary rows (minY and maxY)
  *     2. Any boundary segment Y values within the rectangle
  *     3. Rows just above and below boundary segments (Y-1, Y+1)
  * 
  * WHY THIS WORKS:
  *   If the rectangle is valid, it means all rows are covered by the boundary.
  *   We only need to check where the boundary CHANGES (segment endpoints).
  * 
  * EXAMPLE:
  *   Rectangle from (2, 3) to (11, 5):
  *   
  *   Instead of checking rows 3, 4, 5 completely:
  *     ysToCheck = [3, 5, 4, 2, 6]  ← Only ~5 rows instead of 3-5 range
  *   
  *   For each Y in ysToCheck:
  *     - Is Y within [3, 5]? ✓
  *     - Does xBoundsByY have this Y? ✓
  *     - Is rectangle [2, 11] within boundary bounds? ✓
  * 
  * TIME COMPLEXITY:
  *   Old way: O(width × height) = could be millions of tiles
  *   New way: O(log n + k) where k is ~10-20 rows = almost instant!
  * 
  */
function isValidRectangle(minX, maxX, minY, maxY, xBoundsByY, boundaryYs) {
    // Binary search to find boundary Y values within rectangle
    let left = bisectLeft(boundaryYs, minY);
    let right = bisectRight(boundaryYs, maxY);
    
    // Collect critical Y values to check
    let ysToCheck = [minY, maxY];
    
    for (let i = left; i < right; i++) {
        let y = boundaryYs[i];
        ysToCheck.push(y);
        
        // Also check rows just above and below boundary segments
        if (y > minY) ysToCheck.push(y - 1);
        if (y < maxY) ysToCheck.push(y + 1);
    }
    
    // Validate each critical Y coordinate
    for (let y of ysToCheck) {
        if (y < minY || y > maxY) continue;
        
        // Check if this Y has any boundary coverage
        if (!xBoundsByY.has(y)) {
            return false; // No coverage at this Y - invalid!
        }
        
        let [boundMinX, boundMaxX] = xBoundsByY.get(y);
        
        // Check if rectangle extends beyond boundary
        if (minX < boundMinX || maxX > boundMaxX) {
            return false; // Rectangle sticks outside boundary - invalid!
        }
    }
    
    return true; // All checks passed - valid!
}

/* 
  *
  *                     findLargestRectangle
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * Finds the largest valid rectangle using an optimized approach
  * 
  * OPTIMIZATION: Sort pairs by area (largest first) and return IMMEDIATELY
  * when the first valid rectangle is found
  * 
  * WHY THIS IS FAST:
  *   Instead of checking all 122,760 pairs, we might only check 10-100 pairs
  *   before finding the largest valid one!
  * 
  * ALGORITHM:
  *   1. Generate all possible rectangle pairs
  *   2. Calculate area for each pair
  *   3. Sort by area (LARGEST FIRST)
  *   4. Check pairs in order
  *   5. Return IMMEDIATELY when first valid rectangle found
  * 
  * EXAMPLE WITH 8 TILES:
  *   Pair candidates sorted by area:
  *     1. (2,5) to (11,1) → area 50  → Check: INVALID (extends outside)
  *     2. (7,3) to (11,7) → area 40  → Check: INVALID
  *     3. (2,3) to (9,5)  → area 24  → Check: VALID ✓ RETURN THIS!
  *   
  *   Only checked 3 pairs instead of all 28!
  * 
  * TIME SAVED:
  *   Worst case: Check all pairs (same as before)
  *   Average case: Check < 1% of pairs
  *   Best case: Check only 1 pair!
  * 
  */
function findLargestRectangle(redTiles, xBoundsByY, boundaryYs) {
    let n = redTiles.length;
    let candidatePairs = [];
    
    // Generate all possible rectangle pairs with their areas
    for (let i = 0; i < n; i++) {
        let [x1, y1] = redTiles[i];
        
        for (let j = i + 1; j < n; j++) {
            let [x2, y2] = redTiles[j];
            
            let width = Math.abs(x2 - x1);
            let height = Math.abs(y2 - y1);
            
            // Skip degenerate rectangles (line segments)
            if (width > 0 && height > 0) {
                let area = (width + 1) * (height + 1);
                candidatePairs.push({ area, i, j });
            }
        }
    }
    
    // Sort by area (LARGEST FIRST) - this is the key optimization!
    candidatePairs.sort((a, b) => b.area - a.area);
    
    // Check pairs in order, return immediately when valid found
    for (let { area, i, j } of candidatePairs) {
        let [x1, y1] = redTiles[i];
        let [x2, y2] = redTiles[j];
        
        let minX = Math.min(x1, x2);
        let maxX = Math.max(x1, x2);
        let minY = Math.min(y1, y2);
        let maxY = Math.max(y1, y2);
        
        if (isValidRectangle(minX, maxX, minY, maxY, xBoundsByY, boundaryYs)) {
            // Found the largest valid rectangle!
            return { 
                area, 
                pair: [redTiles[i], redTiles[j]],
                corners: { minX, maxX, minY, maxY }
            };
        }
    }
    
    return { area: 0, pair: null };
}

/* 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  *
  *                     Main Execution
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  *         1. Parse input → Get red tile coordinates 
  *         2. Build boundary segments → Convert tiles to X/Y ranges
  *         3. Compute X bounds for all Y values → Build lookup table
  *         4. Find largest rectangle → Try pairs largest-first
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  *          NOTE:
  *            By pre-computing boundary information and checking only critical rows,
  *            we reduce millions of tile checks to just a few dozen segment checks!
  *          
  *          OLD SLOW APPROACH:
  *            496 tiles with 5-digit coordinates:
  *              - Old approach: Hours or days
  *              - This approach: Seconds
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  */

const fs = require("fs");
let redTiles = parseInput();
let { horizontalSegments, verticalSegments, boundaryRows } = buildBoundarySegments(redTiles);

let allYs = new Set(boundaryRows);

// Add Y-1 and Y+1 for each boundary Y
for (let y of boundaryRows) {
    allYs.add(y - 1);
    allYs.add(y + 1);
}

// Add Y coordinates of all red tiles
for (let [x, y] of redTiles) {
    allYs.add(y);
}

let xBoundsByY = computeXBoundsByY(horizontalSegments, verticalSegments, allYs);

let { area, pair, corners } = findLargestRectangle(redTiles, xBoundsByY, boundaryRows);

console.log(area)
