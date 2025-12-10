#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <sstream>
#include <cmath>
#include <algorithm>
#include <map>
#include <memory>

struct Junction {
    int x, y, z;
    std::shared_ptr<int> circuit;
};

struct Pair {
    Junction* a;
    Junction* b;
    double dist;
};

void connectPair(Pair& pair, std::vector<Junction>& junctions) {
    Junction* a = pair.a;
    Junction* b = pair.b;
    
    if (!a->circuit && !b->circuit) {
        auto newCircuit = std::make_shared<int>(rand());
        a->circuit = b->circuit = newCircuit;
    } else if (!a->circuit || !b->circuit) {
        a->circuit = b->circuit = a->circuit ? a->circuit : b->circuit;
    } else if (a->circuit != b->circuit) {
        auto oldCircuit = b->circuit;
        auto newCircuit = a->circuit;
        for (auto& junction : junctions) {
            if (junction.circuit == oldCircuit) {
                junction.circuit = newCircuit;
            }
        }
    }
}

std::vector<int> circuitSizes(const std::vector<Junction>& junctions) {
    std::map<std::shared_ptr<int>, int> circuits;
    
    for (const auto& junction : junctions) {
        if (junction.circuit) {
            circuits[junction.circuit]++;
        }
    }
    
    std::vector<int> sizes;
    for (const auto& [circuit, size] : circuits) {
        sizes.push_back(size);
    }
    
    std::sort(sizes.begin(), sizes.end(), std::greater<int>());
    return sizes;
}

bool allConnected(const std::vector<Junction>& junctions) {
    auto circuit = junctions[0].circuit;
    if (!circuit) return false;
    
    for (const auto& junction : junctions) {
        if (junction.circuit != circuit) return false;
    }
    return true;
}

std::pair<std::vector<Junction>, std::vector<Pair>> parse(const std::string& input) {
    std::vector<Junction> junctions;
    std::istringstream iss(input);
    std::string line;
    
    while (std::getline(iss, line)) {
        if (line.empty()) continue;
        std::istringstream lineStream(line);
        std::string token;
        Junction j;
        
        std::getline(lineStream, token, ',');
        j.x = std::stoi(token);
        std::getline(lineStream, token, ',');
        j.y = std::stoi(token);
        std::getline(lineStream, token, ',');
        j.z = std::stoi(token);
        j.circuit = nullptr;
        
        junctions.push_back(j);
    }
    
    std::vector<Pair> pairs;
    for (size_t i = 0; i < junctions.size(); i++) {
        for (size_t j = i + 1; j < junctions.size(); j++) {
            Junction* a = &junctions[i];
            Junction* b = &junctions[j];
            double dist = std::sqrt(
                std::pow(a->x - b->x, 2) +
                std::pow(a->y - b->y, 2) +
                std::pow(a->z - b->z, 2)
            );
            pairs.push_back({a, b, dist});
        }
    }
    
    std::sort(pairs.begin(), pairs.end(), 
              [](const Pair& p1, const Pair& p2) { return p1.dist < p2.dist; });
    
    return {junctions, pairs};
}

void part1(const std::string& input) {
    int times = 1000;
    auto [junctions, pairs] = parse(input);
    
    for (int i = 0; i < times; i++) {
        connectPair(pairs[i], junctions);
    }
    
    auto sizes = circuitSizes(junctions);
    long long result = (long long)sizes[0] * sizes[1] * sizes[2];
    std::cout << result << std::endl;
}

void part2(const std::string& input) {
    auto [junctions, pairs] = parse(input);
    Pair* lastPair = nullptr;
    size_t idx = 0;
    
    while (!allConnected(junctions)) {
        lastPair = &pairs[idx];
        connectPair(pairs[idx], junctions);
        idx++;
    }
    
    long long ans = (long long)lastPair->a->x * lastPair->b->x;
    std::cout << ans << std::endl;
}

int main() {
    std::ifstream file("input.txt");
    std::stringstream buffer;
    buffer << file.rdbuf();
    std::string input = buffer.str();
    
    part1(input);
    part2(input);
    
    return 0;
}