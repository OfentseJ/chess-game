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
  isValidMove(r1, c1, r2, c2, boardState, enPassantTarget) {
    const direction = this.color === "white" ? -1 : 1;
    const startRow = this.color === "white" ? 6 : 1;
    const rowDiff = r2 - r1;
    const colDiff = Math.abs(c2 - c1);
    const targetSquare = boardState[r2][c2];

    // Case A: Forward 1
    if (colDiff === 0 && rowDiff === direction) return targetSquare === "";

    // Case B: Forward 2
    if (colDiff === 0 && rowDiff === direction * 2 && r1 === startRow) {
      const intermediateRow = r1 + direction;
      return targetSquare === "" && boardState[intermediateRow][c1] === "";
    }

    // Case C: Capture / En Passant
    if (colDiff === 1 && rowDiff === direction) {
      // Normal Capture
      if (targetSquare !== "" && !this.isTeammate(targetSquare)) return true;

      // En Passant Check
      if (targetSquare === "") {
        if (!enPassantTarget) {
          // console.log("Pawn Diag: No Target"); // Too spammy
          return false;
        }
        const hitTarget =
          r2 === enPassantTarget.row && c2 === enPassantTarget.col;
        if (hitTarget) console.log("Pawn: En Passant Target HIT!");
        return hitTarget;
      }
    }
    return false;
  }
}

class King extends Piece {
  isValidMove(r1, c1, r2, c2, boardState) {
    const rowDiff = Math.abs(r1 - r2);
    const colDiff = Math.abs(c1 - c2);

    if (rowDiff <= 1 && colDiff <= 1)
      return !this.isTeammate(boardState[r2][c2]);

    // Castling Logic
    const startRow = this.color === "white" ? 7 : 0;
    if (r1 === startRow && r2 === startRow && colDiff === 2 && rowDiff === 0) {
      if (c2 > c1) {
        // Kingside
        if (boardState[r1][5] !== "" || boardState[r1][6] !== "") {
          console.log("King: Path blocked (Kingside)");
          return false;
        }
        const pieceAtRook = boardState[r1][7];
        if (pieceAtRook !== (this.color === "white" ? "R" : "r")) return false;
      } else {
        // Queenside
        if (
          boardState[r1][1] !== "" ||
          boardState[r1][2] !== "" ||
          boardState[r1][3] !== ""
        ) {
          console.log("King: Path blocked (Queenside)");
          return false;
        }
        const pieceAtRook = boardState[r1][0];
        if (pieceAtRook !== (this.color === "white" ? "R" : "r")) return false;
      }
      return true;
    }
    return false;
  }
}

// ... (Bishop, Rook, Queen, Knight classes remain the same as your previous working version) ...
// (I will omit them to save space, but ensure you keep your fixed Bishop!)
class Bishop extends Piece {
  isValidMove(r1, c1, r2, c2, boardState) {
    const rowDiff = Math.abs(r1 - r2);
    const colDiff = Math.abs(c1 - c2);
    if (rowDiff !== colDiff) return false;
    if (rowDiff === 0) return false; // Fixed 0-move bug
    const rowStep = r2 > r1 ? 1 : -1;
    const colStep = c2 > c1 ? 1 : -1;
    let currentRow = r1 + rowStep;
    let currentCol = c1 + colStep;
    while (currentRow !== r2) {
      if (boardState[currentRow][currentCol] !== "") return false;
      currentRow += rowStep;
      currentCol += colStep;
    }
    return !this.isTeammate(boardState[r2][c2]);
  }
}

class Rook extends Piece {
  isValidMove(r1, c1, r2, c2, boardState) {
    const rowDiff = Math.abs(r1 - r2);
    const colDiff = Math.abs(c1 - c2);
    if (colDiff !== 0 && rowDiff !== 0) return false;
    const rowStep = r1 === r2 ? 0 : r2 > r1 ? 1 : -1;
    const colStep = c1 === c2 ? 0 : c2 > c1 ? 1 : -1;
    let currentRow = r1 + rowStep;
    let currentCol = c1 + colStep;
    while (currentRow !== r2 || currentCol !== c2) {
      if (boardState[currentRow][currentCol] !== "") return false;
      currentRow += rowStep;
      currentCol += colStep;
    }
    return !this.isTeammate(boardState[r2][c2]);
  }
}

class Queen extends Piece {
  isValidMove(r1, c1, r2, c2, boardState) {
    const rowDiff = Math.abs(r1 - r2);
    const colDiff = Math.abs(c1 - c2);
    const isDiagonal = rowDiff === colDiff;
    const isStraight = rowDiff === 0 || colDiff === 0;
    if (!isDiagonal && !isStraight) return false;
    const rowStep = r1 === r2 ? 0 : r2 > r1 ? 1 : -1;
    const colStep = c1 === c2 ? 0 : c2 > c1 ? 1 : -1;
    let currentRow = r1 + rowStep;
    let currentCol = c1 + colStep;
    while (currentRow !== r2 || currentCol !== c2) {
      if (boardState[currentRow][currentCol] !== "") return false;
      currentRow += rowStep;
      currentCol += colStep;
    }
    return !this.isTeammate(boardState[r2][c2]);
  }
}

class Knight extends Piece {
  isValidMove(r1, c1, r2, c2, boardState) {
    const rowDiff = Math.abs(r1 - r2);
    const colDiff = Math.abs(c1 - c2);
    const isTwoByOne = rowDiff === 2 && colDiff === 1;
    const isOneByTwo = rowDiff === 1 && colDiff === 2;
    if (!isTwoByOne && !isOneByTwo) return false;
    return !this.isTeammate(boardState[r2][c2]);
  }
}
