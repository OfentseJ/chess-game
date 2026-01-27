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
  isValidMove(r1, c1, r2, c2, boardState) {}
}
