const fs = require("fs");

/* 
  *
  *                     parseInput
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * 
  */
function parseInput() {
    const coordinates = fs.readFileSync("input.txt", "utf8")
        .trim()
        .split("\n")
        .map(line => line.split(',').map(Number));
    return coordinates;
}

/* 
  *
  *                     findMinMax
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * Finds the boundaries of the grid with padding
  * 
  * EXAMPLE:
  *   If red tiles span from col 2-11 and row 1-7:
  *   
  *   BEFORE PADDING:
  *     minCol: 2, maxCol: 11
  *     minRow: 1, maxRow: 7
  *   
  *   AFTER PADDING (+2 on max, -1 on min):
  *     minCol: 1, maxCol: 13
  *     minRow: 0, maxRow: 9
  * 
  * This ensures we have space around the edges for proper flood fill
  * 
  */
function findMinMax(coordinates) {
    let maxRow = Math.max(...coordinates.map(([col, row]) => row));
    let maxCol = Math.max(...coordinates.map(([col, row]) => col));
    let minRow = Math.min(...coordinates.map(([col, row]) => row));
    let minCol = Math.min(...coordinates.map(([col, row]) => col));
    
    return { maxRow: maxRow + 2, maxCol: maxCol + 2, minRow: minRow - 1, minCol: minCol - 1 };
}

/* 
  *
  *                     connectPoints
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * Draws a straight line between two points on the grid
  * The line can be either horizontal or vertical (or both if it's the same point)
  * 
  * EXAMPLE - HORIZONTAL LINE:
  *   p1: [7, 1]  (col 7, row 1)
  *   p2: [11, 1] (col 11, row 1)
  *   
  *   Result: Marks grid at:
  *     row 1: columns 7, 8, 9, 10, 11
  *     
  *     ..............
  *     .......#XXX#..  ← These positions get marked
  *     ..............
  * 
  * EXAMPLE - VERTICAL LINE:
  *   p1: [11, 1] (col 11, row 1)
  *   p2: [11, 7] (col 11, row 7)
  *   
  *   Result: Marks grid at:
  *     col 11: rows 1, 2, 3, 4, 5, 6, 7
  *     
  *     ...........#..  ← row 1
  *     ...........X..  ← row 2
  *     ...........X..  ← row 3
  *     ...........X..  ← row 4
  *     ...........X..  ← row 5
  *     ...........X..  ← row 6
  *     ...........#..  ← row 7
  * 
  * GRID FORMAT: grid.set("row,col", 1)
  * 
  */
function connectPoints(p1, p2, grid) {
    let [col1, row1] = p1;
    let [col2, row2] = p2;
    
    let colStep = col1 < col2 ? 1 : col1 > col2 ? -1 : 0;
    let rowStep = row1 < row2 ? 1 : row1 > row2 ? -1 : 0;
    
    let col = col1;
    let row = row1;
    
    while (col !== col2 || row !== row2) {
        grid.set(`${row},${col}`, 1);
        col += colStep;
        row += rowStep;
    }
    grid.set(`${row2},${col2}`, 1); // Include endpoint
}

