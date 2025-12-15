/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *                     powerSet
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *     powerSet: Generates all possible subsets of an array
 *
 **/
function* powerSet(arr) {
  const n = arr.length;
  const total = 1 << n;  // 2^n (bit shift: 1 << 3 = 8)
  
  // Generate all numbers from 0 to 2^n - 1
  for (let i = 0; i < total; i++) {
    const subset = [];
    
    // Check each bit position
    for (let j = 0; j < n; j++) {
      // If bit j is set in number i, include arr[j]
      if (i & (1 << j)) {
        subset.push(arr[j]);
      }
    }
    
    yield subset;
  }
}

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *                     producePatterns
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *     producePatterns: Precomputes all possible parity patterns from button combinations
 * 
 *      Depends on input: eg [.##.]
 *      All subsets:
 *                "0000", "0001", "0010", "0011", "0100", "0101", "0110", "0111"
 *                "1000", "1001", "1010", "1011", "1100", "1101", "1110", "1111"
 *
 *        Butons:
 *               0: (3)      → affects position 3
 *               1: (1,3)    → affects positions 1 and 3
 *               2: (2)      → affects position 2
 *               3: (2,3)    → affects positions 2 and 3
 *               4: (0,2)    → affects positions 0 and 2
 *               5: (0,1)    → affects positions 0 and 1        
 *
 *       Example output:
 *              patterns["0000"] = 
 *                                1)  [(2), (2,3), (3)]]
 *                                2)  [3] [1, 3] [2] [0, 2] [0, 1]]
 *                                3)  [[1, 3] [2, 3] [0, 2] [0, 1]]
 *                                ... so on
 **/
function producePatterns(buttons, length) {
  let patterns = {};
  
  // Generate all possible subsets of buttons (2^n combinations)
  for (let pressed of powerSet(buttons)) {
    // Track how many times each counter is affected
    let lights = Array(length).fill(0);
    
    // Apply each button in this subset
    for (let button of pressed) {
      for (let i of button) {
        lights[i]++;  // Increment counter at position i
      }
    }
    
    // Convert to parity pattern (odd=1, even=0)
    // [1, 2, 1] → [1, 0, 1] → "101"
    let key = lights.map(x => x % 2).join("");
    
    // Store this button combination under its parity pattern
    patterns[key] = (patterns[key] || []).concat([pressed]);
  }
  
  return patterns;
}

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *                     parse
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *
 **/
function parse(input) {
  return input.split("\n").map(line => {
    let parts = line.replaceAll(/[[\](){}]/g, "").split(" ");
    let indicator = parts[0].replace(/./g, c => (c === "#" ? 1 : 0));
    let buttons = parts.slice(1, -1).map(x => x.split(",").map(Number));
    let jolts = parts.at(-1).split(",").map(Number);
    let patterns = producePatterns(buttons, indicator.length);
    
    return { indicator, buttons, jolts, patterns };
  });
}

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *                     minimumPresses
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *     minimumPresses: Finds minimum button presses to reach target joltage
 *
 *     Example:
 *                Target: [3, 5, 4, 7]
 *                         ↓  ↓  ↓  ↓
 *                Parity: [1, 1, 0, 1]  (odd, odd, even, odd)
 *                         ↓
 *                Key:    "1101"
 *                         ↓
 *                Lookup: patterns["1101"][0] = [[1,3], [2], [0,2]]
 *
 *                pressed = [[1,3], [2], [0,2]]  
 *                next = [3, 5, 4, 7]
 *
 *                Press button [1,3]:
 *                        next[1]--  => [3, 4, 4, 7]
 *                        next[3]--  => [3, 4, 4, 6]
 *
 *                Press button [2]:
 *                        next[2]--  => [3, 4, 3, 6]
 *
 *                Press button [0,2]:
 *                        next[0]--  => [2, 4, 3, 6]
 *                        next[2]--  => [2, 4, 2, 6]
 *
 *                ALL EVEN!
 *                        next = [2, 4, 2, 6]
 *
 *                Dviide by 2:
 *                        next = [1, 2, 1, 3]
 *
 **/
function minimumPresses(target, patterns) {
    debugger
  if (target.every(x => x === 0)) return 0;
  if (target.some(x => x < 0)) return Infinity;
  let totals = []
  let parityKey = target.map(x => x % 2).join("");
  let options = patterns[parityKey] || [];
  for (let pressed of options) {
    debugger
    let next = target.slice(0);
    
    for (let button of pressed) {
      for (let i of button) {
        next[i]--;
      }
    }
    // Now all counters are even (parity matched)
    
    // Divide by 2 to get subproblem
    // If we need [2, 4, 6], recursively solve for [1, 2, 3]
    // and multiply result by 2
    next = next.map(x => x / 2);
    
    // Total presses = buttons pressed now + 2 * (presses for half-target)
    totals.push(pressed.length + 2 * minimumPresses(next, patterns));
  }
  
  return Math.min(...totals);
}
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *                     part2
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 **/
function part2(input) {
  return parse(input).reduce((sum, { jolts, patterns }) => {
    return sum + minimumPresses(jolts, patterns);
  }, 0);
}


const fs = require("fs")
let input = fs.readFileSync("test.txt", "utf8")
console.log(part2(input))