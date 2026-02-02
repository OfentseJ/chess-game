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
  if (pieceLogic) {
    valid = pieceLogic.isValidMove(startRow, startCol, row, col, boardState);
    if (valid) {
      const safe = isMoveSafe(startRow, startCol, row, col);
      if (!safe) {
        valid = false;
        alert("Illegal move: King would be in check!"); // Optional feedback
      }
    }
  }

  // --- Execute Move ---
  if (valid) {
    boardState[row][col] = pieceChar;
    boardState[startRow][startCol] = "";

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