// Find a point that's inside the boundary
function findInsidePoint(grid, minRow, maxRow, minCol, maxCol) {
    // Try random points
    for (let attempt = 0; attempt < 1000; attempt++) {
        let testCol = minCol + Math.floor(Math.random() * (maxCol - minCol));
        let testRow = minRow + Math.floor(Math.random() * (maxRow - minRow));
        
        if (grid.get(`${testRow},${testCol}`) === 1) continue;
        
        // Check if this point can reach the edge (BFS)
        let queue = [[testCol, testRow]];
        let visited = new Set();
        let reachedEdge = false;
        
        while (queue.length > 0) {
            let [cx, cy] = queue.shift();
            let key = `${cy},${cx}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            // If reached edge of grid, this point is outside
            if (cx < minCol || cx >= maxCol || cy < minRow || cy >= maxRow) {
                reachedEdge = true;
                break;
            }
            
            // If hit boundary, stop this direction
            if (grid.get(`${cy},${cx}`) === 1) continue;
            
            // Explore neighbors
            queue.push([cx + 1, cy]);
            queue.push([cx - 1, cy]);
            queue.push([cx, cy + 1]);
            queue.push([cx, cy - 1]);
        }
        
        // If couldn't reach edge, this is inside!
        if (!reachedEdge) {
            return [testCol, testRow];
        }
    }
    
    return null;
}

/* 
  *
  *                     fillInterior
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * Flood fills all empty tiles inside the boundary, marking them as green
  * 
  * ALGORITHM: Breadth-First Search (BFS)
  *   1. Start from one inside point
  *   2. Spread in all 4 directions (up, down, left, right)
  *   3. Stop when hitting the boundary
  *   4. Mark all reached tiles as filled
  * 
  * BEFORE FILLING:
  *   ..............
  *   .......#XXX#..  ← Boundary only
  *   .......X...X..  ← Empty inside
  *   ..#XXXX#...X..
  *   ..X........X..  ← Empty inside
  *   ..#XXXXXX#.X..
  *   .........X.X..
  *   .........#X#..
  *   ..............
  * 
  * AFTER FILLING:
  *   ..............
  *   .......#XXX#..
  *   .......XXXXX..  ← Now filled!
  *   ..#XXXX#XXXX..
  *   ..XXXXXXXXXX..  ← Now filled!
  *   ..#XXXXXX#XX..
  *   .........XXX..
  *   .........#X#..
  *   ..............
  * 
  * GRID FORMAT: grid.set("row,col", 1) marks a tile as filled
  * 
  */
function fillInterior(grid, insidePoint, minRow, maxRow, minCol, maxCol) {
    let queue = [insidePoint];
    let visited = new Set();
    
    while (queue.length > 0) {
        let [cx, cy] = queue.shift();
        let key = `${cy},${cx}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        // If hit boundary, stop
        if (grid.get(`${cy},${cx}`) === 1) continue;
        
        // Mark as interior (green tile)
        grid.set(`${cy},${cx}`, 1);
        
        // Explore neighbors (with bounds checking)
        if (cx + 1 < maxCol) queue.push([cx + 1, cy]);
        if (cx - 1 >= minCol) queue.push([cx - 1, cy]);
        if (cy + 1 < maxRow) queue.push([cx, cy + 1]);
        if (cy - 1 >= minRow) queue.push([cx, cy - 1]);
    }
}

/* 
  *
  *                     createCompleteGrid
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * Creates the complete grid with both boundary and interior marked
  * 
  * STEPS:
  *   1. Draw boundary by connecting consecutive red tiles
  *      - Connect red tile [0] to [1]
  *      - Connect red tile [1] to [2]
  *      - ...
  *      - Connect red tile [7] to [0] (wraps around to close the loop)
  *   
  *   2. Find one point inside the boundary
  *   
  *   3. Flood fill from that point to mark all interior
  * 
  * EXAMPLE WITH 4 RED TILES:
  *   
  *   Red tiles: [A, B, C, D]
  *   
  *   Step 1 - Draw boundary:
  *     A → B → C → D → A (back to start)
  *     
  *   Step 2 - Find inside point:
  *     Test random points until we find one that can't reach the edge
  *     
  *   Step 3 - Flood fill:
  *     Spread from inside point to fill all interior
  * 
  * RETURNS:
  *   Map with keys "row,col" and value 1 for all filled tiles
  * 
  */
function createCompleteGrid(coordinates, minRow, maxRow, minCol, maxCol) {
    let grid = new Map();
    
    // Step 1: Draw boundary by connecting consecutive red tiles
    for (let i = 0; i < coordinates.length; i++) {
        let current = coordinates[i];
        let next = coordinates[(i + 1) % coordinates.length]; // Wraps to 0 at end
        connectPoints(current, next, grid);
    }
    
    // Step 2: Find a point inside
    let insidePoint = findInsidePoint(grid, minRow, maxRow, minCol, maxCol);
    
    // Step 3: Flood fill interior
    if (insidePoint) {
        fillInterior(grid, insidePoint, minRow, maxRow, minCol, maxCol);
    }
    
    return grid;
}

/* 
  *
  *                     printGrid
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * Visualizes the grid with red (#) and green (X) tiles
  * 
  * SYMBOLS:
  *   # = Red tile (original coordinate from input)
  *   X = Green tile (boundary connection or interior fill)
  *   . = Empty tile (not part of the loop region)
  * 
  * EXAMPLE OUTPUT:
  *   ..............
  *   .......#XXX#..  ← Red at (7,1) and (11,1), green between
  *   .......XXXXX..
  *   ..#XXXX#XXXX..  ← Red at (2,3) and (7,3), green around
  *   ..XXXXXXXXXX..
  *   ..#XXXXXX#XX..  ← Red at (2,5) and (9,5), green around
  *   .........XXX..
  *   .........#X#..  ← Red at (9,7) and (11,7), green between
  *   ..............
  * 
  */
function printGrid(coordinates, grid, minRow, maxRow, minCol, maxCol) {
    for (let row = minRow; row < maxRow; row++) {
        let line = "";
        for (let col = minCol; col < maxCol; col++) {
            let isRed = coordinates.some(([c, r]) => c === col && r === row);
            let isGreen = grid.get(`${row},${col}`) === 1 && !isRed;
            
            if (isRed) {
                line += "#";
            } else if (isGreen) {
                line += "X";
            } else {
                line += ".";
            }
        }
        console.log(line);
    }
}

/* 
  *
  *                     isRectangleValid
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * Checks if a rectangle contains ONLY red or green tiles (no empty tiles)
  * 
  * INPUTS:
  *   (col1, row1): First red tile corner
  *   (col2, row2): Second red tile corner (opposite diagonal)
  *   grid: Map of all filled tiles
  *   coordinates: Array of all red tile positions
  * 
  * VALIDATION PROCESS:
  *   For each tile in the rectangle:
  *     - Is it a red tile? ✓ Valid
  *     - Is it in the grid (green)? ✓ Valid
  *     - Is it empty? ✗ INVALID
  * 
  * EXAMPLE - VALID RECTANGLE:
  *   Rectangle from (2,3) to (9,5):
  *   
  *   ..#XXXX#XXXX..  ← row 3: all tiles from col 2-9 are red/green ✓
  *   ..XXXXXXXXXX..  ← row 4: all tiles from col 2-9 are green ✓
  *   ..#XXXXXX#XX..  ← row 5: all tiles from col 2-9 are red/green ✓
  *   
  *   Result: TRUE (area = 8 × 3 = 24)
  * 
  * EXAMPLE - INVALID RECTANGLE:
  *   Rectangle from (2,5) to (11,1):
  *   
  *   .......#XXX#..  ← row 1: columns 2-6 are EMPTY dots ✗
  *   
  *   Result: FALSE (contains empty tiles)
  * 
  */
function isRectangleValid(col1, row1, col2, row2, grid, coordinates) {
    let minCol = Math.min(col1, col2);
    let maxCol = Math.max(col1, col2);
    let minRow = Math.min(row1, row2);
    let maxRow = Math.max(row1, row2);
    
    // Check every tile in the rectangle
    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            // Check if this position has a red tile
            let isRed = coordinates.some(([c, r]) => c === col && r === row);
            // Check if this position is in the grid (red or green)
            let inGrid = grid.get(`${row},${col}`) === 1;
            
            // If it's neither red nor in grid, it's an empty tile
            if (!isRed && !inGrid) {
                return false; // Found an empty tile - INVALID
            }
        }
    }
    
    return true; // All tiles are red or green - VALID
}

