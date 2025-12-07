const fs = require("fs");

const reducers = {
  "+": arr => arr.reduce((a, b) => a + b, 0),
  "*": arr => arr.reduce((a, b) => a * b, 1),
};

const input = fs.readFileSync("input.txt", "utf8")
let lines = input.split("\n");
let ops = lines.pop();
let arr = [];
let sum = 0;
let reduce;
for (let i = 0; i <= lines[0].length; i++) {
  debugger
  let digits = lines.map(x => x[i]).join("");
  digits = digits.trim();
  reduce = reducers[ops[i]] || reduce;
  if (digits) arr.push(+digits);
  else sum += reduce(arr.splice(0));
}
console.log(sum)