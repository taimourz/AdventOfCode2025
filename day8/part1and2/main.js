  /* 
    *
    *                     connectPair
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
    * CASE 1: Both are NEW (neither has been connected before)
    *
    * 
    *       BEFORE:
    *       Junction A: { x: 10, y: 20, z: 30, circuit: null }
    *       Junction B: { x: 40, y: 50, z: 60, circuit: null }
    *       
    *       AFTER:
    *       Junction A: { x: 10, y: 20, z: 30, circuit: Symbol(abc) }
    *       Junction B: { x: 40, y: 50, z: 60, circuit: Symbol(abc) }
    * 
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
    * CASE 2: ONE is new, ONE is already in a circuit
    *
    *
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    *       BEFORE:
    *       Junction A: { circuit: Symbol(xyz) }  ← already in a circuit
    *       Junction B: { circuit: null }         ← new
    *       
    *       Evaluate: a.circuit || b.circuit
    *                = Symbol(xyz) || null
    *                = Symbol(xyz)  ← picks the non-null one
    *       
    *       AFTER:
    *       Junction A: { circuit: Symbol(xyz) }
    *       Junction B: { circuit: Symbol(xyz) }  ← joined A's circuit!
    * 
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
    * CASE 3: BOTH are in circuits, but DIFFERENT circuits (MERGE!)
    * 
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    *       BEFORE:
    *            Circuit X (Symbol(abc)):
    *              Junction 0: { circuit: Symbol(abc) }
    *              Junction 7: { circuit: Symbol(abc) }
    *              Junction 19: { circuit: Symbol(abc) }
    *            
    *            Circuit Y (Symbol(xyz)):
    *              Junction 14: { circuit: Symbol(xyz) }
    *              Junction 3: { circuit: Symbol(xyz) }
    *            
    *            Other junctions:
    *              Junction 1: { circuit: null }
    *              Junction 5: { circuit: null }
    *       
    *       AFTER:
    *            Circuit X (Symbol(abc)):  ← NOW MERGED!
    *              Junction 0: { circuit: Symbol(abc) }
    *              Junction 7: { circuit: Symbol(abc) }
    *              Junction 19: { circuit: Symbol(abc) }
    *              Junction 14: { circuit: Symbol(abc) }  ← Changed from xyz to abc
    *              Junction 3: { circuit: Symbol(abc) }   ← Changed from xyz to abc
    *            
    *            Other junctions:
    *              Junction 1: { circuit: null }
    *              Junction 5: { circuit: null }  
  */
function connectPair(pair, junctions) {
  debugger
  let { a, b } = pair;
  if (a.circuit === null && b.circuit === null) {
    a.circuit = b.circuit = Symbol(); 
  } else if (a.circuit === null || b.circuit === null) {
    a.circuit = b.circuit = a.circuit || b.circuit;
  } else if (a.circuit !== b.circuit) {
    junctions
      .filter(junction => junction.circuit === b.circuit)
      .forEach(junction => (junction.circuit = a.circuit));
  }
  return pair;
}




  /* 
    *
    *                     circuitSizes
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
    * 1) Filter out unconnected junctions
    *
    *
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    *
    * 
    *     junctions = [
    *       { x: 10, y: 20, z: 30, circuit: Symbol(A) },  ← keep
    *       { x: 40, y: 50, z: 60, circuit: Symbol(A) },  ← keep
    *       { x: 70, y: 80, z: 90, circuit: null },       ← remove
    *       { x: 11, y: 22, z: 33, circuit: Symbol(B) },  ← keep
    *       { x: 44, y: 55, z: 66, circuit: null },       ← remove
    *       { x: 77, y: 88, z: 99, circuit: Symbol(B) },  ← keep
    *     ]
    * 
    * 
    *     connected = [
    *       { x: 10, y: 20, z: 30, circuit: Symbol(A) },
    *       { x: 40, y: 50, z: 60, circuit: Symbol(A) },
    *       { x: 11, y: 22, z: 33, circuit: Symbol(B) },
    *       { x: 77, y: 88, z: 99, circuit: Symbol(B) },
    *     ]
    * 
    * 
    *  
    * 
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
    * 2) Group junctions by their circuit
    * 
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
    *     connected = [
    *       { x: 10, y: 20, z: 30, circuit: Symbol(A) },
    *       { x: 40, y: 50, z: 60, circuit: Symbol(A) },
    *       { x: 70, y: 80, z: 90, circuit: Symbol(A) },
    *       { x: 11, y: 22, z: 33, circuit: Symbol(B) },
    *       { x: 44, y: 55, z: 66, circuit: Symbol(B) },
    *       { x: 77, y: 88, z: 99, circuit: Symbol(C) },
    *       { x: 88, y: 99, z: 11, circuit: Symbol(C) },
    *       { x: 99, y: 11, z: 22, circuit: Symbol(C) },
    *       { x: 12, y: 23, z: 34, circuit: Symbol(C) },
    *     ]
    * 
    * 
    *    circuits = Map {
    *      Symbol(A) => [
    *        { x: 10, y: 20, z: 30, circuit: Symbol(A) },
    *        { x: 40, y: 50, z: 60, circuit: Symbol(A) },
    *        { x: 70, y: 80, z: 90, circuit: Symbol(A) }
    *      ],
    *      Symbol(B) => [
    *        { x: 11, y: 22, z: 33, circuit: Symbol(B) },
    *        { x: 44, y: 55, z: 66, circuit: Symbol(B) }
    *      ],
    *      Symbol(C) => [
    *        { x: 77, y: 88, z: 99, circuit: Symbol(C) },
    *        { x: 88, y: 99, z: 11, circuit: Symbol(C) },
    *        { x: 99, y: 11, z: 22, circuit: Symbol(C) },
    *        { x: 12, y: 23, z: 34, circuit: Symbol(C) }
    *      ]
    *    }
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
    * 3) Extract the size (length) of each circuit
    * 
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
    * 
    *      circuits = Map {
    *        Symbol(A) => [junction, junction, junction],           ← array of 3
    *        Symbol(B) => [junction, junction],                     ← array of 2
    *        Symbol(C) => [junction, junction, junction, junction]  ← array of 4
    *      }
    * 
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
    * 4) Convert to array and sort (largest first)
    * 
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
  */