/* 
  *
  *                     findMaxRectangle
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * Finds the largest valid rectangle using red tiles as opposite corners
  * 
  * ALGORITHM:
  *   1. Try every pair of red tiles (nested loops)
  *   2. For each pair, check if the rectangle is valid
  *   3. If valid, calculate area = width × height
  *   4. Track the maximum area found
  * 
  * AREA CALCULATION:
  *   Width = |col2 - col1| + 1  (inclusive of both endpoints)
  *   Height = |row2 - row1| + 1
  *   Area = Width × Height
  * 
  * EXAMPLE WITH 8 RED TILES:
  *   Tile 0: [7, 1]
  *   Tile 1: [11, 1]
  *   ...
  *   
  *   Pairs to try:
  *     (0,1): [7,1] to [11,1]  → check if valid
  *     (0,2): [7,1] to [11,7]  → check if valid
  *     (0,3): [7,1] to [9,7]   → check if valid
  *     ...
  *     Total: 8 × 7 / 2 = 28 pairs
  * 
  * EXPECTED OUTPUT FOR EXAMPLE:
  *   maxArea: 24
  *   bestRect: {
  *     col1: 2, row1: 5,  ← Bottom-left corner
  *     col2: 9, row2: 3,  ← Top-right corner
  *     width: 8,
  *     height: 3
  *   }
  * 
  */
