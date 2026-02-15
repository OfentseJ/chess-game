const gameBoard = document.querySelector("#gameboard");
const flipBtn = document.querySelector("#flip-btn");
const resetBtn = document.querySelector("#reset-btn");
let selectedSquare = null;

const pieceRegistry = {
  p: new Pawn("black"),
  P: new Pawn("white"),
  k: new King("black"),
  K: new King("white"),
  b: new Bishop("black"),
  B: new Bishop("white"),
  r: new Rook("black"),
  R: new Rook("white"),
  q: new Queen("black"),
  Q: new Queen("white"),
  n: new Knight("black"),
  N: new Knight("white"),
};

let boardState = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];

let squareCoordinates = [
  ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"],
  ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"],
  ["a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6"],
  ["a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5"],
  ["a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4"],
  ["a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3"],
  ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"],
  ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"],
];

let playerTurn = "white";
let isFlipped = false;

let castleRights = {
  whiteKingMoved: false,
  whiteLeftRookMoved: false,
  whiteRightRookMoved: false,
  blackKingMoved: false,
  blackLeftRookMoved: false,
  blackRightRookMoved: false,
};

let enPassantTarget = null;

let count = 0;

function resetBoard() {
  console.log("--- BOARD RESET ---");
  castleRights = {
    whiteKingMoved: false,
    whiteLeftRookMoved: false,
    whiteRightRookMoved: false,
    blackKingMoved: false,
    blackLeftRookMoved: false,
    blackRightRookMoved: false,
  };
  boardState = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ];
  playerTurn = "white";
  isFlipped = false;
  selectedSquare = null;
  enPassantTarget = null;
}

function getPieceImageSource(pieceCode) {
  const isWhite = pieceCode === pieceCode.toUpperCase();
  const color = isWhite ? "white" : "black";
  const typeCode = pieceCode.toLowerCase();

  let typeName = "";
  switch (typeCode) {
    case "p":
      typeName = "pawn";
      break;
    case "r":
      typeName = "rook";
      break;
    case "n":
      typeName = "knight";
      break;
    case "b":
      typeName = "bishop";
      break;
    case "q":
      typeName = "Queen";
      break;
    case "k":
      typeName = "king";
      break;
    default:
      return "";
  }
  return `images/pieces/${color}-${typeName}.png`;
}

function createBoard() {
  gameBoard.innerHTML = "";
  const kingLoc = findKing(boardState, playerTurn);
  let isCheck = false;
  if (kingLoc) {
    isCheck = isSquareUnderAttack(
      kingLoc.row,
      kingLoc.col,
      boardState,
      playerTurn,
    );
  }
  const order = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  order.forEach((rowIndex) => {
    order.forEach((colIndex) => {
      const square = document.createElement("div");
      square.classList.add("square");
      square.dataset.row = rowIndex;
      square.dataset.col = colIndex;
      const isBeige = (rowIndex + colIndex) % 2 === 0;
      square.classList.add(isBeige ? "beige" : "brown");
      if (isCheck && kingLoc.row === rowIndex && kingLoc.col == colIndex) {
        square.classList.add("check");
      }
      const pieceCode = boardState[rowIndex][colIndex];
      if (pieceCode != "") {
        const img = document.createElement("img");
        img.src = getPieceImageSource(pieceCode);
        img.classList.add("piece");
        img.draggable = false;
        square.appendChild("img");
      }
      square.addEventListener("click", () => {
        onSquareClick(rowIndex, colIndex);
      });
      gameBoard.append(square);
    });
  });
}

