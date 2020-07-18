import "regenerator-runtime/runtime";
import io from "socket.io-client/dist/socket.io";
const socket = io("ws://localhost:3000");
const statusDisplay = document.querySelector(".game-status");

window.gameActive = true;
window.player = "X";
window.gameState = ["", "", "", "", "", "", "", "", ""];

const winMessage = () => `Player ${player} has won!`;
const drawMessage = () => `Game ended in a draw!`;
const currentTurn = () => `It's ${player}'s turn`;

statusDisplay.innerHTML = currentTurn();

const winningCombonations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function onGameUpdate({ gameActive, player, gameState }, updatedBy) {
  window.gameActive = gameActive;
  window.player = player;
  window.gameState = gameState;
  console.log("onGameUpdate", { gameActive, player, gameState }, updatedBy);
}

function emitGameUpdate() {
  socket.emit("gameUpdate", {
    gameActive: window.gameActive,
    player: window.player,
    gameState: window.gameState,
  });
}

socket.on("gameUpdate", onGameUpdate);

window.emitGameUpdate = emitGameUpdate;

function handleCellPlayed(clickedCell, clickedCellIndex) {
  gameState[clickedCellIndex] = player;
  clickedCell.innerHTML = player;
}

function playerChange() {
  player = player === "X" ? "O" : "X";
  statusDisplay.innerHTML = currentTurn();
}

function handleResultValidation() {
  let roundWon = false;
  for (let i = 0; i <= 7; i++) {
    const winCombination = winningCombonations[i];
    let a = gameState[winCombination[0]];
    let b = gameState[winCombination[1]];
    let c = gameState[winCombination[2]];
    if (a === "" || b === "" || c === "") {
      continue;
    }
    if (a === b && b === c) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    statusDisplay.innerHTML = winMessage();
    gameActive = false;
    return;
  }

  let roundDraw = !gameState.includes("");
  if (roundDraw) {
    statusDisplay.innerHTML = drawMessage();
    gameActive = false;
    return;
  }

  playerChange();
}

function handleCellClick(clickedCellEvent) {
  const clickedCell = clickedCellEvent.target;
  const clickedCellIndex = parseInt(
    clickedCell.getAttribute("data-cell-index")
  );

  if (gameState[clickedCellIndex] !== "" || !gameActive) {
    return;
  }

  handleCellPlayed(clickedCell, clickedCellIndex);
  handleResultValidation();
}

function handleRestartGame() {
  gameActive = true;
  player = "X";
  gameState = ["", "", "", "", "", "", "", "", ""];
  statusDisplay.innerHTML = currentTurn();
  document.querySelectorAll(".cell").forEach((cell) => (cell.innerHTML = ""));
}

document
  .querySelectorAll(".cell")
  .forEach((cell) => cell.addEventListener("click", handleCellClick));
document
  .querySelector(".game-restart")
  .addEventListener("click", handleRestartGame);
