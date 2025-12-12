
f = open("actual.txt", "r")
input_str = f.read().split('\n')
f.close()

from collections import defaultdict

adj_list = defaultdict(list)

for line in input_str:
    str = line.split(':')
    key = str[0]
    values = str[1].strip().split(' ')
    # breakpoint()
    for val in values:
        adj_list[key].append(val)

def dfs(node, seen_dac, seen_fft, adj_list, cache, depth=0):
    #breakpoint()
    if node == 'out':
        if seen_dac and seen_fft:
            return 1
        return 0

    if (node, seen_dac, seen_fft) in cache:
        return cache[(node, seen_dac, seen_fft)]

    is_fft = node == "fft"
    is_dac = node == "dac"
 
    result = 0
    for neighbour in adj_list[node]:
        result += dfs(neighbour, is_dac or seen_dac, is_fft or seen_fft, adj_list, cache, depth+1)

    cache[(node, seen_dac, seen_fft)] = result
    return result

print(dfs("svr", False, False, adj_list, {}))
