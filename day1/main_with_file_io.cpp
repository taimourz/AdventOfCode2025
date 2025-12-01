/*  *
    *
    * Use this file when we want to do file io
    * use fin instead  of cin
    * use fout instead of cout
    *
    *
*/
#include <iostream>
#include <vector>
#include <fstream>
using namespace std;

ifstream fin("input.txt");
ofstream fout("output.txt");

int main()
{
    vector<pair<string, int>> combinations;
    string temp;
    while(fin>>temp){
        string left = temp.substr(0,1);
        int right = stoi(temp.substr(1));
        combinations.push_back(make_pair(left, right));
    }

    int count = 0;
    int current_pos = 50;
    for(int i = 0; i < combinations.size(); i++){
        string dir = combinations[i].first;
        int steps = combinations[i].second;
        if(dir == "R"){
            current_pos = (current_pos + steps) % 100;
        }else{
            current_pos = (current_pos - steps + 100) % 100;
        }
        if(current_pos == 0) count++;
    }

    fout<<count<<endl;

    return 0;


}



/*

digits 0 to 99
left and right indicate direction
number indicates the number of times it should be rotated
loops at 99 and 0




*/