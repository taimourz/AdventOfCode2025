const fs = require("fs");

let batteries = [];
let total = 0;

const data = fs.readFileSync("input.txt", "utf8").split("\n");
for (let line of data) {
    batteries.push(line);
}

for(let i = 0; i < batteries.length; i++){
    let result = ''
    let start_index = 0
    for(let j = 0; j < 12; j++){
        let digitsStillNeeded = 12 - j - 1;
        let win_end = batteries[i].length - digitsStillNeeded;

        let max_digit = batteries[i][start_index]
        let max_pos = start_index

        debugger
        for(let k = start_index; k < win_end; k++){
            if(batteries[i][k] > max_digit){
                max_digit = batteries[i][k]
                max_pos = k;
            }
        }
        result += max_digit;
        start_index = max_pos + 1;        
    }
    total += parseInt(result, 10)
    console.log(`Battery ${i}: ${batteries[i]} → ${result}`);
}
console.log(total)
fs.appendFileSync("output.txt", total + "\n");

/*


9876543211 1   1  1  1   1
|||||||||| |   |  |  |   |
0123456789 10  11 12 13  14


8 1 8 18191111211 1


8

*/