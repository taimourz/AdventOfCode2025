# Read input
with open("input.txt") as f:
    grid = [line.rstrip("\n") for line in f]

# Find row containing 'S'
curr_row = next(r for r, row in enumerate(grid) if 'S' in row)

# Beams in current row: {column_index: count}
beams_current_row = {grid[curr_row].index('S'): 1}

splits = 0
timelines = 1
R = len(grid)

while curr_row < R:
    beams_next_row = {}

    def add(col, count):
        beams_next_row[col] = beams_next_row.get(col, 0) + count

    for col, count in beams_current_row.items():
        if grid[curr_row][col] == '.':
            add(col, count)
        else:  # splitter '^'
            add(col - 1, count)
            add(col + 1, count)
            splits += 1
            timelines += count

    beams_current_row = beams_next_row
    curr_row += 1

print("Total timelines:", timelines)
print("Total splits:", splits)