function onSquareClick(row, col) {
  const clickedPieceChar = boardState[row][col];
  const clickedSquareDiv = document.querySelector(
    `[data-row="${row}"][data-col="${col}"]`,
  );

  // --- Handling Selection ---
  if (!selectedSquare) {
    if (clickedPieceChar === "") return;
    const isWhitePiece = clickedPieceChar === clickedPieceChar.toUpperCase();
    if (playerTurn === "white" && !isWhitePiece) return;
    if (playerTurn === "black" && isWhitePiece) return;

    selectedSquare = { row, col };
    if (clickedSquareDiv) clickedSquareDiv.classList.add("selected");
    return;
  }

  // --- Smart Switching ---
  if (clickedPieceChar !== "") {
    const isClickedWhite = clickedPieceChar === clickedPieceChar.toUpperCase();
    const isCurrentWhite = playerTurn === "white";
    if (isClickedWhite === isCurrentWhite) {
      createBoard();
      selectedSquare = { row, col };
      const newSquareDiv = document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`,
      );
      if (newSquareDiv) newSquareDiv.classList.add("selected");
      return;
    }
  }

  // --- Attempting Move ---
  const startRow = selectedSquare.row;
  const startCol = selectedSquare.col;
  const pieceChar = boardState[startRow][startCol];
  const pieceLogic = pieceRegistry[pieceChar];

  let valid = false;
  let isCastlingMove = false;

  if (pieceLogic) {
    valid = pieceLogic.isValidMove(
      startRow,
      startCol,
      row,
      col,
      boardState,
      enPassantTarget,
    );

    if (
      valid &&
      (pieceChar === "K" || pieceChar === "k") &&
      Math.abs(col - startCol) === 2
    ) {
      if (canCastle(startRow, startCol, row, col, playerTurn)) {
        isCastlingMove = true;
      } else {
        valid = false;
        alert("Cannot Castle: Check, Moved Previously, or Path Blocked");
      }
    } else if (valid) {
      const safe = isMoveSafe(startRow, startCol, row, col);
      if (!safe) {
        valid = false;
        alert("Illegal move: King would be in check!");
      }
    }
  }

  // --- Execute Move ---
  if (valid) {
    const destContent = boardState[row][col];
    isCapture = destContent !== "";

    // 1. Handle En Passant Capture
    if (
      pieceChar.toLowerCase() === "p" &&
      col !== startCol &&
      boardState[row][col] === ""
    ) {
      boardState[startRow][col] = "";
    }

    // 2. Check for Promotion Eligibility
    const isPromotion =
      (pieceChar === "P" && row === 0) || (pieceChar === "p" && row === 7);

    // 3. Move the piece
    boardState[row][col] = pieceChar;
    boardState[startRow][startCol] = "";

    // 4. Handle Castling Rook Movement
    if (isCastlingMove) {
      const isKingside = col > startCol;
      const rookStartCol = isKingside ? 7 : 0;
      const rookEndCol = isKingside ? 5 : 3;
      const rookChar = boardState[row][rookStartCol];
      boardState[row][rookEndCol] = rookChar;
      boardState[row][rookStartCol] = "";
    }

    // Define turn finalization (called immediately or after promotion)
    const finalizeTurn = () => {
      updateCastlingRights(pieceChar, startRow, startCol);
      count++;
      const notation = `${count}.${getNotation(
        pieceChar,
        startRow,
        startCol,
        row,
        col,
        isCapture,
      )}`;
      console.log(notation);

      // Set En Passant Target
      if (pieceChar.toLowerCase() === "p" && Math.abs(row - startRow) === 2) {
        const direction = pieceChar === "P" ? -1 : 1;
        enPassantTarget = { row: startRow + direction, col: col };
      } else {
        enPassantTarget = null;
      }

      playerTurn = playerTurn === "white" ? "black" : "white";
      isFlipped = !isFlipped;
      selectedSquare = null;
      createBoard();

      if (isCheckmate(playerTurn)) {
        setTimeout(
          () =>
            alert(
              `Checkmate! ${playerTurn === "white" ? "Black" : "White"} wins!`,
            ),
          100,
        );
      }
    };

    if (isPromotion) {
      createBoard();
      showPromotionUI(row, col, playerTurn, (chosenPiece) => {
        boardState[row][col] = chosenPiece;
        finalizeTurn();
      });
    } else {
      finalizeTurn();
    }
  } else {
    selectedSquare = null;
    createBoard();
  }
}

function findKing(board, color) {
  const kingChar = color === "white" ? "K" : "k";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === kingChar) return { row: r, col: c };
    }
  }
  return null;
}

function isSquareUnderAttack(targetRow, targetCol, board, currentPlayerColor) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const pieceChar = board[r][c];
      if (!pieceChar) continue;
      const isWhitePiece = pieceChar === pieceChar.toUpperCase();
      const pieceColor = isWhitePiece ? "white" : "black";
      if (pieceColor === currentPlayerColor) continue;

      const pieceLogic = pieceRegistry[pieceChar];
      if (pieceChar.toLowerCase() === "p") {
        const attackDirection = pieceChar === "p" ? 1 : -1;
        if (
          targetRow === r + attackDirection &&
          (targetCol === c - 1 || targetCol === c + 1)
        )
          return true;
      } else if (
        pieceLogic &&
        pieceLogic.isValidMove(r, c, targetRow, targetCol, board)
      ) {
        return true;
      }
    }
  }
  return false;
}

function isMoveSafe(startRow, startCol, endRow, endCol) {
  const tempBoard = boardState.map((row) => [...row]);
  const pieceChar = tempBoard[startRow][startCol];
  const isWhite = pieceChar === pieceChar.toUpperCase();
  const color = isWhite ? "white" : "black";

  // Simulate En Passant Capture in Safety Check
  if (
    pieceChar.toLowerCase() === "p" &&
    Math.abs(endCol - startCol) === 1 &&
    tempBoard[endRow][endCol] === ""
  ) {
    tempBoard[startRow][endCol] = "";
  }

  tempBoard[endRow][endCol] = pieceChar;
  tempBoard[startRow][startCol] = "";

  const kingLoc = findKing(tempBoard, color);
  if (!kingLoc) return false; // Should not happen
  return !isSquareUnderAttack(kingLoc.row, kingLoc.col, tempBoard, color);
}

function isCheckmate(color) {
  const kingLoc = findKing(boardState, color);
  if (!isSquareUnderAttack(kingLoc.row, kingLoc.col, boardState, color))
    return false;

  // Brute force check all moves... (simplified for brevity)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const pieceChar = boardState[r][c];
      if (!pieceChar) continue;
      const isWhite = pieceChar === pieceChar.toUpperCase();
      if ((color === "white" && !isWhite) || (color === "black" && isWhite))
        continue;

      const logic = pieceRegistry[pieceChar];
      for (let tr = 0; tr < 8; tr++) {
        for (let tc = 0; tc < 8; tc++) {
          if (
            logic.isValidMove(r, c, tr, tc, boardState, enPassantTarget) &&
            isMoveSafe(r, c, tr, tc)
          ) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

function canCastle(startRow, startCol, endRow, endCol, color) {
  console.log("Checking Castle Rights for:", color);
  console.log("Current Rights:", castleRights);

  if (color === "white" && castleRights.whiteKingMoved) {
    console.log("Fail: White King moved");
    return false;
  }
  if (color === "black" && castleRights.blackKingMoved) {
    console.log("Fail: Black King moved");
    return false;
  }

  if (isSquareUnderAttack(startRow, startCol, boardState, color)) {
    console.log("Fail: King in Check");
    return false;
  }

  const isKingside = endCol > startCol;
  if (color === "white") {
    if (isKingside && castleRights.whiteRightRookMoved) {
      console.log("Fail: White Right Rook moved");
      return false;
    }
    if (!isKingside && castleRights.whiteLeftRookMoved) {
      console.log("Fail: White Left Rook moved");
      return false;
    }
  } else {
    if (isKingside && castleRights.blackRightRookMoved) {
      console.log("Fail: Black Right Rook moved");
      return false;
    }
    if (!isKingside && castleRights.blackLeftRookMoved) {
      console.log("Fail: Black Left Rook moved");
      return false;
    }
  }

  const crossCol = isKingside ? 5 : 3;
  if (isSquareUnderAttack(startRow, crossCol, boardState, color)) {
    console.log("Fail: Path crossed check");
    return false;
  }
  if (isSquareUnderAttack(endRow, endCol, boardState, color)) {
    console.log("Fail: Destination is check");
    return false;
  }

  return true;
}

function updateCastlingRights(pieceChar, r, c) {
  if (pieceChar === "K") castleRights.whiteKingMoved = true;
  if (pieceChar === "k") castleRights.blackKingMoved = true;
  if (pieceChar === "R") {
    if (r === 7 && c === 0) castleRights.whiteLeftRookMoved = true;
    if (r === 7 && c === 7) castleRights.whiteRightRookMoved = true;
  }
  if (pieceChar === "r") {
    if (r === 0 && c === 0) castleRights.blackLeftRookMoved = true;
    if (r === 0 && c === 7) castleRights.blackRightRookMoved = true;
  }
}

function showPromotionUI(row, col, color, onSelect) {
  const promotionDiv = document.createElement("div");
  promotionDiv.className = "promotion-menu";

  const options =
    color === "white" ? ["Q", "R", "B", "N"] : ["q", "r", "b", "n"];

  options.forEach((pieceCode) => {
    const btn = document.createElement("div");
    btn.className = "promotion-option";
    btn.innerHTML = pieceIcons[pieceCode];
    btn.onclick = () => {
      promotionDiv.remove();
      onSelect(pieceCode);
    };
    promotionDiv.append(btn);
  });

  const square = document.querySelector(
    `[data-row="${row}"][data-col="${col}"]`,
  );
  square.appendChild(promotionDiv);
}

function getNotation(pieceChar, startRow, startCol, endRow, endCol, isCapture) {
  const pieceUpper = pieceChar.toUpperCase();
  isWhite = pieceChar === pieceUpper;

  if (pieceUpper === "K" && Math.abs(startCol - endCol) === 2) {
    const isKingside = endCol > startCol;
    return isKingside ? "O-O" : "O-O-O";
  }
  let notation = "";

  if (pieceUpper === "P") {
    if (isCapture) {
      notation += squareCoordinates[startRow][startCol].charAt(0);
    }
  } else {
    notation += pieceUpper;
  }

  if (isCapture) {
    notation += "x";
  }

  notation += squareCoordinates[endRow][endCol];

  const opponentColor = isWhite ? "black" : "white";
  const enemyKing = findKing(boardState, opponentColor);

  if (
    isSquareUnderAttack(enemyKing.row, enemyKing.col, boardState, opponentColor)
  ) {
    if (isCheckmate(opponentColor)) {
      notation += "#";
    } else {
      notation += "+";
    }
  }

  return notation;
}

flipBtn.addEventListener("click", () => {
  isFlipped = !isFlipped;
  createBoard();
});
resetBtn.addEventListener("click", () => {
  resetBoard();
  createBoard();
});

createBoard();
