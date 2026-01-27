const gameBoard = document.querySelector("#gameboard");
const flipBtn = document.querySelector("#flip-btn");
let selectedSquare = null;

const pieceRegistry = {
  p: new Pawn("black"),
  P: new Pawn("white"),
  k: new King("black"),
  K: new King("white"),
};

const boardState = [
  ["r", "n", "b", "q", "k", "b", "n", "r"], // Row 0 (Black Major Pieces)
  ["p", "p", "p", "p", "p", "p", "p", "p"], // Row 1 (Black Pawns)
  ["", "", "", "", "", "", "", ""], // Row 2
  ["", "", "", "", "", "", "", ""], // Row 3
  ["", "", "", "", "", "", "", ""], // Row 4
  ["", "", "", "", "", "", "", ""], // Row 5
  ["P", "P", "P", "P", "P", "P", "P", "P"], // Row 6 (White Pawns)
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
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
      gameBoard.append(square);
    });
  });
}

function onSquareClick(row, col) {
  const clickedPieceChar = boardState[row][col];
  const clickedSquareDiv = document.querySelector(`[data-row="${row}"]`);

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
  } else {
    valid = true;
  }
}

flipBtn.addEventListener("click", () => {
  isFlipped = !isFlipped;
  createBoard();
});

createBoard();
