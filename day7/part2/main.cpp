#include <bits/stdc++.h>
using namespace std;

int main() {
    // Read input
    ifstream fin("input.txt");
    vector<string> grid;
    string line;
    while (getline(fin, line)) grid.push_back(line);
    fin.close();

    int R = grid.size();
    int curr_row = 0;

    // Find the row containing 'S'
    for (int r = 0; r < R; r++) {
        if (grid[r].find('S') != string::npos) {
            curr_row = r;
            break;
        }
    }

    // Map of beams in current row: column -> count
    map<int, long long> beamsCurrentRowMap;
    beamsCurrentRowMap[grid[curr_row].find('S')] = 1;

    long long splits = 0;
    long long timelines = 1;

    while (curr_row < R) {
        map<int, long long> beamsNextRowMap;

        auto add = [&](int col, long long count) {
            beamsNextRowMap[col] += count;
        };

        for (auto &[col, count] : beamsCurrentRowMap) {
            if (grid[curr_row][col] == '.') {
                add(col, count); // continues straight
            } else { // splitter '^'
                add(col - 1, count);
                add(col + 1, count);
                splits++;
                timelines += count;
            }
        }

        beamsCurrentRowMap.swap(beamsNextRowMap);
        curr_row++;
    }

    cout << "Total timelines: " << timelines << endl;
    cout << "Total splits: " << splits << endl;

    return 0;
}
