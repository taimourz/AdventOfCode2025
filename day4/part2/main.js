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

let changed = true
while(changed){
    changed = false 
    let ans = []
    for(let i = 0; i < row; i++){
        ans[i] = []
        for(let j = 0; j < col; j++){
            let rolls_count = 0;
            if(mat[i][j] == '@'){
                if(!check_bounds(i+1,j,row,col) && mat[i+1][j] == '@') rolls_count++;
                if(!check_bounds(i-1,j,row,col) && mat[i-1][j] == '@') rolls_count++;
                if(!check_bounds(i,j+1,row,col) && mat[i][j+1] == '@') rolls_count++;
                if(!check_bounds(i,j-1,row,col) && mat[i][j-1] == '@') rolls_count++;
                if(!check_bounds(i+1,j+1,row,col) && mat[i+1][j+1] == '@') rolls_count++;
                if(!check_bounds(i-1,j-1,row,col) && mat[i-1][j-1] == '@') rolls_count++;
                if(!check_bounds(i-1,j+1,row,col) && mat[i-1][j+1] == '@') rolls_count++;
                if(!check_bounds(i+1,j-1,row,col) && mat[i+1][j-1] == '@') rolls_count++;
                if(rolls_count<4){
                    changed = true;
                    total++;
                    ans[i][j] = 'x'
                }else{
                    ans[i][j] = mat[i][j]
                }
            }else{
                ans[i][j] = mat[i][j]
            }        
        }
        
    }
    debugger
    if(changed){
        mat  = ans
        ans = []
    }
}
console.log(total)




/*

outer loop. 

we need to keep track of new matrices.


should we change the current matrix. 

we can store all the coordinates and then change.


can't do inplace b/c then it would effect when we check neighbours


while(total != 0){

}


*/