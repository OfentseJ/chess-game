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

function resetBoard() {
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
}

function createBoard() {
  gameBoard.innerHTML = "";

  const order = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  order.forEach((rowIndex) => {
    order.forEach((colIndex) => {
      const square = document.createElement("div");
      square.classList.add("square");

      square.dataset.row = rowIndex;
      square.dataset.col = colIndex;

      const isBeige = (rowIndex + colIndex) % 2 === 0;
      square.classList.add(isBeige ? "beige" : "brown");

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

  // --- Selecting a Piece ---
  if (!selectedSquare) {
    // you can only select a piece, not an empty square
    if (clickedPieceChar === "") return;

    // You can only select your own pieces
    const isWhitePiece = clickedPieceChar === clickedPieceChar.toUpperCase();
    if (playerTurn === "white" && !isWhitePiece) return;
    if (playerTurn === "black" && isWhitePiece) return;

    selectedSquare = { row, col };

    if (clickedSquareDiv) clickedSquareDiv.classList.add("selected");
    return;
  }

  //--- Moving the piece ---
  // 1. Get the piece we are moving
  const startRow = selectedSquare.row;
  const startCol = selectedSquare.col;
  const pieceChar = boardState[startRow][startCol];
  const pieceLogic = pieceRegistry[pieceChar];

  // 2. Validate the move
  let valid = false;
  if (pieceLogic) {
    valid = pieceLogic.isValidMove(startRow, startCol, row, col, boardState);
    if (valid) {
      const safe = isMoveSafe(startRow, startCol, row, col);
      if (!safe) {
        valid = false;
        alert("Illegal move: King would be in check!");
      }
    }
  } else {
    valid = true;
  }

  // 3. Execute Move
  if (valid) {
    boardState[row][col] = pieceChar;
    boardState[startRow][startCol] = "";

    playerTurn = playerTurn === "white" ? "black" : "white";
    isFlipped = !isFlipped;
  }

  selectedSquare = null;
  createBoard();
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

      // Skip empty squares or my own pieces
      if (!pieceChar) continue;

      const isWhitePiece = pieceChar === pieceChar.toUpperCase();
      const pieceColor = isWhitePiece ? "white" : "black";

      if (pieceColor === currentPlayerColor) continue;

      // Check if this opponent piece can hit the target
      const pieceLogic = pieceRegistry[pieceChar];
      if (
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

flipBtn.addEventListener("click", () => {
  isFlipped = !isFlipped;
  createBoard();
});

resetBtn.addEventListener("click", () => {
  resetBoard();
  createBoard();
});

createBoard();
