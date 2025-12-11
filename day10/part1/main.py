from collections import deque
f = open("actual.txt", "r")
input_str = f.read().split("\n")
f.close()
#
#   expected_state = (0, 1, 1, 0)                          ← target pattern
#   options = [(3,), (1,3), (2,), (2,3), (0,2), (0,1)]     ← buttons
#
def bfs(expected_state, options):
    #
    #   start = (0, 0, 0, 0)  ← all OFF initially
    #
    start = tuple([0 for i in range(len(expected_state))])
    seen = set([start])
    #
    #   queue = deque([((0,0,0,0), 0)])
    #               ↑             ↑
    #         light states   button presses
    #
    queue = deque([(start, 0)])
    while(len(queue)):
        candidate, dist = queue.popleft()
        #
        #   candidate       = (0, 1, 1, 0)
        #   expected_state  = (0, 1, 1, 0)
        #
        if candidate == expected_state:
            return dist
        #
        #   Try pressing each button
        #   options = [(3,), (1,3), (2,), (2,3), (0,2), (0,1)]
        #
        for option in options:
            #
            #   candidate     = (0, 1, 0, 1)  ← tuple (immutable)
            #   cand_modified = [0, 1, 0, 1]  ← list (mutable)
            #
            cand_modified = list(candidate)
            #
            #   option = (1, 3)
            #   Before:
            #          cand_modified = [0, 1, 0, 1]
            #                             ↑     ↑
            #                          pos 1  pos 3
            #   After:
            #          cand_modified = [0, 0, 0, 0]
            #                             ↑     ↑
            #                          1→0   1→0
            #
            for elem in option:
                cand_modified[elem] = 0 if cand_modified[elem] == 1 else 1
            #
            #   tuple to (hashable for set)
            #   cand_modified       = [0, 0, 0, 0]
            #   tuple([0, 0, 0, 0]) = (0, 0, 0, 0)
            #
            cand_modified = tuple(cand_modified)
            if cand_modified in seen:
                continue
            queue.append((cand_modified, dist+1))
            seen.add(cand_modified)

result = 0
for line in input_str:
    parts = line.split()
    #    
    #   "[.##.]"  => (0, 1, 1, 0)
    #
    expected_state = tuple([1 if elem == "#" else 0 for elem in parts[0][1:-1]])
    buttons_str = parts[1:-1]
    #
    #   "(1,3)" => (1, 3)
    #
    buttons = []
    for elem in buttons_str:
        button_ints = elem[1:-1].split(",")
        buttons.append(tuple([int(x) for x in button_ints]))

    joltage = parts[-1]
    result += bfs(expected_state, buttons)

print(result)