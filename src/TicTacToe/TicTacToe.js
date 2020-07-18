import io from "socket.io-client/dist/socket.io";

export class TicTacToe {
  gameActive = true;
  player = "X";
  gameState = ["", "", "", "", "", "", "", "", ""];
  winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  statusDisplay = document.querySelector(".game-status");
  socket = io(
    location.hostname === "localhost"
      ? "ws://localhost:3000"
      : "wss://tictactoe-realtime.herokuapp.com"
  );

  // TODO: pass in arguments like: socket, elements, etc...
  constructor() {
    this.bootstrap();
  }

  winMessage() {
    return `Player ${this.player} has won!`;
  }
  drawMessage() {
    return `Draw!`;
  }
  currentTurn() {
    return `It's ${this.player}'s turn`;
  }

  bootstrap() {
    this.statusDisplay.innerHTML = this.currentTurn();

    this.socket.on("gameUpdate", (game, playerId) =>
      this.updateGame(game, playerId)
    );

    this.socket.on("cellClick", (index) => {
      const el = document.querySelector(`.cell:nth-child(${index + 1})`);
      console.log("cellClick received", el, index);
      this.handleCellClick(el, true);
    });

    this.socket.on("resetGame", () => this.handleRestartGame(true));

    document
      .querySelectorAll(".cell")
      .forEach((cell) =>
        cell.addEventListener("click", (event) =>
          this.handleCellClick(event.target)
        )
      );

    document
      .querySelector(".game-restart")
      .addEventListener("click", () => this.handleRestartGame());
  }

  playerChange() {
    this.player = this.player === "X" ? "O" : "X";

    this.statusDisplay.innerHTML = this.currentTurn();
  }

  updateGame({ gameActive, player, gameState }, updatedBy) {
    this.gameActive = gameActive;
    this.player = player;
    this.gameState = gameState;
    console.log("onGameUpdate", { gameActive, player, gameState }, updatedBy);
  }

  emitGameUpdate() {
    this.socket.emit("gameUpdate", {
      gameActive: this.gameActive,
      player: this.player,
      gameState: this.gameState,
    });
  }

  handleCellPlayed(clickedCell, clickedCellIndex, isReceived) {
    this.gameState[clickedCellIndex] = this.player;
    clickedCell.innerHTML = this.player;
    if (isReceived !== true) this.socket.emit("cellClick", clickedCellIndex);
  }

  handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i <= 7; i++) {
      const winCombination = this.winningCombinations[i];
      let a = this.gameState[winCombination[0]];
      let b = this.gameState[winCombination[1]];
      let c = this.gameState[winCombination[2]];
      if (a === "" || b === "" || c === "") {
        continue;
      }
      if (a === b && b === c) {
        roundWon = true;
        break;
      }
    }

    if (roundWon) {
      this.statusDisplay.innerHTML = this.winMessage();
      this.gameActive = false;
      return;
    }

    let roundDraw = !this.gameState.includes("");
    if (roundDraw) {
      this.statusDisplay.innerHTML = this.drawMessage();
      this.gameActive = false;
      return;
    }

    this.playerChange();
  }

  handleCellClick(clickedCell, isReceived) {
    const clickedCellIndex = parseInt(
      clickedCell.getAttribute("data-cell-index")
    );

    if (this.gameState[clickedCellIndex] !== "" || !this.gameActive) {
      return;
    }

    this.handleCellPlayed(clickedCell, clickedCellIndex, isReceived);
    this.handleResultValidation();
    if (isReceived !== true) this.emitGameUpdate();
  }

  handleRestartGame(isReceived) {
    this.gameActive = true;
    this.player = "X";
    this.gameState = ["", "", "", "", "", "", "", "", ""];
    this.statusDisplay.innerHTML = this.currentTurn();
    document.querySelectorAll(".cell").forEach((cell) => (cell.innerHTML = ""));
    if (isReceived !== true) this.socket.emit("resetGame");
  }
}

export default TicTacToe;
