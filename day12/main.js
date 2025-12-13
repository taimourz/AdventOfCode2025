const fs = require("fs")

/**
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *                     mirror
  *
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *     mirror: Flips a shape horizontally (left ↔ right)
  *
  *     Example:
  *
  *            Original:        After mirror:
  *            ['###',    →     ['###',
  *             '##.',            '.##',
  *             '#..']            '..#']
  *
  *    row '##.':
  *           1. '##.' → split → ['#', '#', '.']
  *           2. reverse → ['.', '#', '#']
  *           3. join → '.##'
  *
**/
let mirror = t => t.map(line => line.split("").reverse().join(""));

/**
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *                     rotate
  *
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *        rotate: Rotates a shape 90° clockwise
  *
  *        Original:          After Transpose:    After Mirror (Final):
  *        ABC                AD                  DA
  *        DE.                BE                  EB
  *                           C.                  .C
  *
  *        Step by step:
  *        ['ABC',            ['AD',              ['DA',
  *         'DE.']      →      'BE',        →      'EB',
  *                            'C.']               '.C']
  *
  *        Visual with our shape:
  *        ###                ##.                 .##
  *        ##.      →         ##.       →         ##.
  *        ##.                ###                 ###
  *
  *        (column 0,1,2)  →  (now rows)  →  (reversed)
  *
**/
let rotate = t => mirror(t.map((_, i) => t.map(x => x[i]).join("")));

/**
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *                     allRotations
  *
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *   Generate 4 rotations (0°, 90°, 180°, 270°). Each angle has its own mirror
  *   Remove duplicates (some shapes look the same after certain transformations)
  *
  *   Example
  *
  *   Original shape:
  * 
  *              ##.
  *              #..
  *              #..
  *           
  *              All 8 orientations before removing duplicates:
  *           
  *              0°:              0° mirrored:
  *              ##.              .##
  *              #..              ..#
  *              #..              ..#
  *           
  *              90°:             90° mirrored:
  *              ###              ###
  *              ..#              #..
  *           
  *              180°:            180° mirrored:
  *              ..#              #..
  *              ..#              #..
  *              .##              ##.
  *           
  *              270°:            270° mirrored:
  *              #..              ..#
  *              ###              ###
  *
  *   After removing duplicates: All 8 are unique for this shape!
  *
  *   Example 
  *   (symmetric shape)
  * 
  *             .#.
  *             ###
  *             .#.
  *             
  *             This shape looks the same in ALL 8 orientations, so we'd only return 1 unique version.
  *
**/


function allRotations(image) {
    let rotations = [
          image,                          // 0°
          rotate(image),                  // 90°
          rotate(rotate(image)),          // 180°
          rotate(rotate(rotate(image))),  // 270°
        ].flatMap(x => [x, mirror(x)]);   // each rotation, add both original and mirrored

    let unique = rotations
      .map(r => r.join("\n"))                    // Convert array to string                           : ['##.','#..'] => "##.\n#.."
      .filter((v, i, a) => a.indexOf(v) === i)   // Keep only first occurrence of each unique string
      .map(r => r.split("\n"));                  // Convert back to array                              : "##.\n#.."   =>  ['##.','#..']

    return unique;
}

