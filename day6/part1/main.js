const fs = require("fs");

const rawData = fs.readFileSync("input.txt", "utf8")
  .trim()
  .split(/\r?\n/);

const data_nums = [];
const remaining = [];

rawData.forEach(line => {
  const items = line.match(/\S+/g) || [];
  const nums = [];
  
  items.forEach(item => {
    if (/^\d+$/.test(item)) {
      nums.push(Number(item));
    } else {
      remaining.push(item);
    }
  });

  if (nums.length) data_nums.push(nums);
});

filtered_nums = []
for(let i = 0; i < data_nums[0].length; i++){
  filtered_nums[i] = []
  for(let j = 0; j < data_nums.length; j++){
    filtered_nums[i][j] = data_nums[j][i]
  }
}


product = 1;
current_sum = 0;
total = 0;
for(let i = 0; i < remaining.length; i++){
  debugger
  if(remaining[i] == '*'){
    for(let j = 0; j < filtered_nums[i].length; j++){
      product *= filtered_nums[i][j];
    }
    total += product;
    product = 1;
  }
  else if(remaining[i] == '+'){
    for(let j = 0; j < filtered_nums[i].length; j++){
      current_sum += filtered_nums[i][j];
    }
    total += current_sum;
    current_sum = 0
  }

}

console.log(total)

/*

len = 4 

0 indexed = 4 - 1 => 3

00 01 02 03
10 11 12 13
20 21 22 23


required arrays:
               00 10 20 30
               01 11 21 31 
               02 12 22 32


observation: j remains same





*/