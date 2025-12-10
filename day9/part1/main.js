const fs = require("fs")

function parseInput(){
    const coordinates = fs.readFileSync("input.txt", "utf8").trim().split("\n").map(line => line.split(',').map(Number));
    return coordinates
}

function printGrid(coordinates, minRow, maxRow, minCol, maxCol){
    for(let row = minRow; row < maxRow; row++){
        let line = ""
        for(let col = minCol; col < maxCol; col++){
            if (coordinates.some(([c, r]) => c === col && r === row)) {
                line += "#";
            } else {
                line += ".";
            }
        }
        console.log(line)
    }    
}

function findMinMax(coordinates){
    let maxRow = -Infinity;
    let maxCol = -Infinity;
    let minRow = Infinity;
    let minCol = Infinity;
    
    // coordinates format [col, row] or [x, y]
    for (let [col, row] of coordinates) {
        maxRow = Math.max(maxRow, row);
        maxCol = Math.max(maxCol, col);
        minRow = Math.min(minRow, row);
        minCol = Math.min(minCol, col);
    }
    
    maxRow += 1;
    maxCol += 1;
    minRow -= 1;
    minCol -= 1;
    
    return { maxRow, maxCol, minRow, minCol }
}

let coordinates = parseInput()
let { maxRow, maxCol, minRow, minCol } = findMinMax(coordinates)
// printGrid(coordinates, minRow, maxRow, minCol, maxCol)



let max_area = 0;
for(let i = 0; i < coordinates.length; i++){
    let point1_col = coordinates[i][0];
    let point1_row = coordinates[i][1];
    for(let j = i+1; j < coordinates.length; j++){
        let point2_col = coordinates[j][0];
        let point2_row = coordinates[j][1];
        
        /*
          *   Columns: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11  → 10 tiles (not 9)
          *   Rows:    1, 2, 3, 4, 5                    → 5 tiles (not 4)
          *   Area:    10 × 5 = 50
        */
        let length = Math.abs(point2_col - point1_col) + 1;
        let width  = Math.abs(point2_row - point1_row) + 1;
        let area = length * width;
        
        max_area = Math.max(area, max_area);
    }
}
console.log("Max area:", max_area);













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

coordinates coordinates are as yn, xn

brute force. create a rectange b/w every other and see which one is the biggest
two nested loops. first i and second i+1



area for 2,5 and 9,7 is 24

8 * 3

Q: how do we calculate breath and heigh of rectange inside the grid given 2 coordinates.
A: 
  For that, i guess we would need the start point on the very top and start point on very left. 
  Then we can find the distance of furtest point from the left and top. 
  subtracting that with the start of point will give us width and height

Q: According to the given coordinatess, we don't have a grid. do we need to create one. if yes then how.
A;
   we can to find the maxium point and that is going to be our n*n but not sure 100 percent. 

Q: Once we have the minRow, maxRow, minCol, maxCol. we can find the width and height. now the question is how are we going to do that.
A: 
  i think we can loop through all the coordinates. and try each one,one by one.


*/


