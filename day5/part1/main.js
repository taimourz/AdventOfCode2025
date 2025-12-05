const fs = require("fs");

const data = fs.readFileSync("input.txt", "utf8").split("\n");

ranges = []
ids = []
i = 0
while(data[i] != ''){
    ranges[i] = data[i].split('-').map(Number)
    debugger
    i++;
}
i++
j=0
while(i < data.length){
    debugger
    ids[j] = data[i]
    j++;
    i++;
}
let total_fresh = 0
for(let i = 0; i < ids.length; i++){
    for(let j = 0; j < ranges.length; j++){
        if(ids[i] >= ranges[j][0] && ids[i] <= ranges[j][1]){
            total_fresh++;
            break;
        }        
    }
}
console.log(total_fresh)