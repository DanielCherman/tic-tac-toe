let gameInitalSnapshot = {
  gameActive: true,
  player: "X",
  gameState: ["", "", "", "", "", "", "", "", ""],
};

let game = {
  gameActive: true,
  player: "X",
  gameState: ["", "", "", "", "", "", "", "", ""],
};

const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use("/", require("express").static(path.join(__dirname, "dist")));

const gameUpdate = (state, playerId) => {
  io.emit("gameUpdate", state, playerId);
  game = state;
  console.log("gameUpdate", state, playerId);
};

const cellClick = (index, playerId) => {
  io.emit("cellClick", index, playerId);
  console.log("cellClick", index, playerId);
};

const resetGame = (playerId) => {
  game = gameInitalSnapshot;
  io.emit("resetGame", playerId);
  console.log("resetGame", playerId);
};

io.on("connection", (socket) => {
  console.log("player connected:", socket.id);
  resetGame("system");
  socket.emit("gameUpdate", game);
  socket.on("gameUpdate", (game) => gameUpdate(game, socket.id));
  socket.on("cellClick", (index) => cellClick(index, socket.id));
  socket.on("resetGame", () => resetGame(socket.id));
});

http.listen(process.env.PORT || 3000, () => {
  console.log("listening on *:3000");
});
