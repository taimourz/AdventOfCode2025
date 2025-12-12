
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
const visited = new Set()

q.push('you');
visited.add('you')

while(q.length > 0){
    let curr = q.shift()
    let values = mp.get(curr)

    if(!values) continue

    values.forEach((v) => {
        debugger
        if(v == 'out'){
            count++;
        }else{
            q.push(v)
        }
        // if(v == 'out'){
        //     count++;
        // }else if(!visited.has(v)){
        //     visited.add(v)
        //     q.push(v)
        // }

    })


}




console.log(count)



/*

aaa: you hhh
you: bbb ccc
bbb: ddd eee
ccc: ddd eee fff
ddd: ggg
eee: out
fff: out
ggg: out
hhh: ccc fff iii
iii: out



we can have a mapping hashmap

need to find all possible paths.


implementation 

add you in the queue. 

you: bbb ccc
    process bbb:
        bbb: ddd eee
            process ddd: ggg => ggg : out ( Found 1 Path )
            process eee: eee => out (Found 2 path)
    process ccc:
        ddd eee fff
        process ddd: ggg => ggg : out (Fount 3 path)
        process eee: out (Found 4 path)
        process fff: out (Found 5 path)



*/