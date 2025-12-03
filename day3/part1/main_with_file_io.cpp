#include <iostream>
#include <vector>
#include <fstream>
#include <string>
#include <set>
using namespace std;
ifstream fin("input.txt");
ofstream fout("output.txt");

int main()
{
    string line;
    vector<string> batteries;
    int total = 0;

    while(getline(fin, line)){
        batteries.push_back(line);
    }

    for(int i = 0; i < batteries.size(); i++){
        int first_so_far = batteries[i][0] - '0';
        int max_number = 0;

        for(int j = 1; j < batteries[i].size(); j++){
            int second_digit = batteries[i][j] - '0';
            int candidate = first_so_far * 10 + second_digit;
            if(candidate > max_number) max_number = candidate;

            int current_digit = batteries[i][j] - '0';
            if(current_digit > first_so_far) first_so_far = current_digit;
        }

        total += max_number;
    }

    fout<<total;
    
    return 0;
}



/*

987654321111111

               

811111111111119

81            

0
               15

234234234234278



{
 8:1
 1:10
 9: 

}


*/