from collections import deque
f = open("input.txt", "r")
input_str = f.read().split("\n")
f.close()
#
#       expected_state = (3, 5, 4, 7)                       ← target counters
#       options = [(3,), (1,3), (2,), (2,3), (0,2), (0,1)]  ← buttons
#
def bfs(expected_state, options):
    #
    #   tuple([0, 0, 0, 0]) = (0, 0, 0, 0)
    #
    start = tuple([0 for i in range(len(expected_state))])
    #   
    #   seen = {(0, 0, 0, 0)}  ← marks starting state as visited
    #
    seen = set([start])
    #
    #   queue = deque([((0,0,0,0), 0)])
    #               ↑             ↑
    #            state      button presses
    #
    queue = deque([(start, 0)])
    while(len(queue)):
        candidate, dist = queue.popleft()
        #
        #       candidate       = (3, 5, 4, 7)
        #       expected_state = (3, 5, 4, 7)
        #
        if candidate == expected_state:
            return dist        
        #
        #   TRY ALL BUTTON PRESSES
        #   options = [(3,), (1,3), (2,), (2,3), (0,2), (0,1)]
        #
        for option in options:
            #
            #   candidate     = (0, 1, 2, 3)  ← tuple (immutable)
            #   cand_modified = [0, 1, 2, 3]  ← list (mutable, can change)
            #
            cand_modified = list(candidate)
            #
            #       option = (1, 3)
            #       Before:
            #              cand_modified = [0, 1, 2, 3]
            #       After:
            #              cand_modified = [0, 2, 2, 4]
            #
            for elem in option:
                cand_modified[elem] += 1
            #
            #       If we overshoot a counter, this path is invalid (can only increment, can't go back down)
            #
            #       cand_modified = [0, 6, 2, 4]
            #       expected_state = (3, 5, 4, 7)
            #
            #       Check i=0: 0 > 3? No
            #       Check i=1: 6 > 5? YES! ← Counter 1 exceeded target
            #       
            #       Set should_continue = True → skip this state
            #
            should_continue = False
            for i in range(len(cand_modified)):
                if(cand_modified[i] > expected_state[i]):
                    should_continue = True
            
            if should_continue:
                continue
            #
            #   Why? tuples are hashable (can be stored in set)
            #        lists are not hashable
            #
            #   cand_modified       = [0, 2, 2, 4]
            #   tuple([0, 2, 2, 4]) = (0, 2, 2, 4)
            #
            cand_modified = tuple(cand_modified)
            #
            #       seen          = {(0,0,0,0), (0,0,0,1), (0,1,0,1)}
            #       cand_modified = (0,0,0,1)
            #       
            #       (0,0,0,1) in seen? YES
            #       Skip this state (already explored from another path)
            #
            if cand_modified in seen:
                continue
            #
            #       cand_modified = (0, 2, 2, 4)
            #       dist          = 5  ← took 5 presses to get to candidate
            #       
            #       Add (0, 2, 2, 4) with distance 6 (5 + 1)
            #       Mark as seen so we don't revisit
            #
            queue.append((cand_modified, dist+1))
            seen.add(cand_modified)

result = 0
for line in input_str:
    parts = line.split()
    #    
    #   parts[0] = "[.##.]"  => (0, 1, 1, 0)
    #
    expected_state = tuple([1 if elem == "#" else 0 for elem in parts[0][1:-1]])
    buttons_str = parts[1:-1]
    #
    #   EXAMPLE
    #       for elem                        = "(1,3)"
    #       elem[1:-1].split(",")           = ["1", "3"]
    #       [int(x) for x in ["1", "3"]]    = [1, 3]
    #       tuple([1, 3])                   = (1, 3)
    #
    buttons = []
    for elem in buttons_str:
        button_ints = elem[1:-1].split(",")
        buttons.append(tuple([int(x) for x in button_ints]))
    #
    #   parts[-1]                    = "{3,5,4,7}"
    #   parts[-1][1:-1].split(",")   = ["3", "5", "4", "7"]
    #   [int(elem) for elem in ...]  = [3, 5, 4, 7]
    #
    joltage = [int(elem) for elem in parts[-1][1:-1].split(",")]
    result += bfs(tuple(joltage), buttons)

print(result)