const fs = require("fs");


function check_bounds(i, j, row, col){
    if(i < 0 || j < 0 || i >= row || j >= col){
        return true;
    }
    return false
}



const data = fs.readFileSync("input.txt", "utf8").split("\n");

let mat = []

for(let i = 0; i < data.length; i++){
    mat[i] = []
    for(let j = 0; j < data[i].length; j++){

        mat[i][j] = data[i][j];
    }
}

let row = mat.length
let col = mat[0].length
let total = 0;
for(let i = 0; i < row; i++){
    for(let j = 0; j < col; j++){
        let rolls_count = 0;
        if(mat[i][j] == '@'){
            debugger
            if(!check_bounds(i+1,j,row,col) && mat[i+1][j] == '@') rolls_count++;
            if(!check_bounds(i-1,j,row,col) && mat[i-1][j] == '@') rolls_count++;
            if(!check_bounds(i,j+1,row,col) && mat[i][j+1] == '@') rolls_count++;
            if(!check_bounds(i,j-1,row,col) && mat[i][j-1] == '@') rolls_count++;
            if(!check_bounds(i+1,j+1,row,col) && mat[i+1][j+1] == '@') rolls_count++;
            if(!check_bounds(i-1,j-1,row,col) && mat[i-1][j-1] == '@') rolls_count++;
            if(!check_bounds(i-1,j+1,row,col) && mat[i-1][j+1] == '@') rolls_count++;
            if(!check_bounds(i+1,j-1,row,col) && mat[i+1][j-1] == '@') rolls_count++;
            if(rolls_count<4){total++;}
        }        
    }
}
console.log(total)

