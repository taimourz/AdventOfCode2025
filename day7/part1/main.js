const fs = require("fs");

function check_bounds(i, j, row, col){
    if(i >= 0 && j >= 0 && i < row && j < col){
        return true
    }
    return false
}
const input = fs.readFileSync("input.txt", "utf8")
let lines = input
  .split('\n')
  .map(line => line.split(''));
  
let row = lines.length
let col = lines[0].length
let total = 0

// First, trace the initial beam from S
for(let i = 0; i < row; i++){
    for(let j = 0; j < col; j++){
        if(lines[i][j] == 'S'){
            for(let k = i+1; k < row; k++){
                if(lines[k][j] == '^') break;
                lines[k][j] = '|';
            }
        }
    }
}

// Then process splitters
for(let i = 0; i < row; i++){
    for(let j = 0; j < col; j++){
        debugger
        /*
            i > 0                        : makes sure we are not on first row, 
            lines[i-1][j] == '|' or S    : checks if there is a beam directly above or if it starting point

        */
        if(lines[i][j] == '^' && (i > 0 && (lines[i-1][j] == '|' || lines[i-1][j] == 'S'))){ // Only if beam hits it
            total++;
            // old logic change 
            if(check_bounds(i, j+1, row, col)){
                for(let k = i+1; k < row; k++){
                    if(check_bounds(k, j+1, row, col) && lines[k][j+1] != '^'){
                        lines[k][j+1] = '|'
                    } else {
                        break;
                    }
                }
            }
            if(check_bounds(i, j-1, row, col)){ 
                for(let k = i+1; k < row; k++){ 
                    if(check_bounds(k, j-1, row, col) && lines[k][j-1] != '^'){ 
                        lines[k][j-1] = '|'
                    } else {
                        break;
                    }
                }                
            }
        }
    }
}
for (let i = 0; i < row; i++) {
  let line = "";
  for (let j = 0; j < col; j++) {
    line += lines[i][j] + " ";
  }
  console.log(line);
}
console.log(total);


/*
input
.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............


output
.......S.......
.......|.......
......|^|......
......|.|......
.....|^|^|.....
.....|.|.|.....
....|^|^|^|....
....|.|.|.|....
...|^|^|||^|...
...|.|.|||.|...
..|^|^|||^|^|..
..|.|.|||.|.|..
.|^|||^||.||^|.
.|.|||.||.||.|.
|^|^|^|^|^|||^|
|.|.|.|.|.|||.|


00 01 02 03 04
10 11  | 13 14
20  |  ^ | 24
|  ^   | ^ |
40 41 42 43 44


each hat(^) has pipes around it. 
first iteration, set pipes around each hat.
second iteration, set pope directly above the hat, except the top most


first
...............
......|^|......
...............
.....|^|^|.....
...............
....|^|^|^|....
...............
...|^|^|.|^|...
...............
..|^|^|.|^|^|..
...............
.|^|.|^|...|^|.
...............
|^|^|^|^|^|.|^|
...............


second

.......S....... 
.......|.......
......|.|......
.....|^|^|.....
.....|.|.|.....
....|^|^|^|....
....|.|...|....
...|^|^|.|^|...
...|.|...|.|...
..|^|^|.|^|^|..
..|...|.....|..
.|^|.|^|...|^|.
.|.|.|.|.|...|.
|^|^|^|^|^|.|^|
...............


















*/