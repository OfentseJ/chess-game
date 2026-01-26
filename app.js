const gameBoard = document.querySelector("#gameboard");
const flipBtn = document.querySelector("#flip-btn");

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

flipBtn.addEventListener("click", () => {
  isFlipped = !isFlipped;
  createBoard();
});

createBoard();
