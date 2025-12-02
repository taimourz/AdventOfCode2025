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
#include <string>
using namespace std;

ifstream fin("input.txt");
ofstream fout("output.txt");

int main()
{
    string line;
    vector<pair<long,long >> pairs;
    getline(fin, line);
    string temp = "";
    string temp_num1 = "";
    string temp_num2 = "";
    long long total = 0;
    for(int i = 0; i < line.size(); i++){
        temp += line[i];
        if(line[i] == '-'){
            temp_num1 = temp.substr(0, temp.size() - 1);
            temp = "";
        }
        if(line[i] == ','){
           temp_num2 = temp.substr(0, temp.size() - 1);
           temp = "";
           pairs.push_back({stol(temp_num1),stol(temp_num2)});
        }
        
    }

    for(int i = 0; i < pairs.size(); i++){
        long digit1 = pairs[i].first;
        long digit2 = pairs[i].second;
        while(digit1 <= digit2){
            string digit1_s = to_string(digit1);
            string first_half = digit1_s.substr(0, digit1_s.size() / 2);
            string second_half = digit1_s.substr(digit1_s.size() / 2, digit1_s.size());
            if(first_half == second_half) total += digit1;
            digit1++;
        }
    }

    fout<<total<<endl;


    return 0;


}