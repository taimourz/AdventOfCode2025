const fs = require("fs");

const data = fs.readFileSync("input.txt", "utf8").split("\n").filter(line => line.trim());
const ranges = data.map(line => line.split('-').map(Number));

ranges.sort((a, b) => {
    return a[0] - b[0];
 })

const mergedRanges = [];
let [currentStart, currentEnd] = ranges[0];

for (let i = 1; i < ranges.length; i++) {
  const [nextStart, nextEnd] = ranges[i];
  
  if (nextStart <= currentEnd + 1) {
    currentEnd = Math.max(currentEnd, nextEnd);
  } else {
    mergedRanges.push([currentStart, currentEnd]);
    currentStart = nextStart;
    currentEnd = nextEnd;
  }
}

mergedRanges.push([currentStart, currentEnd]);

let totalFreshIDs = 0;
for (let i = 0; i < mergedRanges.length; i++) {
  const [start, end] = mergedRanges[i];
  const count = end - start + 1;
  totalFreshIDs += count;
}

console.log(totalFreshIDs)





// OLD
// const fs = require("fs");

// const data = fs.readFileSync("input.txt", "utf8").split("\n");

// ranges = []
// ids = []
// i = 0
// const fresh_ids_set = new Set();
// while(i < data.length){
//     ranges[i] = data[i].split('-').map(Number)
//     while(ranges[i][0] <= ranges[i][1]){
//         fresh_ids_set.add(ranges[i][0])
//         ranges[i][0]++;
//     }
//     i++;
// }

// console.log(fresh_ids_set)