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
    vector<pair<long,long>> pairs;
    getline(fin, line);
    string temp = "";
    string temp_num1 = "";
    string temp_num2 = "";
    
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
    
    if(!temp.empty()) {
        temp_num2 = temp;
        pairs.push_back({stol(temp_num1),stol(temp_num2)});
    }
    
    set<long long> invalidNumbers; // duplicates
    
    for(int i = 0; i < pairs.size(); i++){
        long digit1 = pairs[i].first;
        long digit2 = pairs[i].second;
        
        while(digit1 <= digit2){
            string digit1_s = to_string(digit1);
            int len = digit1_s.size();
            bool isInvalid = false;
            
            for(int patternLen = 1; patternLen <= len / 2; patternLen++){
                if(len % patternLen != 0) continue; // if doesnt divide this pattern can never create the original string
                
                string pattern = digit1_s.substr(0, patternLen);
                
                string repeated = "";
                int numReps = len / patternLen;
                for(int r = 0; r < numReps; r++){
                    repeated += pattern;
                }
                
                if(repeated == digit1_s){
                    isInvalid = true;
                    break;
                }
            }
            
            if(isInvalid){
                invalidNumbers.insert(digit1);
            }
            
            digit1++;
        }
    }
    
    long long total = 0;
    for(long long num : invalidNumbers){
        total += num;
    }
    
    fout << total << endl;
    return 0;
}