function findMaxRectangle(coordinates, grid) {
    let maxArea = 0;
    let bestRect = null;
    
    // Try every pair of red tiles
    for (let i = 0; i < coordinates.length; i++) {
        for (let j = i + 1; j < coordinates.length; j++) {
            let [col1, row1] = coordinates[i];
            let [col2, row2] = coordinates[j];
            
            // Check if this rectangle only contains red/green tiles
            if (isRectangleValid(col1, row1, col2, row2, grid, coordinates)) {
                // Calculate area (add 1 for inclusive counting)
                let width = Math.abs(col2 - col1) + 1;
                let height = Math.abs(row2 - row1) + 1;
                let area = width * height;
                
                // Update max if this is larger
                if (area > maxArea) {
                    maxArea = area;
                    bestRect = { col1, row1, col2, row2, width, height };
                }
            }
        }
    }
    
    return { maxArea, bestRect };
}

/* 
  *
  *                     Main Execution
  * 
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  * 
  * 
  * 1. Parse Input (gives us red tiles)
  *    
  * 2. Find Grid Boundaries
  *    Determine min/max rows and columns (with padding)
  *    
  * 3. Create Complete Grid
  *    a) Draw boundary (connect consecutive red tiles)
  *    b) Find one point inside the boundary
  *    c) Flood fill to mark all interior tiles as green
  *    
  * 4. Visualize
  *    Print the grid with # (red) and X (green)
  *    
  * 5. Find Maximum Rectangle
  *    Try all pairs of red tiles and find largest valid rectangle
  *    
  * 6. Output Result
  *    Display the maximum area and best rectangle coordinates
  * 
  * PART 1 VS PART 2:
  *   Part 1: Any two red tiles → simple area calculation
  *   Part 2: Rectangle must only contain red/green tiles → validation needed
  * 
  */

// Main execution
let coordinates = parseInput();
console.log("Red tiles:", coordinates);

let { maxRow, maxCol, minRow, minCol } = findMinMax(coordinates);
console.log("Grid dimensions:", { maxRow, maxCol, minRow, minCol });

let grid = createCompleteGrid(coordinates, minRow, maxRow, minCol, maxCol);

console.log("\nGrid visualization:");
// printGrid(coordinates, grid, minRow, maxRow, minCol, maxCol);

let result = findMaxRectangle(coordinates, grid);
console.log("\nMaximum valid rectangle area:", result.maxArea);
console.log("Best rectangle:", result.bestRect);



/*


7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3

..............
.......#...#..
..............
..#....#......
..............
..#......#....
..............
.........#.#..
..............


observations: 


so all the bounderies are connected in a straight line, which means we can ignore the diagonals. 
Q: so after making all the connections. we need to look inside this boundry according the points we are given and find the largest area. how to do that
A:
  can we keep record of the coordinates that are connected. if they are in the same same row we can have a start point and end point.
  but the problem with this if there is a tile below them in the middle then that boundry is irrelevant. 


it is different from part 1 b/c we need to check: are ALL the tiles in that rectangle either red or green?
so, Rectangle must only contain red/green tiles = need to validate every tile inside the boundary




*/