import math
from collections import defaultdict

def connect_pair(pair, junctions):
    a, b = pair['a'], pair['b']
    
    if a['circuit'] is None and b['circuit'] is None:
        new_circuit = object()
        a['circuit'] = b['circuit'] = new_circuit
    elif a['circuit'] is None or b['circuit'] is None:
        a['circuit'] = b['circuit'] = a['circuit'] or b['circuit']
    elif a['circuit'] != b['circuit']:
        old_circuit = b['circuit']
        new_circuit = a['circuit']
        for junction in junctions:
            if junction['circuit'] == old_circuit:
                junction['circuit'] = new_circuit
    
    return pair

def circuit_sizes(junctions):
    connected = [j for j in junctions if j['circuit'] is not None]
    
    circuits = defaultdict(list)
    for junction in connected:
        circuits[id(junction['circuit'])].append(junction)
    
    sizes = [len(circuit) for circuit in circuits.values()]
    return sorted(sizes, reverse=True)

def all_connected(junctions):
    circuit = junctions[0]['circuit']
    return circuit is not None and all(j['circuit'] == circuit for j in junctions)

def parse(input_text):
    lines = input_text.strip().split('\n')
    junctions = []
    
    for line in lines:
        x, y, z = map(int, line.split(','))
        junctions.append({'x': x, 'y': y, 'z': z, 'circuit': None})
    
    pairs = []
    for i in range(len(junctions)):
        for j in range(i + 1, len(junctions)):
            a = junctions[i]
            b = junctions[j]
            dist = math.sqrt(
                (a['x'] - b['x']) ** 2 +
                (a['y'] - b['y']) ** 2 +
                (a['z'] - b['z']) ** 2
            )
            pairs.append({'a': a, 'b': b, 'dist': dist})
    
    pairs.sort(key=lambda p: p['dist'])
    
    return junctions, pairs

def part1(input_text):
    times = 1000
    junctions, pairs = parse(input_text)
    
    for i in range(times):
        connect_pair(pairs[i], junctions)
    
    sizes = circuit_sizes(junctions)
    result = sizes[0] * sizes[1] * sizes[2]
    print(result)

def part2(input_text):
    junctions, pairs = parse(input_text)
    pair = None
    idx = 0
    
    while not all_connected(junctions):
        pair = connect_pair(pairs[idx], junctions)
        idx += 1
    
    ans = pair['a']['x'] * pair['b']['x']
    print(ans)

if __name__ == "__main__":
    with open("input.txt", "r") as f:
        input_data = f.read()
    
    part1(input_data)
    part2(input_data)