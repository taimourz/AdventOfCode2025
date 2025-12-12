
const fs = require("fs")

const input = fs.readFileSync("actual.txt", "utf8").split("\n")

const mp = new Map();
input.forEach((line) => {
    let str  = line.split(':')
    let key = str[0]
    let value = str[1].trim().split(" ")
    mp.set(key, value)
})

const q = []
let count = 0;

q.push(['svr', ['svr']]);

while(q.length > 0){
    let [curr, path] = q.shift()
    let values = mp.get(curr)

    if(!values) continue

    values.forEach((v) => {
         let newPath = [...path, v] 
        if(v === 'out'){
            if(newPath.includes('fft') && newPath.includes('dac')){            
                console.log('Found path:', newPath.join(' -> '))
                count++;
            }
        }else{
            q.push([v, newPath])
        }

    })
}


console.log(count)

