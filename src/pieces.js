class Piece {
  constructor(color) {
    this.color = color;
  }
  isTeammate(targetPieceChar) {
    if (!targetPieceChar) return false;

    const isTargetWhite = targetPieceChar === targetPieceChar.toUpperCase();
    const isMeWhite = this.color === "white";
    return isTargetWhite === isMeWhite;
  }
  isValidMove(startRow, startCol, endRow, endCol, boardState) {
    return false;
  }
}

class Pawn extends Piece {
  isValidMove(r1, c1, r2, c2, boardState) {
    const direction = this.color === "white" ? -1 : 1;
    const startRow = this.color === "white" ? 6 : 1;

    const rowDiff = r2 - r1;
    const colDiff = Math.abs(c2 - c1);

    const targetSquare = boardState[r2][c2];

    //Case A: Move forward 1 square
    if (colDiff === 0 && rowDiff === direction) {
      return targetSquare === "";
    }

    //Case B: Move forward 2 squares (first move only)
    if (colDiff === 0 && rowDiff === direction * 2 && r1 === startRow) {
      const intermediateRow = r1 + direction;
      return targetSquare === "" && boardState[intermediateRow][c1] === "";
    }

    //Case C: Capture (Diagonal)
    if (colDiff === 1 && rowDiff === direction) {
      return targetSquare !== "" && !this.isTeammate(targetSquare);
    }
    return false;
  }
}

class King extends Piece {
  isValidMove(r1, c1, r2, c2, boardState) {
    const rowDiff = Math.abs(r1 - r2);
    const colDiff = Math.abs(c1 - c2);

    if (rowDiff <= 1 && colDiff <= 1) {
      return !this.isTeammate(boardState[r2][c2]);
    }
    return false;
  }
}

class Bishop extends Piece {
  isValidMove(r1, c1, r2, c2, boardState) {
    const rowDiff = Math.abs(r1 - r2);
    const colDiff = Math.abs(c1 - c2);

    //1. Must move diagonally (Slope = 1)
    if (rowDiff !== colDiff) return false;

    //2. Check for Obstacles
    const rowStep = r2 > r1 ? 1 : -1;
    const colStep = c2 > c1 ? 1 : -1;

    let currentRow = r1 + rowStep;
    let currentCol = c1 + colStep;

    while (currentRow !== r2) {
      if (boardState[currentRow][currentCol] !== "") {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    // 3. Destination Check
    return !this.isTeammate(boardState[r2][c2]);
  }
}
