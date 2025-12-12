
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
                                                                            
result = 0                                                             
stack = ["you"]
while(stack):                                                      
    cand = stack.pop()
    if cand == 'out':
        result += 1
        continue
                                        
    for neighbour in adj_list[cand]:
        stack.append(neighbour)
                                                              
print(result)