/**
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *                     place
  *
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *       
  *          place: Attempts to place a shape on the grid at position (x, y)
  *       
  *          Example:
  *       
  *                   Current grid (space):      Shape to place:       Position: x=1, y=0
  *                   ....                       ##.
  *                   ....                       #..
  *                   ....
  *                
  *                   Attempting to place shape at (1, 0):
  *                
  *                   Step 1: Check shape cell (0,0) which is '#'
  *                           Grid position would be (1+0, 0+0) = (1,0)
  *                           Grid[0][1] = '.' (empty) 
  *                
  *                   Step 2: Check shape cell (1,0) which is '#'
  *                           Grid position would be (1+1, 0+0) = (2,0)
  *                           Grid[0][2] = '.' (empty) 
  *                
  *                   Step 3: Check shape cell (0,1) which is '#'
  *                           Grid position would be (1+0, 0+1) = (1,1)
  *                           Grid[1][1] = '.' (empty) 
  *                
  *                   Step 4: Skip shape cell (1,1) and (2,1) - they are '.' (empty in shape)
  *                
  *          Result:
  * 
  *                   .##.     ← Row 0: placed '#' at positions 1 and 2
  *                   .#..     ← Row 1: placed '#' at position 1
  *                   ....
  *       
  *          Example:
  *          FAILED placement (collision):
  *       
  *                     Current grid:              Shape:                Position: x=0, y=0
  *                     ##..                       ##.
  *                     ....                       #..
  *       
  *       
**/       
function place(space, shape, x, y) {
    // Create a copy of the grid so we don't modify the original
    // (allows backtracking if placement doesn't work out later)
    let newSpace = space.slice(0);
    for (let sy = 0; sy < shape.length; sy++) {           // sy = shape's y coordinate (row index)
          for (let sx = 0; sx < shape[0].length; sx++) { // sx = shape's x coordinate (column index)
                  // Skip if this cell in the shape is empty ('.' or anything other than '#')
                  if (shape[sy][sx] !== "#") continue;
                  // Calculate the grid position where this shape cell would go
                  // Grid position = starting position (x,y) + offset within shape (sx,sy)
                  let gridY = y + sy;
                  let gridX = x + sx;
                  // COLLISION CHECK: Is this grid cell already occupied?
                  if (newSpace[gridY][gridX] === "#") {
                      return null;  // Can't place here! Return null to signal failure
                  }
                  // Place the shape piece on the grid
                  // We need to modify a string, so: split → change → join
                  let s = newSpace[gridY].split("");  // Convert string to array: "...." → ['.','.','.','.',]
                  s[gridX] = "#";                     // Mark this cell as occupied
                  newSpace[gridY] = s.join("");       // Convert back to string: ['.','#','.','.'] → ".#.."
                }
        }
    // All cells placed successfully! Return the new grid state
    return newSpace;
}

/**
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *                     solvable
  *
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *   Recursively tries to place all shapes using backtracking, it tries every possible way to arrange shapes.
  *
  *
**/
function solvable(area) {
  let count = 0; 
  if (area.shapes.length === 0) return true;
  let shape = area.shapes[0];
  let rotations = allRotations(shape);
  // ===== TRY EVERY ORIENTATION =====
  for (let rotation of rotations) {
    // ===== TRY EVERY POSITION ON THE GRID =====
    // Only try positions where the shape actually fits within grid bounds
    for (let y = 0; y <= area.space.length - rotation.length; y++) {
      for (let x = 0; x <= area.space[0].length - rotation[0].length; x++) {
        // ===== ATTEMPT PLACEMENT =====
        // Try to place this orientation at position (x, y)
        let space = place(area.space, rotation, x, y);
        // If placement failed (collision), skip to next position
        if (!space) continue;
        // ===== OPTIMIZATION: EARLY TERMINATION =====
        // If we've tried 20 placements without success, this puzzle is probably unsolvable
        // This prevents the algorithm from running forever on impossible puzzles
        if (++count > 20) return false;
        // ===== RECURSION: TRY PLACING REMAINING SHAPES =====
        // We successfully placed this shape! Now try to place the rest.
        // Create new area object with:
        // - Updated grid (with current shape placed)
        // - Remaining shapes (all except the one we just placed)
        if (solvable({ space, shapes: area.shapes.slice(1) })) {
          // SUCCESS! The recursion found a way to place all remaining shapes!
          return true;
        }
        // ===== IMPLICIT BACKTRACKING =====
        // If we reach here, the recursion returned false (couldn't place remaining shapes)
        // The loop automatically tries the next position/orientation
        // We don't need to explicitly "remove" the shape because we created a new grid copy
      }
    }
  }
  // ===== ALL ATTEMPTS EXHAUSTED =====
  // We tried every orientation and every position, but couldn't place this shape
  return false;
}

/**
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *                     check
  *
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *
  *    Pre-screens a puzzle before attempting expensive backtracking
  *
**/
function check(area) {
  let { shapes } = area;
  let space = shapes.reduce((sum, n) => sum + n, 0);
  let remaining = area.width * area.height - space;
  if (remaining < 0) return false;
  if (remaining > 400) return true; // can safely assume it's solvable with lots of space rem
  return solvable(area);
}

/**
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *                     Main
  *
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *
  *
**/

let shapes = fs.readFileSync("actual.txt", "utf8").split('\n\n')
let areas = shapes.pop().split("\n").filter(Boolean)
shapes = shapes.map(shape => {
  return shape.split("\n").slice(1)
});
areas = areas.map(area => {
  let [size, ...indices] = area.split(" ");
  size = size.replace(":", "").split("x").map(Number);

  return {
    width: size[0],
    height: size[1],

    space: new Array(size[1])
      .fill(0)
      .map(() => new Array(size[0]).fill(".").join("")),

    shapes: indices.flatMap((n, i) => {
      if (n === "0") return [];
      return Array(Number(n)).fill(shapes[+i]);
    }),
  };
});

let result = areas.filter(check).length;
console.log(result);