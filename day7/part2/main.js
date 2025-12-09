const fs = require("fs");
const input = fs.readFileSync("input.txt", "utf8")
let map = input.split("\n");

let curr_row = map.findIndex(col => {
  return col.includes("S");
});

// beamsCurrentRowMap {column: timeline_count}. initially 1 timeline at S's column
let beamsCurrentRowMap = new Map([
  (() => {
      return [map[curr_row].indexOf("S"), 1]; // [column_index, 1]
    })()
]);

let splits = 0;
let timelines = 1;

while (map[curr_row]) {
  let beamsNextRowMap = new Map();
  debugger;
  
  let add = (col, count) => {
    let current = beamsNextRowMap.get(col);
    let newTotal = (current || 0) + count; 
    return beamsNextRowMap.set(col, newTotal);
  };
  
  beamsCurrentRowMap.forEach((count, col) => {
    // If empty, beam continues straight down
    if (map[curr_row][col] === "."){
      add(col, count); // Same column, same count
    } 
    // If splitter: beam splits left and right
    else {
      add(col - 1, count);
      add(col + 1, count);
      splits++;
      timelines += count;
    }
  });
  
  beamsCurrentRowMap = beamsNextRowMap;
  curr_row++;
}

console.log(timelines)

/*
- Exactly one beam exists at S
- Using Map because beams merge: two beams can arrive at same column from different parents
*/