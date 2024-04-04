// A* Pathfinding algorithm implementation
export const findPath = (
  startRow,
  startCol,
  endRow,
  endCol,
  gridSize,
  invalidPositions
) => {
  const numRows = gridSize;
  const numCols = gridSize;

  // * Create a 2D array to store the Cell objects for each cell in the grid
  const cells = [];
  for (let row = 0; row < numRows; row++) {
    cells[row] = [];
    for (let col = 0; col < numCols; col++) {
      cells[row][col] = {
        row,
        col,
        gCost: Infinity,
        hCost: calculateManhattanDistance(row, col, endRow, endCol),
        fCost: 0,
        parent: null,
        visited: false,
      };
    }
  }

  // * Calculate the Manhattan distance between two cells
  function calculateManhattanDistance(row1, col1, row2, col2) {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
  }

  // Check if a cell is valid and walkable
  function isValidCell(row, col) {
    if (row < 0 || row >= numRows || col < 0 || col >= numCols) {
      return false; // Out of bounds
    }

    for (const pos of invalidPositions) {
      if (pos[0] === row && pos[1] === col) {
        return false;
      }
    }

    return true;
  }

  // * Get the neighbors of a given cell
  function getNeighbors(row, col) {
    const neighbors = [];
    const directions = [
      { row: -1, col: 0 }, // Top
      { row: 1, col: 0 }, // Bottom
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 }, // Right
      { row: -1, col: -1 }, // Top-left
      { row: -1, col: 1 }, // Top-right
      { row: 1, col: -1 }, // Bottom-left
      { row: 1, col: 1 }, // Bottom-right
    ];

    for (const dir of directions) {
      const newRow = row + dir.row;
      const newCol = col + dir.col;

      if (isValidCell(newRow, newCol)) {
        neighbors.push(cells[newRow][newCol]);
      }
    }

    return neighbors;
  }

  // * Calculate the path by following the parent pointers
  function calculatePath() {
    const path = [];
    let currentCell = cells[endRow][endCol];

    while (currentCell !== null) {
      path.unshift({ row: currentCell.row, col: currentCell.col });
      currentCell = currentCell.parent;
    }

    return path;
  }

  // * Perform A* search
  function performAStarSearch() {
    const openList = [cells[startRow][startCol]];
    cells[startRow][startCol].gCost = 0;
    cells[startRow][startCol].fCost = cells[startRow][startCol].hCost;

    while (openList.length > 0) {
      openList.sort((a, b) => a.fCost - b.fCost); // Sort the open list based on fCost

      const currentCell = openList.shift();
      currentCell.visited = true;

      if (currentCell.row === endRow && currentCell.col === endCol) {
        return calculatePath(); // Destination reached, return the path
      }

      const neighbors = getNeighbors(currentCell.row, currentCell.col);

      for (const neighbor of neighbors) {
        if (neighbor.visited) {
          continue; // Skip visited neighbors
        }

        const newGCost = currentCell.gCost + 1;

        if (newGCost < neighbor.gCost) {
          neighbor.gCost = newGCost;
          neighbor.fCost = neighbor.gCost + neighbor.hCost;
          neighbor.parent = currentCell;

          if (!openList.includes(neighbor)) {
            openList.push(neighbor);
          }
        }
      }
    }

    return []; // No path found
  }

  return performAStarSearch();
};