function circuitSizes(junctions) {
  let connected = junctions.filter(junction => junction.circuit !== null);
  let circuits = Map.groupBy(connected, junction => junction.circuit);
  let sizes = circuits.values().map(circuit => circuit.length);
  return sizes.toArray().sort((a, b) => b - a);
}

  /* 
    *
    *                     AllConnected
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
    * 
  */

function allConnected(junctions) {
  let { circuit } = junctions[0];
  return circuit && junctions.every(junction => junction.circuit === circuit);
}  


  /* 
    *
    *                     Parse Input
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
    * 
  */

function parse(input) {
  let junctions = input.split("\n").map(line => {
    let [x, y, z] = line.split(",").map(Number);
    return { x, y, z, circuit: null };
  });

  let pairs = [];
  for (let i = 0; i < junctions.length; i++) {
    for (let j = i + 1; j < junctions.length; j++) {
      let a = junctions[i];
      let b = junctions[j];
      let dist = Math.sqrt(
        (a.x - b.x) ** 2 +
        (a.y - b.y) ** 2 +
        (a.z - b.z) ** 2
      );
      pairs.push({ a, b, dist });
    }
  }

  pairs.sort((p1, p2) => p1.dist - p2.dist);

  return { junctions, pairs };
}

  /* 
    *
    *                     Part 1
    *  Find 3 Largest Circuits After 1000 Connections
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    *  1) Created junction objects with (x, y, z) coordinates 
    *  2) Found distance between every pair of junctions
    *  3) Sorted by distance
    *  4) Connected the 1000 closest pairs, Skipped pairs already in the same circuit
    *  5) Found how many junctions in each circuit 
    *  6) Multiplied size of top 3
    * 
    * 
    * 
  */


function part1(input){
  let times = 1000 // use 10 for sample input
  const { junctions, pairs } = parse(input);
  for (let i = 0; i < times; i++) connectPair(pairs[i], junctions);  
  circuitSizes(junctions).slice(0, 3).reduce((a, b) => a * b, 1);
  let size = circuitSizes(junctions).slice(0, 3).reduce((a, b) => a * b, 1);
  console.log(size)
}

  /* 
    *
    *                     Part 2
    *     Connect Everything Into One Circuit
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 1) same as part 1 but continue until allConnected() returns true
    * 
    * 
    * 
  */

function part2(input) {
  let pair;
  let { junctions, pairs } = parse(input);
  while (!allConnected(junctions)) pair = connectPair(pairs.shift(), junctions); // shift removes the first element from array
  let ans = pair.a.x * pair.b.x;
  console.log(ans)
}
  /* 
    *
    *                     Main
    * 
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
    * 
    * 
    * 
  */


const fs = require("fs");
const input = fs.readFileSync("input.txt", "utf8")
part1(input)
part2(input)