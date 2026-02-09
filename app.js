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
  ["r", "n", "b", "q", "k", "b", "n", "r"], // Row 0 (Black Major Pieces)
  ["p", "p", "p", "p", "p", "p", "p", "p"], // Row 1 (Black Pawns)
  ["", "", "", "", "", "", "", ""], // Row 2
  ["", "", "", "", "", "", "", ""], // Row 3
  ["", "", "", "", "", "", "", ""], // Row 4
  ["", "", "", "", "", "", "", ""], // Row 5
  ["P", "P", "P", "P", "P", "P", "P", "P"], // Row 6 (White Pawns)
  ["R", "N", "B", "Q", "K", "B", "N", "R"], // Row 7 (White Major Pieces)
];

const pieceIcons = {
  p: "♟",
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  P: "♙",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
};

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

function resetBoard() {
  castleRights = {
    whiteKingMoved: false,
    whiteleftRookMoved: false,
    whiteRightRookMoved: false,
    blackKingMoved: false,
    blackleftRookMoved: false,
    blackRightRookMoved: false,
  };
  boardState = [
    ["r", "n", "b", "q", "k", "b", "n", "r"], // Row 0 (Black Major Pieces)
    ["p", "p", "p", "p", "p", "p", "p", "p"], // Row 1 (Black Pawns)
    ["", "", "", "", "", "", "", ""], // Row 2
    ["", "", "", "", "", "", "", ""], // Row 3
    ["", "", "", "", "", "", "", ""], // Row 4
    ["", "", "", "", "", "", "", ""], // Row 5
    ["P", "P", "P", "P", "P", "P", "P", "P"], // Row 6 (White Pawns)
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ];

  playerTurn = "white";
  isFlipped = false;
  selectedSquare = null;
  enPassantTarget = null;
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
        square.innerHTML = pieceIcons[pieceCode];
        square.classList.add("piece");
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

  // --- Handling Selection & Switching ---
  if (!selectedSquare) {
    if (clickedPieceChar === "") return;

    // Ensure we only select our own pieces
    const isWhitePiece = clickedPieceChar === clickedPieceChar.toUpperCase();
    if (playerTurn === "white" && !isWhitePiece) return;
    if (playerTurn === "black" && isWhitePiece) return;

    selectedSquare = { row, col };
    if (clickedSquareDiv) clickedSquareDiv.classList.add("selected");
    return;
  }

  // ---  Smart Selection Switching ---
  // If we clicked a piece of OUR OWN color, switch selection to that piece instead of trying to capture it.
  if (clickedPieceChar !== "") {
    const isClickedWhite = clickedPieceChar === clickedPieceChar.toUpperCase();
    const isCurrentWhite = playerTurn === "white";

    // If clicked piece matches current player's color
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

  // --- Attempting to Move ---
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
    if (
      pieceChar.toLowerCase() === "p" &&
      col !== startCol &&
      boardState[row][col] === ""
    ) {
      const capturedRow = startRow;
      const captureCol = startCol;
      boardState[capturedRow][captureCol] = "";
    }

    boardState[row][col] = pieceChar;
    boardState[startRow][startCol] = "";

    if (isCastlingMove) {
      const isKingside = col > startCol;
      const rookStartCol = isKingside ? 7 : 0;
      const rookEndCol = isKingside ? 5 : 3;
      const rookChar = boardState[row][rookStartCol];

      boardState[row][rookEndCol] = rookChar;
      boardState[row][rookStartCol] = "";
    }

    updateCastlingRights(pieceChar, startRow, startCol);

    if (pieceChar.toLowerCase() === "p" && Math.abs(row - startRow) === 2) {
      const direction = pieceChar === "P" ? -1 : 1;
      enPassantTarget = { row: startRow + direction, col: col };
    } else {
      enPassantTarget = null;
    }

    // Toggle Turn
    playerTurn = playerTurn === "white" ? "black" : "white";
    isFlipped = !isFlipped;

    selectedSquare = null;
    createBoard();

    // --- CHECKMATE DETECTION ---
    if (isCheckmate(playerTurn)) {
      setTimeout(() => {
        alert(`Checkmate! ${playerTurn === "white" ? "Black" : "White"} wins!`);
      }, 100);
    }
  } else {
    selectedSquare = null;
    createBoard();
  }
}

// Find the coordinates of the King for a specific color;
function findKing(board, color) {
  const kingChar = color === "white" ? "K" : "k";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === kingChar) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

// Check if a specific square is under attack by the opponenet
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
        const attackRow = r + attackDirection;
        const attackColLeft = c - 1;
        const attackColRight = c + 1;

        if (
          targetRow === attackRow &&
          (targetCol === attackColLeft || targetCol === attackColRight)
        ) {
          return true;
        }
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

  if (isSquareUnderAttack(kingLoc.row, kingLoc.col, tempBoard, color)) {
    return false;
  }
  return true;
}

function isCheckmate(color) {
  const kingLoc = findKing(boardState, color);
  if (!isSquareUnderAttack(kingLoc.row, kingLoc.col, boardState, color)) {
    return false;
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const pieceChar = boardState[r][c];
      if (!pieceChar) continue;

      const isWhite = pieceChar === pieceChar.toUpperCase();
      if ((color === "white" && !isWhite) || (color === "black" && isWhite))
        continue;

      for (let tr = 0; tr < 8; tr++) {
        for (let tc = 0; tc < 8; tc++) {
          const logic = pieceRegistry[pieceChar];

          if (
            logic.isValidMove(r, c, tr, tc, boardState) &&
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
  // 1. Has King moved?
  if (color === "white" && castleRights.whiteKingMoved) return false;
  if (color === "black" && castleRights.blackKingMoved) return false;

  // 2. Currently in Check?
  if (isSquareUnderAttack(startRow, startCol, boardState, color)) return false;

  const isKingside = endCol > startCol;

  // 3. Has the specific Rook moved?
  if (color === "white") {
    if (isKingside && castleRights.whiteRightRookMoved) return false;
    if (!isKingside && castleRights.whiteLeftRookMoved) return false;
  } else {
    if (isKingside && castleRights.blackRightRookMoved) return false;
    if (!isKingside && castleRights.blackLeftRookMoved) return false;
  }

  // 4. Passing through Check? (Square king crosses must be safe)
  const crossCol = isKingside ? 5 : 3;
  if (isSquareUnderAttack(startRow, crossCol, boardState, color)) return false;

  // 5. Landing in Check? (Destination must be safe)
  if (isSquareUnderAttack(endRow, endCol, boardState, color)) return false;

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
    if (r === 7 && c === 0) castleRights.blackLeftRookMoved = true;
    if (r === 7 && c === 7) castleRights.blackRightRookMoved = true;
  }
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
